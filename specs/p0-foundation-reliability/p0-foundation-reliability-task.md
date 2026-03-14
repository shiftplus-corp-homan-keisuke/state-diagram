# P0 Foundation Reliability Tasks

## Status
- Status: 未着手
- Blocking Issues: 仕様差分未解消、テスト基盤未整備

## Work Items
- [ ] `docs/JSON仕様書.md` の現仕様をレビューし、実装との差分表を作る
- [ ] `front/src/types/diagram.ts` を基準に最終仕様を確定する
- [ ] `docs/JSON作成ガイド.md` を仕様確定後に更新する
- [ ] `docs/test_async.json` を仕様に合わせて更新する
- [ ] `docs/test_multi_flow.json` を仕様に合わせて更新する
- [ ] `docs/test_condition.json` を仕様に合わせて更新する
- [ ] import validator モジュールを追加する
- [ ] `JsonModal` から validator を呼び出す
- [ ] 参照整合性エラー/警告の文言を設計する
- [ ] import 結果の success/warning/error UI を追加する
- [ ] error 時は `適用` ボタンを無効化する
- [ ] warning 時の適用条件と表示文言を決める
- [ ] import 結果サマリ（actor/state/flow/condition/error/warning/skip/fix）を表示する
- [ ] 保存状態表示（未保存/保存済み/変更あり）を設計する
- [ ] 保存状態表示を編集画面へ追加する
- [ ] `SequenceDiagram` で異常データ表示ルールを追加する
- [ ] Radix Dialog の Description/aria 警告を解消する
- [ ] テストランナーと必要依存関係を追加する
- [ ] validator のテストを追加する
- [ ] `diagramStore` の整合性テストを追加する
- [ ] `database` の roundtrip テストを追加する
- [ ] import の主要フローをテストする
- [ ] import ボタン活性/非活性のテストを追加する
- [ ] 保存状態表示のテストを追加する
- [ ] `npm run lint` を確認する
- [ ] `npm run build` を確認する
- [ ] `npm run test` を確認する

## Verification Notes
- import 失敗時に「何が悪いか」が日本語で分かること
- warning 付き成功時に補正/欠損内容が分かること
- 参照切れを含む JSON が silently accepted されないこと
- error のときは適用できず、warning のときだけ条件付きで適用できること
- 保存状態が UI 上で常に判別できること

## Next Handoff
- 次着手者は差分表の作成から開始する
- 実装前に validator の責務境界を決める
- ブラウザ確認結果を踏まえ、`JsonModal` と保存状態表示の UX を先に詰める
