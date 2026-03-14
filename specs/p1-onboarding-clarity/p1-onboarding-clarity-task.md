# P1 Onboarding Clarity Tasks

## Status
- Status: 未着手
- Dependency: P0 完了

## Work Items
- [ ] 現行 `docs/JSON作成ガイド.md` の不足点を列挙する
- [ ] 良い JSON / 悪い JSON の例を追加する
- [ ] 機能単位の JSON 分割ルールを追記する
- [ ] actor/state/flow/condition の命名ルールを追記する
- [ ] 新しいメタ情報フィールドを仕様書へ追加する
- [ ] `front/src/types/diagram.ts` にメタ情報型を追加する
- [ ] validator/import/export を新メタ情報へ対応させる
- [ ] JSON import ダイアログに操作説明を追加する
- [ ] ファイル選択と直接貼り付けの使い分けを UI で明示する
- [ ] import 後レビュー UI を追加する
- [ ] 編集画面に feature summary / key states を表示する
- [ ] 図の読み方ガイド（trigger → state change → async/condition）を追加する
- [ ] 重要 state / async / side effect / condition の強調ルールを実装する
- [ ] 削除時の影響確認 UI を実装する
- [ ] P1 対象のテストを追加する
- [ ] `npm run lint` を確認する
- [ ] `npm run build` を確認する
- [ ] `npm run test` を確認する

## Verification Notes
- 初見ユーザーが JSON 読込後 1 画面目で機能の概要を理解できること
- 「どこから見ればよいか」が UI から推測できること
- import 導線だけを見て、ファイル入力と貼り付け入力の使い分けが分かること

## Next Handoff
- 次着手者は P0 が完了していることを確認し、メタ情報仕様の確定から開始する
- ブラウザ確認結果として import 導線説明と読み方ガイドの必要性が高いことを前提に進める
