# Qommons IN Implementation Plan

**Goal:** 社長が90秒で知見の循環を体験できる行政職員SNSの超MVP。
**Architecture:** Next.js App Router + React client components。ローカル永続状態、静的シナリオAI。外部認証・DBなし。
**Tech Stack:** Next.js / TypeScript / React / Lucide / CSS.
**Spec:** REQUEST.md（ユーザー提供）。

## Constraints and choices

- LinkedIn参考の密度。1280–1440pxで232 / 580 / 300pxの3カラム。
- #176B52、#67C59F、#F5F7F6。添付Polimillロゴを変形せず利用。
- SNS投稿は未検証、責任者承認パッケージと区別。全データは架空、AIはシナリオ、レポジトリは2027年4月公開予定構想。
- PDFは未提供。記載されたフローを採用。
- GitHubは空で接続権限はpullのみ。独立した作業ブランチとソース一式を納品。

## Review focus

永続データ破損・容量超過、空白投稿、フィルター0件、スマホ横溢れ、AIから戻った際の下書きと関連パッケージの保持。

## Tasks

- [x] 1. lib/model.ts: 永続状態の検証、投稿作成、検索、差分判定。tests/model.test.tsを先に実行し失敗を確認。
- [x] 2. lib/data.ts / components/feed.tsx / app/globals.css: 10件の投稿、ヘッダー、プロフィール、情報カード、作成・コメント・反応・引用・保存。
- [x] 3. components/repository.tsx / components/ai-panel.tsx: 分野検索、詳細、承認状態、分岐フロー、差分確認、改善案。
- [x] 4. components/app-shell.tsx: ネットワーク・プロフィール・通知・イベント・コミュニティ、ナビゲーション、レスポンシブ。
- [x] 5. テスト、型チェック、ビルド、ブラウザで90秒循環と永続性とモバイルを検証。README、配布ZIP、Git反映手順。

## Verification

`npm test`, `npm run typecheck`, `npm run build`, `npm run test:e2e`。画面を1440 / 1280 / 390pxで確認。

## Completion record

8 unit tests pass; typecheck passes; production build passes. Browser QA / E2E were not run: local routing unavailable, private preview requires login, user explicitly chose to skip visual verification. Review found malformed optional persisted fields and missing mobile Saved navigation; both fixed. JSON/CSV export format regressions reproduced and fixed. No GitHub push permission. Owner-private Sites preview published; source retained separately.
