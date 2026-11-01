import fs from "node:fs";
import { randomBytes, scryptSync } from "node:crypto";
import { createInterface } from "node:readline/promises";
import { Writable } from "node:stream";
let muted = false;
const output = new Writable({
  write(chunk, encoding, callback) {
    if (!muted) process.stdout.write(chunk, encoding);
    callback();
  },
});
const rl = createInterface({ input: process.stdin, output, terminal: true });
try {
  const email = (await rl.question("Login email: ")).trim().toLowerCase();
  if (!email.includes("@")) throw new Error("Enter a valid email address");
  process.stdout.write("Login password (hidden): ");
  muted = true;
  const password = await rl.question("");
  muted = false;
  process.stdout.write("\n");
  if (password.length < 10) throw new Error("Use at least 10 characters");
  const salt = randomBytes(16).toString("hex");
  const values =
    "QOMMONS_LOGIN_EMAIL=" +
    email +
    "\nQOMMONS_PASSWORD_HASH=scrypt:" +
    salt +
    ":" +
    scryptSync(password, salt, 64).toString("hex") +
    "\nQOMMONS_SESSION_SECRET=" +
    randomBytes(48).toString("base64url") +
    "\n";
  if (fs.existsSync(".env.local")) {
    const answer = await rl.question(
      "Replace existing local authentication configuration? [y/N] ",
    );
    if (answer.trim().toLowerCase() !== "y")
      throw new Error("No files changed");
  }
  fs.writeFileSync(".env.local", values, { mode: 0o600 });
  console.log(
    "Saved private server configuration to .env.local. Do not commit this file.",
  );
} finally {
  muted = false;
  rl.close();
}
