import { createHash, randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { SignJWT, jwtVerify } from "jose";
const derive = promisify(scrypt);
export const SESSION_SECONDS = 8 * 60 * 60;
export const SESSION_COOKIE = "qommons_session";
export type AuthConfig = {
  email: string;
  passwordHash: string;
  sessionSecret: string;
};
const HASH = /^scrypt:[a-f0-9]{32,64}:[a-f0-9]{128}$/;
const normalize = (s: string) => s.trim().toLowerCase();
const digest = (s: string) => createHash("sha256").update(s).digest();
const subject = (c: AuthConfig) =>
  digest(normalize(c.email) + ":" + c.passwordHash).toString("hex");
export function getAuthConfig(
  env: Record<string, string | undefined> = process.env,
): AuthConfig | null {
  const email = env.QOMMONS_LOGIN_EMAIL,
    passwordHash = env.QOMMONS_PASSWORD_HASH,
    sessionSecret = env.QOMMONS_SESSION_SECRET;
  if (
    !email ||
    !email.includes("@") ||
    !passwordHash ||
    !HASH.test(passwordHash) ||
    !sessionSecret ||
    sessionSecret.length < 32
  )
    return null;
  return { email: normalize(email), passwordHash, sessionSecret };
}
export async function authenticate(
  email: unknown,
  password: unknown,
  c: AuthConfig,
): Promise<boolean> {
  if (
    typeof email !== "string" ||
    typeof password !== "string" ||
    email.length > 254 ||
    password.length < 1 ||
    password.length > 256 ||
    !HASH.test(c.passwordHash)
  )
    return false;
  const [, salt, hex] = c.passwordHash.split(":");
  const result = (await derive(password, salt, 64)) as Buffer;
  const validPassword = timingSafeEqual(result, Buffer.from(hex, "hex"));
  const validEmail = timingSafeEqual(
    digest(normalize(email)),
    digest(normalize(c.email)),
  );
  return validPassword && validEmail;
}
export async function createSession(
  c: AuthConfig,
  now = new Date(),
): Promise<string> {
  if (c.sessionSecret.length < 32)
    throw new Error("Invalid session configuration");
  const iat = Math.floor(now.getTime() / 1000);
  return new SignJWT({})
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setIssuer("qommons-in")
    .setAudience("qommons-in-app")
    .setSubject(subject(c))
    .setJti(randomBytes(16).toString("hex"))
    .setIssuedAt(iat)
    .setExpirationTime(iat + SESSION_SECONDS)
    .sign(new TextEncoder().encode(c.sessionSecret));
}
export async function verifySession(
  token: string | undefined,
  c: AuthConfig,
  now = new Date(),
): Promise<boolean> {
  if (!token || token.length > 2048 || c.sessionSecret.length < 32)
    return false;
  try {
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(c.sessionSecret),
      {
        algorithms: ["HS256"],
        issuer: "qommons-in",
        audience: "qommons-in-app",
        currentDate: now,
      },
    );
    return (
      payload.sub === subject(c) &&
      typeof payload.iat === "number" &&
      typeof payload.exp === "number" &&
      payload.exp - payload.iat <= SESSION_SECONDS &&
      payload.iat <= Math.floor(now.getTime() / 1000) + 60
    );
  } catch {
    return false;
  }
}
export class AttemptLimiter {
  private entries = new Map<string, { count: number; until: number }>();
  constructor(
    private max = 5,
    private windowMs = 10 * 60 * 1000,
  ) {}
  reset(key: string): void {
    this.entries.delete(key);
  }
  allow(key: string, now = Date.now()): boolean {
    let item = this.entries.get(key);
    if (!item || item.until <= now) {
      if (this.entries.size >= 1000) {
        for (const [k, v] of this.entries)
          if (v.until <= now) this.entries.delete(k);
        if (this.entries.size >= 1000)
          this.entries.delete(this.entries.keys().next().value!);
      }
      item = { count: 0, until: now + this.windowMs };
      this.entries.set(key, item);
    }
    item.count++;
    return item.count <= this.max;
  }
}
