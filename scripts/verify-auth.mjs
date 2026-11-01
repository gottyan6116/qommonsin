import assert from "node:assert/strict";
import { createServer } from "node:http";
import { scryptSync } from "node:crypto";
import fs from "node:fs";
import next from "next";
process.env.NODE_ENV = "production";
process.env.QOMMONS_LOGIN_EMAIL = "integration@example.test";
const testPassword = "integration-test-only-password";
const salt = "0123456789abcdef0123456789abcdef";
process.env.QOMMONS_PASSWORD_HASH =
  "scrypt:" + salt + ":" + scryptSync(testPassword, salt, 64).toString("hex");
process.env.QOMMONS_SESSION_SECRET =
  "integration-test-secret-not-for-real-deployments-12345";
const app = next({ dev: false, dir: process.cwd() });
await app.prepare();
const handler = app.getRequestHandler();
const server = createServer((req, res) => handler(req, res));
await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
const origin = "http://127.0.0.1:" + server.address().port;
let checks = 0;
const ok = () => checks++;
try {
  let res = await fetch(origin + "/", { redirect: "manual" });
  assert.equal(res.status, 307);
  assert.match(res.headers.get("location") || "", /\/login$/);
  ok();
  res = await fetch(origin + "/login");
  const html = await res.text();
  assert.equal(res.status, 200);
  assert.match(html, /backdrop-filter/);
  assert.doesNotMatch(html, /integration-test-only-password/);
  const nonce = res.headers
    .get("content-security-policy")
    .match(/script-src 'nonce-([^']+)'/)[1];
  assert.ok(html.includes('nonce="' + nonce + '"'));
  const script = html.match(/<script[^>]*>([\s\S]*?)<\/script>/)[1];
  new Function(script);
  ok();
  const asset = fs
    .readdirSync(".next/static/chunks")
    .find((name) => name.endsWith(".js"));
  res = await fetch(
    origin + "/_next/static/chunks/" + encodeURIComponent(asset),
    { redirect: "manual" },
  );
  assert.equal(res.status, 307);
  ok();
  res = await fetch(origin + "/avatars/me.jpg", { redirect: "manual" });
  assert.equal(res.status, 307);
  ok();
  res = await fetch(origin + "/login", {
    method: "POST",
    headers: {
      Origin: "https://another.example",
      "Content-Type": "application/json",
    },
    body: "{}",
  });
  assert.equal(res.status, 403);
  ok();
  res = await fetch(origin + "/login", {
    method: "POST",
    headers: { Origin: origin, "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "integration@example.test",
      password: testPassword,
    }),
  });
  assert.equal(
    res.status,
    200,
    "same-origin login failed: " + (await res.clone().text()),
  );
  const cookie = res.headers.get("set-cookie");
  assert.match(cookie, /HttpOnly/i);
  assert.match(cookie, /Secure/i);
  assert.match(cookie, /SameSite=Lax/i);
  ok();
  const session = cookie.split(";")[0];
  res = await fetch(origin + "/", {
    headers: { Cookie: session },
    redirect: "manual",
  });
  assert.equal(res.status, 200);
  assert.match(await res.text(), /Qommons/);
  ok();
  res = await fetch(
    origin + "/_next/static/chunks/" + encodeURIComponent(asset),
    { headers: { Cookie: session }, redirect: "manual" },
  );
  assert.equal(res.status, 200);
  ok();
  res = await fetch(origin + "/login", {
    method: "DELETE",
    headers: { Origin: origin, Cookie: session },
  });
  assert.equal(res.status, 200);
  assert.match(res.headers.get("set-cookie"), /Max-Age=0/);
  ok();
  res = await fetch(origin + "/", { redirect: "manual" });
  assert.equal(res.status, 307);
  ok();
  console.log("Production HTTP authentication checks passed: " + checks);
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
} finally {
  server.closeAllConnections();
  await new Promise((resolve) => server.close(resolve));
  await app.close();
}
