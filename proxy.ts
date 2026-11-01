import { NextRequest, NextResponse } from "next/server";
import { getAuthConfig, verifySession, SESSION_COOKIE } from "./lib/auth";
export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const config = getAuthConfig();
  const valid = config
    ? await verifySession(request.cookies.get(SESSION_COOKIE)?.value, config)
    : false;
  if (
    pathname === "/login" ||
    pathname === "/polimill-logo.png" ||
    pathname === "/favicon.ico"
  )
    return NextResponse.next();
  if (!valid) {
    const response = NextResponse.redirect(new URL("/login", request.url));
    response.headers.set("Cache-Control", "no-store");
    return response;
  }
  const response = NextResponse.next();
  response.headers.set("Cache-Control", "private, no-store, max-age=0");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "same-origin");
  return response;
}
