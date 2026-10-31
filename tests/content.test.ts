import { test } from "node:test";
import assert from "node:assert/strict";
import { elementContent } from "../components/repository";
import { packages } from "../lib/data";
test("エージェント定義のサンプルはJSONとして読み込める", () => {
  const text = elementContent(packages[0], 2, ["受付", "審査"]);
  assert.doesNotThrow(() => JSON.parse(text));
  assert.equal(JSON.parse(text).human_approval_required, true);
});
test("成果物CSVの先頭行が正しい見出しになっている", () => {
  const text = elementContent(packages[0], 4, ["受付", "審査"]);
  assert.equal(text.split("\n")[0], "確認項目,確認結果,根拠資料,担当者メモ");
});
