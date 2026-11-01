import { test, expect } from "@playwright/test";
test.beforeEach(async ({ page }) => {
  const base = process.env.BASE_URL || "http://127.0.0.1:3105";
  const login = await page.request.post(base + "/login", {
    headers: { Origin: new URL(base).origin },
    data: {
      email: process.env.TEST_LOGIN_EMAIL || "browser-test@example.test",
      password: process.env.TEST_LOGIN_PASSWORD || "browser-test-only-password",
    },
  });
  expect(login.ok()).toBe(true);
  await page.goto("/");
  await expect(page.getByTestId("post-p1")).toBeVisible();
});
test("90秒の知恵の循環と投稿の永続化", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await expect(page.getByTestId("post-p1")).toContainText("朝凪市でも同じ課題");
  await page
    .getByTestId("post-p1")
    .getByRole("button", { name: /関連AXパッケージ/ })
    .click();
  await expect(
    page.getByRole("heading", { name: "給付金申請受付・審査", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText("補正のご案内・再提出", { exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "この型を使ってみる" }).click();
  await page.getByRole("button", { name: "自庁との差分を確認する" }).click();
  await expect(page.getByText("2つの運用差分を確認しました")).toBeVisible();
  await page.getByRole("button", { name: "改善案を投稿する" }).click();
  await expect(page.getByRole("textbox", { name: "投稿本文" })).toHaveValue(
    /スキャン・転記確認/,
  );
  await page.getByRole("button", { name: "投稿する", exact: true }).click();
  await expect(page.locator("article.post").first()).toContainText(
    "【改善提案】",
  );
  await page.reload();
  await expect(page.locator("article.post").first()).toContainText(
    "スキャン・転記確認",
  );
  expect(errors).toEqual([]);
});
test("いいね・コメント・保存・モバイルの保存項目への導線", async ({ page }) => {
  const post = page.getByTestId("post-p1");
  await post.getByRole("button", { name: "いいね", exact: true }).click();
  await expect(
    post.getByRole("button", { name: "いいね", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await post
    .getByRole("textbox", { name: "コメントを入力" })
    .fill("自庁でも確認します。");
  await post.getByRole("button", { name: "コメントを送信" }).click();
  await expect(post).toContainText("自庁でも確認します。");
  await post.getByRole("button", { name: "保存", exact: true }).click();
  await page
    .getByRole("navigation")
    .getByRole("button", { name: "プロフィール", exact: true })
    .click();
  await page
    .locator(".profile-dropdown")
    .getByRole("button", { name: "保存済み項目" })
    .click();
  await expect(
    page.getByRole("heading", { name: "保存済み項目" }),
  ).toBeVisible();
  await expect(page.getByTestId("post-p1")).toBeVisible();
});
test("レポジトリ検索・フィルター・空状態", async ({ page }) => {
  await page.getByRole("button", { name: "AXレポジトリ", exact: true }).click();
  await page.getByRole("button", { name: "福祉・子育て", exact: true }).click();
  await expect(page.locator(".package-card")).toHaveCount(1);
  await page
    .getByRole("textbox", { name: "AXパッケージを検索" })
    .fill("存在しない業務");
  await expect(page.getByText("条件に合う業務の型がありません")).toBeVisible();
  await page.getByRole("button", { name: "検索条件をリセット" }).click();
  await expect(page.locator(".package-card")).toHaveCount(6);
});
test("画像添付プレビューと空白投稿の拒否", async ({ page }) => {
  await page
    .getByRole("button", { name: "いまの気づきや、課題を共有しませんか？" })
    .click();
  await page.getByRole("textbox", { name: "投稿本文" }).fill("   ");
  await expect(
    page.getByRole("button", { name: "投稿する", exact: true }),
  ).toBeDisabled();
  await page
    .getByLabel("画像ファイル")
    .setInputFiles("public/polimill-logo.png");
  await expect(page.getByAltText("添付画像プレビュー")).toBeVisible();
  await page
    .getByRole("textbox", { name: "投稿本文" })
    .fill("写真から共有する、業務改善のヒント");
  await page.getByRole("button", { name: "投稿する", exact: true }).click();
  await expect(
    page.locator("article.post").first().getByAltText("投稿に添付された画像"),
  ).toBeVisible();
});
test("表示幅に横のはみ出しがない", async ({ page }) => {
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page.getByRole("button", { name: "AXレポジトリ", exact: true }).click();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
});
