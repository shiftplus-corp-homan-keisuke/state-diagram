# P0 Foundation Reliability Tasks

## Status
- Status: 完了
- Blocking Issues: なし

## Work Items
- [x] `docs/JSON仕様書.md` の現仕様をレビューし、実装との差分表を作る
- [x] `front/src/types/diagram.ts` を基準に最終仕様を確定する
- [x] `docs/JSON作成ガイド.md` を仕様確定後に更新する
- [x] `docs/test_async.json` を仕様に合わせて更新する
- [x] `docs/test_multi_flow.json` を仕様に合わせて更新する
- [x] `docs/test_condition.json` を仕様に合わせて更新する
- [x] import validator モジュールを追加する
- [x] `JsonModal` から validator を呼び出す
- [x] 参照整合性エラー/警告の文言を設計する
- [x] import 結果の success/warning/error UI を追加する
- [x] error 時は `適用` ボタンを無効化する
- [x] warning 時の適用条件と表示文言を決める
- [x] import 結果サマリ（actor/state/flow/condition/error/warning/skip/fix）を表示する
- [x] 保存状態表示（未保存/保存済み/変更あり）を設計する
- [x] 保存状態表示を編集画面へ追加する
- [x] `SequenceDiagram` で異常データ表示ルールを追加する
- [x] Radix Dialog の Description/aria 警告を解消する
- [x] テストランナーと必要依存関係を追加する
- [x] validator のテストを追加する
- [x] `diagramStore` の整合性テストを追加する
- [x] `database` の roundtrip テストを追加する
- [x] import の主要フローをテストする
- [x] import ボタン活性/非活性のテストを追加する
- [x] 保存状態表示のテストを追加する
- [x] `npm run lint` を確認する
- [x] `npm run build` を確認する
- [x] `npm run test` を確認する

## Verification Notes
- import 失敗時に「何が悪いか」が日本語で分かること
- warning 付き成功時に補正/欠損内容が分かること
- 参照切れを含む JSON が silently accepted されないこと
- error のときは適用できず、warning のときだけ条件付きで適用できること
- 保存状態が UI 上で常に判別できること

## Next Handoff
- P0 は完了。次着手者は `specs/p1-onboarding-clarity/p1-onboarding-clarity-plan.md` を読んで P1 に進む
- P0 で実装済み: docs/型整合、validator、warning/error UI、保存状態表示、SequenceDiagram 異常表示、Dialog 警告解消、DB roundtrip test
- 最終確認済み: `npm run lint`, `npm run build`, `npm run test` 全通過（16 tests passed）
