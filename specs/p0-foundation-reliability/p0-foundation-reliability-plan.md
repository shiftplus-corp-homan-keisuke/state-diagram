# P0 Foundation Reliability

## Goal
JSON 仕様・実装型・import・可視化の信頼性を揃え、このアプリを「最低限安心して使える状態」にする。

## Tasks
- [ ] 仕様差分を洗い出して `docs/JSON仕様書.md` と `front/src/types/diagram.ts` を統一する → Verify: 主要フィールド、enum、参照ルール、日付仕様に差分がない
- [ ] `docs/JSON作成ガイド.md` と `docs/test_*.json` を新仕様へ合わせて更新する → Verify: サンプル JSON が仕様を満たす
- [ ] import 用の厳密バリデーション層を追加する → Verify: 不正 JSON が理由付きで拒否される
- [ ] 参照整合性チェックを追加する → Verify: 存在しない actor/state/condition 参照を検出できる
- [ ] import 成功/警告/失敗の結果表示を実装する → Verify: ユーザーが読込品質を判断でき、error 時は適用不可・warning 時のみ適用可になる
- [ ] import 結果サマリを実装する → Verify: actor/state/flow/condition/error/warning/skip/fix 件数を確認できる
- [ ] 保存状態の可視化を追加する → Verify: 未保存/保存済み/変更あり が画面上で分かる
- [ ] 可視化で異常データを明示する → Verify: 欠損参照やスキップ要素が UI 上で分かる
- [ ] Dialog 系アクセシビリティ警告を解消する → Verify: Radix Dialog の Description 警告が出ない
- [ ] 最低限のテスト基盤と回帰テストを追加する → Verify: validator/store/db/import の失敗を自動検知できる
- [ ] lint/build/test の実行手順を確定する → Verify: 完了時に統一コマンドで検証できる

## Recommended Order
1. 仕様統一
2. サンプル/ガイド更新
3. バリデーション
4. 警告/異常 UI
5. テスト
6. 最終検証

## Notes
- P0 では新機能拡張よりも整合性と信頼性を優先する
- import バリデーションは UI から分離し、テストしやすい純関数または独立モジュールに寄せる
- ブラウザ確認により、`不正JSONでも適用ボタンが押せる`, `保存状態が分かりにくい`, `Dialog 警告が出る` ことを確認済み

## Done When
- [ ] 仕様書・型・サンプル JSON が一致している
- [ ] 不正 JSON を安全に拒否できる
- [ ] error/warning/success の適用条件が明確に UI へ反映されている
- [ ] 未保存/保存済み/変更あり が分かる
- [ ] 異常データを誤って正常表示しにくい
- [ ] `npm run lint`, `npm run build`, `npm run test` が通る
