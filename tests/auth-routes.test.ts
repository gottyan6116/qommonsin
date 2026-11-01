import { test } from "node:test";
import assert from "node:assert/strict";
import { scryptSync } from "node:crypto";
import { NextRequest } from "next/server";
import { GET, POST, DELETE } from "../app/login/route";
import { proxy } from "../proxy";
import { SESSION_COOKIE } from "../lib/auth";
process.env.QOMMONS_LOGIN_EMAIL = "demo@example.test";
process.env.QOMMONS_PASSWORD_HASH =
  "scrypt:0123456789abcdef0123456789abcdef:" +
  scryptSync(
    "test-only-password",
    "0123456789abcdef0123456789abcdef",
    64,
  ).toString("hex");
process.env.QOMMONS_SESSION_SECRET =
  "test-only-secret-with-at-least-thirty-two-characters";
const request = (
  path: string,
  method = "GET",
  body?: string,
  origin = "https://qommons.example",
  ip = "test-ip",
) =>
  new NextRequest("https://qommons.example" + path, {
    method,
    headers: {
      origin,
      "content-type": "application/json",
      "x-forwarded-for": ip,
    },
    body,
  });
test("未認証のHTML・JS・画像への直接アクセスをログインへ転送する", async () => {
  for (const path of [
    "/",
    "/_next/static/chunks/app.js",
    "/avatars/me.jpg",
    "/index.html",
  ]) {
    const res = await proxy(request(path));
    assert.equal(res.status, 307);
    assert.equal(res.headers.get("location"), "https://qommons.example/login");
  }
});
test("ログイン画面はグラデーション・フォーム・CSPを含み秘密情報を含まない", async () => {
  const res = await GET(request("/login"));
  const html = await res.text();
  assert.equal(res.status, 200);
  assert.match(html, /メールアドレス/);
  assert.match(html, /パスワード/);
  assert.match(html, /backdrop-filter/);
  assert.match(html, /gradient/);
  assert.doesNotMatch(html, /test-only-password/);
  assert.match(
    res.headers.get("content-security-policy") || "",
    /script-src 'nonce-/,
  );
});
test("ログイン成功時のみHttpOnlyセッションを返し保護された画面に進める", async () => {
  const res = await POST(
    request(
      "/login",
      "POST",
      JSON.stringify({
        email: "demo@example.test",
        password: "test-only-password",
      }),
      "https://qommons.example",
      "ok-ip",
    ),
  );
  assert.equal(res.status, 200);
  const cookie = res.headers.get("set-cookie")!;
  assert.match(cookie, /HttpOnly/);
  assert.match(cookie, /SameSite=lax/i);
  const gate = await proxy(
    new NextRequest("https://qommons.example/", {
      headers: { cookie: cookie.split(";")[0] },
    }),
  );
  assert.equal(gate.status, 200);
});
test("誤った認証と別サイトからの送信は拒否する", async () => {
  const wrong = await POST(
    request(
      "/login",
      "POST",
      JSON.stringify({ email: "demo@example.test", password: "wrong" }),
      "https://qommons.example",
      "wrong-ip",
    ),
  );
  assert.equal(wrong.status, 401);
  assert.equal(wrong.headers.get("set-cookie"), null);
  const cross = await POST(
    request("/login", "POST", "{}", "https://evil.example"),
  );
  assert.equal(cross.status, 403);
});
test("繰り返すログイン試行は429で制限する", async () => {
  for (let i = 0; i < 5; i++)
    await POST(
      request(
        "/login",
        "POST",
        JSON.stringify({ email: "demo@example.test", password: "wrong" }),
        "https://qommons.example",
        "limited-ip",
      ),
    );
  const res = await POST(
    request("/login", "POST", "{}", "https://qommons.example", "limited-ip"),
  );
  assert.equal(res.status, 429);
});
test("ログアウト時にセッションCookieを失効する", async () => {
  const res = await DELETE(request("/login", "DELETE"));
  assert.equal(res.status, 200);
  assert.match(res.headers.get("set-cookie") || "", /Max-Age=0/);
  assert.equal(
    (
      await DELETE(
        request("/login", "DELETE", undefined, "https://evil.example"),
      )
    ).status,
    403,
  );
});

test("Next.jsのループバックURL正規化後も実際の同一Originログインを受け付ける", async () => {
  const req = new NextRequest("http://127.0.0.1:3000/login", {
    method: "POST",
    headers: {
      origin: "http://127.0.0.1:3000",
      host: "127.0.0.1:3000",
      "content-type": "application/json",
      "x-forwarded-for": "loopback-ip",
    },
    body: JSON.stringify({
      email: "demo@example.test",
      password: "test-only-password",
    }),
  });
  assert.equal((await POST(req)).status, 200);
});
