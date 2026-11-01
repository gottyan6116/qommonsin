import { test } from "node:test";
import assert from "node:assert/strict";
import { scryptSync } from "node:crypto";
import {
  authenticate,
  createSession,
  verifySession,
  getAuthConfig,
  AttemptLimiter,
  SESSION_SECONDS,
} from "../lib/auth";
const salt = "0123456789abcdef0123456789abcdef";
const hash =
  "scrypt:" +
  salt +
  ":" +
  scryptSync("test-only-password", salt, 64).toString("hex");
const config = {
  email: "demo@example.test",
  passwordHash: hash,
  sessionSecret: "test-only-secret-with-at-least-thirty-two-characters",
};
test("正しい資格情報のみ受け付け、メールは空白・大文字を正規化する", async () => {
  assert.equal(
    await authenticate(" DEMO@EXAMPLE.TEST ", "test-only-password", config),
    true,
  );
  assert.equal(
    await authenticate("other@example.test", "test-only-password", config),
    false,
  );
  assert.equal(await authenticate(config.email, "wrong", config), false);
});
test("未設定・不正な環境変数は認証設定として受け付けない", () => {
  assert.equal(getAuthConfig({}), null);
  assert.equal(
    getAuthConfig({
      QOMMONS_LOGIN_EMAIL: config.email,
      QOMMONS_PASSWORD_HASH: "plain-password",
      QOMMONS_SESSION_SECRET: config.sessionSecret,
    }),
    null,
  );
  assert.ok(
    getAuthConfig({
      QOMMONS_LOGIN_EMAIL: config.email,
      QOMMONS_PASSWORD_HASH: hash,
      QOMMONS_SESSION_SECRET: config.sessionSecret,
    }),
  );
});
test("署名付きセッションは有効期限内のみ有効", async () => {
  const now = new Date("2026-11-01T00:00:00Z");
  const token = await createSession(config, now);
  assert.equal(await verifySession(token, config, now), true);
  assert.equal(
    await verifySession(
      token,
      config,
      new Date(now.getTime() + SESSION_SECONDS * 1000 + 1),
    ),
    false,
  );
});
test("改ざん・別の秘密鍵・パスワード変更後のセッションを拒否する", async () => {
  const token = await createSession(config);
  assert.equal(
    await verifySession(token.slice(0, -8) + "tampered", config),
    false,
  );
  assert.equal(
    await verifySession(token, {
      ...config,
      sessionSecret: "another-secret-with-at-least-thirty-two-characters",
    }),
    false,
  );
  assert.equal(
    await verifySession(token, { ...config, passwordHash: hash + "0" }),
    false,
  );
  assert.equal(await verifySession(undefined, config), false);
});
test("試行制限は有効期間後に回復する", () => {
  const limiter = new AttemptLimiter(2, 1000);
  assert.equal(limiter.allow("ip-a", 0), true);
  assert.equal(limiter.allow("ip-a", 1), true);
  assert.equal(limiter.allow("ip-a", 2), false);
  assert.equal(limiter.allow("ip-b", 2), true);
  assert.equal(limiter.allow("ip-a", 1001), true);
});

test("成功後に試行回数をリセットできる", () => {
  const limiter = new AttemptLimiter(1, 1000);
  assert.equal(limiter.allow("ip", 0), true);
  assert.equal(limiter.allow("ip", 1), false);
  limiter.reset("ip");
  assert.equal(limiter.allow("ip", 2), true);
});
