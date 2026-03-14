# P1 Onboarding Clarity

## Goal
LLM 生成 JSON の品質を上げ、初見ユーザーが図の意味を短時間で理解できるようにする。

## Tasks
- [ ] `docs/JSON作成ガイド.md` を LLM 向け運用ガイドとして拡張する → Verify: 良い例/悪い例/分割ルール/命名ルールが揃う
- [ ] JSON に理解支援メタ情報を追加する → Verify: feature summary, entry point, key states などを扱える
- [ ] 編集画面または import 後レビュー UI にメタ情報表示を追加する → Verify: 図の前に文脈を理解できる
- [ ] 可視化の強調ルールを改善する → Verify: 重要状態、非同期境界、副作用、分岐点が見やすい
- [ ] import 導線の説明を改善する → Verify: ファイル選択と直接貼り付けの使い分けが分かる
- [ ] 図の読み方ガイドを追加する → Verify: trigger → state change → async/condition の順で理解しやすい
- [ ] import 結果レビュー UI を追加する → Verify: actor/state/flow/condition/error/warning/skip/fix 数をすぐ確認できる
- [ ] 編集時の参照整合性保護を強化する → Verify: 削除時に影響範囲が見え、誤削除しにくい
- [ ] P1 用の回帰テストを追加する → Verify: メタ情報表示とレビュー UI の退行を防げる

## Recommended Order
1. ガイド更新
2. メタ情報仕様確定
3. 型/validator/import/export 更新
4. UI 表示追加
5. 強調ルール追加
6. 整合性保護
7. テスト

## Notes
- P1 は「見やすい」より「理解しやすい」を優先する
- LLM が安定生成しやすい語彙と構造を docs に寄せる

## Done When
- [ ] JSON 作成ガイドだけで LLM 生成品質をある程度安定させられる
- [ ] 初見ユーザーが図の前に機能文脈を理解できる
- [ ] import 手順と図の読み順が UI から自然に理解できる
- [ ] 重要状態と副作用が視覚的に把握しやすい
