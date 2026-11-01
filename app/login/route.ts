import { NextRequest, NextResponse } from "next/server";
import { randomBytes, createHash } from "node:crypto";
import {
  authenticate,
  createSession,
  verifySession,
  getAuthConfig,
  AttemptLimiter,
  SESSION_COOKIE,
  SESSION_SECONDS,
} from "@/lib/auth";
import { loginPage } from "@/lib/login-page";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const limiter = new AttemptLimiter();
const noStore = {
  "Cache-Control": "private, no-store, max-age=0",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "no-referrer",
};
const json = (body: Record<string, unknown>, status = 200) =>
  NextResponse.json(body, { status, headers: noStore });
function sameOrigin(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  try {
    const parsed = new URL(origin);
    const host = request.headers.get("host") || request.nextUrl.host;
    return (
      parsed.origin === origin &&
      parsed.host.toLowerCase() === host.toLowerCase() &&
      parsed.protocol === request.nextUrl.protocol
    );
  } catch {
    return false;
  }
}
export async function GET(request: NextRequest) {
  const config = getAuthConfig();
  if (
    config &&
    (await verifySession(request.cookies.get(SESSION_COOKIE)?.value, config))
  ) {
    const res = NextResponse.redirect(new URL("/", request.url));
    res.headers.set("Cache-Control", "no-store");
    return res;
  }
  const nonce = randomBytes(18).toString("base64");
  return new NextResponse(loginPage(nonce, !!config), {
    headers: {
      ...noStore,
      "Content-Type": "text/html; charset=utf-8",
      "Content-Security-Policy":
        "default-src 'none'; script-src 'nonce-" +
        nonce +
        "'; style-src 'nonce-" +
        nonce +
        "'; img-src 'self'; connect-src 'self'; form-action 'self'; base-uri 'none'; frame-ancestors 'none'",
    },
  });
}
export async function POST(request: NextRequest) {
  if (!sameOrigin(request))
    return json({ error: "この送信元からはログインできません。" }, 403);
  const config = getAuthConfig();
  if (!config)
    return json(
      {
        error:
          "ログインの準備が完了していません。運営担当者にお問い合わせください。",
      },
      503,
    );
  if (!request.headers.get("content-type")?.startsWith("application/json"))
    return json({ error: "入力形式をご確認ください。" }, 415);
  const ip = (request.headers.get("x-forwarded-for") || "unknown")
    .split(",")[0]
    .trim();
  const key = createHash("sha256").update(ip).digest("hex");
  if (!limiter.allow(key)) {
    const res = json(
      {
        error: "試行回数が多いため、10分ほどおいてからもう一度お試しください。",
      },
      429,
    );
    res.headers.set("Retry-After", "600");
    return res;
  }
  let input;
  try {
    const raw = await request.text();
    if (raw.length > 4096)
      return json({ error: "入力内容が長すぎます。" }, 413);
    input = JSON.parse(raw);
  } catch {
    return json({ error: "入力内容をご確認ください。" }, 400);
  }
  if (!input || !(await authenticate(input.email, input.password, config)))
    return json(
      { error: "メールアドレスまたはパスワードが正しくありません。" },
      401,
    );
  limiter.reset(key);
  const res = json({ ok: true });
  res.cookies.set(SESSION_COOKIE, await createSession(config), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_SECONDS,
  });
  return res;
}
export async function DELETE(request: NextRequest) {
  if (!sameOrigin(request))
    return json({ error: "この送信元からはログアウトできません。" }, 403);
  const res = json({ ok: true });
  res.cookies.set(SESSION_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return res;
}
