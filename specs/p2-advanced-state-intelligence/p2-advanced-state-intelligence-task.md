# P2 Advanced State Intelligence Tasks

## Status
- Status: 未着手
- Dependency: P1 完了

## Work Items
- [ ] 拡張したい状態種別の一覧と定義を確定する
- [ ] `docs/JSON仕様書.md` に高度状態モデルを追加する
- [ ] `front/src/types/diagram.ts` を拡張する
- [ ] validator/import/export を高度状態へ対応させる
- [ ] 新しい状態種別の表示ルールを実装する
- [ ] オンボーディング用ガイド UI を追加する
- [ ] 重要ノード/読む順番の案内を追加する
- [ ] JSON 比較 UI と差分計算ロジックを追加する
- [ ] 代表テンプレート JSON とガイドを追加する
- [ ] 半自動生成の入力候補抽出方針を決める
- [ ] 補助生成の最小実装を追加する
- [ ] P2 対象のテストを追加する
- [ ] `npm run lint` を確認する
- [ ] `npm run build` を確認する
- [ ] `npm run test` を確認する

## Verification Notes
- 高度状態を含む JSON を見ても、初見ユーザーが記号や色を解釈できること
- before/after 比較で変更影響が把握しやすいこと

## Next Handoff
- 次着手者は P1 完了を確認し、まず高度状態モデルの語彙設計から始める
