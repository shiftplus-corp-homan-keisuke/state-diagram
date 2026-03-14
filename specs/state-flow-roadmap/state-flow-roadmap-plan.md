# State Flow Roadmap

## Goal
LLM が `docs/JSON仕様書.md` を基に JSON を生成し、このアプリに読み込ませるだけで、新規参入者が特定機能の状態を正しく・素早く理解できる状態にする。

## Scope
- P0: 仕様・入力・表示の信頼性を固める
- P1: 実務導入しやすい理解支援と運用性を追加する
- P2: 状態理解ツールとしての競争力を高める

## Recommended Defaults
- バリデーション: Zod ベースで実装し、必要なら JSON Schema へ展開
- テスト: Vitest + React Testing Library
- 主要検証コマンド: `npm run lint`, `npm run build`, `npm run test`

## Phase Plan
- [ ] P0: `specs/p0-foundation-reliability/` の plan/task を実行する → Verify: 仕様・型・import の整合性が取れ、警告/エラー/テストが成立する
- [ ] P1: `specs/p1-onboarding-clarity/` の plan/task を実行する → Verify: LLM 生成 JSON の品質と初見ユーザーの理解導線が改善される
- [ ] P2: `specs/p2-advanced-state-intelligence/` の plan/task を実行する → Verify: 高度な状態モデル、比較、テンプレート、ガイドが使える

## Dependencies
- P1 は P0 完了後に着手する
- P2 は P1 の主要データモデル・UI 方針確定後に着手する

## Handoff Notes
- 実装開始時はこのファイルを起点に、各 phase の `*-plan.md` と `*-task.md` を順に読む
- 進捗更新は task ファイルのチェックボックスと status メモで管理する
- 新しい会話ではまず `specs/state-flow-roadmap/state-flow-roadmap-plan.md` と対象 phase の task を参照する
- ブラウザ確認で判明した優先課題: `error 時の適用禁止`, `未保存/保存済み状態の可視化`, `import 結果サマリの明文化`, `JSON import 導線説明`, `図の読み方ガイド`

## Done When
- [ ] P0〜P2 の全マイルストーンが完了している
- [ ] 仕様・実装・ドキュメント・テスト・UX が同じ方針で揃っている
- [ ] 新規参入者が JSON 読み込み後に状態を誤読しにくい
