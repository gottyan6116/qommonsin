import { defineConfig } from "@playwright/test";
import { scryptSync } from "node:crypto";
const email = process.env.TEST_LOGIN_EMAIL || "browser-test@example.test";
const password =
  process.env.TEST_LOGIN_PASSWORD || "browser-test-only-password";
if (
  process.env.BASE_URL &&
  (!process.env.TEST_LOGIN_EMAIL || !process.env.TEST_LOGIN_PASSWORD)
)
  throw new Error(
    "Remote E2E requires TEST_LOGIN_EMAIL and TEST_LOGIN_PASSWORD",
  );
const salt = "0123456789abcdef0123456789abcdef";
export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  use: {
    baseURL: process.env.BASE_URL || "http://127.0.0.1:3105",
    channel: "chrome",
    trace: "retain-on-failure",
  },
  projects: [
    { name: "desktop", use: { viewport: { width: 1440, height: 1000 } } },
    {
      name: "mobile",
      use: {
        viewport: { width: 390, height: 844 },
        isMobile: true,
        hasTouch: true,
      },
    },
  ],
  webServer: process.env.BASE_URL
    ? undefined
    : {
        command: "npm run dev -- --port 3105",
        url: "http://127.0.0.1:3105/login",
        reuseExistingServer: false,
        timeout: 120000,
        env: {
          QOMMONS_LOGIN_EMAIL: email,
          QOMMONS_PASSWORD_HASH:
            "scrypt:" +
            salt +
            ":" +
            scryptSync(password, salt, 64).toString("hex"),
          QOMMONS_SESSION_SECRET:
            "browser-test-only-session-secret-at-least-32-characters",
        },
      },
});
