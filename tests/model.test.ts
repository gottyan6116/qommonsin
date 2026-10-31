import { test } from "node:test";
import assert from "node:assert/strict";
import {
  createPost,
  searchPosts,
  assessDifferences,
  restoreState,
} from "../lib/model";
test("空白の投稿を拒否し画像のみの投稿は作成できる", () => {
  assert.equal(createPost("   ", undefined), null);
  assert.equal(
    createPost("", "data:image/png;base64,abc")?.image,
    "data:image/png;base64,abc",
  );
});
test("改善案の本文と関連パッケージを保持する", () => {
  const post = createPost(
    "  紙申請の確認項目を改善します  ",
    undefined,
    "benefit",
  );
  assert.equal(post?.body, "紙申請の確認項目を改善します");
  assert.equal(post?.packageId, "benefit");
});
test("本文・部署・自治体に一致する投稿を検索する", () => {
  const posts = [
    { id: "a", body: "給付金の不備確認", authorId: "a" },
    { id: "b", body: "議案答弁", authorId: "b" },
  ] as any;
  const people = [
    { id: "a", name: "田中", municipality: "みどり市", department: "福祉課" },
    { id: "b", name: "佐藤", municipality: "朝凪市", department: "議会課" },
  ] as any;
  assert.equal(searchPosts(posts, people, "福祉")[0].id, "a");
  assert.equal(searchPosts(posts, people, "　給付金　").length, 1);
  assert.equal(searchPosts(posts, people, "存在しない").length, 0);
});
test("紙申請と庁内審査は両方差分として示す", () => {
  const result = assessDifferences("paper", "internal");
  assert.equal(result.length, 2);
  assert.match(result.join(" "), /紙/);
  assert.match(result.join(" "), /審査/);
});
test("破損・想定外の保存状態は安全な初期状態に戻す", () => {
  assert.equal(restoreState("{broken"), null);
  assert.equal(restoreState('{"posts":[{}]}'), null);
  assert.equal(
    restoreState(
      '{"posts":[],"liked":[],"saved":[],"following":[],"comments":{},"reposted":[]}',
    )?.posts.length,
    0,
  );
});

test("任意フィールドがオブジェクトの保存投稿を拒否する", () => {
  const p = createPost("保存する本文")!;
  for (const field of ["tag", "quote", "image", "visual", "packageId"]) {
    const state = {
      posts: [{ ...p, [field]: { bad: true } }],
      liked: [],
      saved: [],
      following: [],
      comments: {},
      reposted: [],
    };
    assert.equal(restoreState(JSON.stringify(state)), null, field);
  }
});
