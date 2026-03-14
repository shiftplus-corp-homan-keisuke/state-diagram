# JSON作成ガイド

State Flow Visualizer 用 JSON を、人手または LLM で作成するときの実務向けガイドです。現行フロントエンド実装とインポート UI に合わせています。

## 1. 先に決めること

作成前に、次の 3 点を決めます。

- どの機能を対象にするか
- どのシナリオを 1 ファイルで表すか
- どの Actor / State / Flow / Condition を含めるか

### 推奨単位

- 1 JSON = 1 機能、または 1 主要シナリオ
- 複雑な機能はファイルを分割する
- 1 ファイルに unrelated な機能を詰め込みすぎない

例:

- `login.json`: ログイン機能
- `cart-add-item.json`: カート追加
- `cart-checkout.json`: 決済開始

---

## 2. インポート方法を意識して作る

現行アプリでは、JSON インポートを次の 2 通りで行えます。

- JSON ファイルをアップロードする
- ダイアログへ JSON を直接貼り付ける

そのため、LLM に依頼する場合も手書きする場合も、次を守ってください。

- 出力は純粋な JSON のみ
- Markdown のコードフェンスを含めない
- 説明文や前置き、補足文章を JSON の外に混ぜない
- そのまま貼り付け・保存できる形式にする

---

## 3. ルートを作る

最低限、`id` と `name` は必須です。`createdAt` / `updatedAt` は ISO 8601 文字列を推奨します。

```json
{
  "id": "login-flow",
  "name": "ログイン機能",
  "description": "ログインフォーム送信から認証完了まで",
  "createdAt": "2026-03-14T00:00:00.000Z",
  "updatedAt": "2026-03-14T00:00:00.000Z",
  "actors": [],
  "states": [],
  "flows": [],
  "conditions": []
}
```

### 日時のルール

- JSON 上では文字列です
- 形式は ISO 8601 を使います
- アプリ読込時に `Date` へ変換されます
- 仕様書では「JSON としては文字列、読込時に `Date` へ変換」と理解してください

---

## 4. Actor を定義する

まず登場人物を洗い出します。

### `type` の使い分け

- `component`: UI コンポーネント
- `store`: 状態管理ストア
- `service`: API クライアントやロジック層
- `external`: 外部 API、DB、SaaS

### `scope` の扱い

重要: `scope` は `State` ではなく `Actor` に属します。

- `scope` は主に `type: "store"` の Actor に付けます
- `local` / `subtree` / `global` を使います
- 状態の影響範囲を表したいときも、State 側ではなく所有 Actor 側に記述します

### 例

```json
"actors": [
  {
    "id": "login-form",
    "type": "component",
    "name": "LoginForm"
  },
  {
    "id": "auth-store",
    "type": "store",
    "name": "AuthStore",
    "scope": "global"
  },
  {
    "id": "auth-api",
    "type": "service",
    "name": "AuthApi"
  }
]
```

---

## 5. State を定義する

次に、フローの中で意味のある状態を定義します。

### ポイント

- `owner` には必ず Actor ID を入れます
- `scope` は State に書かないでください
- 迷ったら「この値をどの Actor が保持しているか」で owner を決めます

### 例

```json
"states": [
  {
    "id": "current-user",
    "name": "currentUser",
    "owner": "auth-store",
    "dataType": "User | null"
  },
  {
    "id": "is-loading",
    "name": "isLoading",
    "owner": "auth-store",
    "dataType": "boolean"
  }
]
```

---

## 6. Flow を作る

Flow は「何をきっかけに、どこからどこへ、何が起きるか」を並べたものです。

### 6.1 trigger を決める

開始条件を `trigger` に書きます。

例:

```json
"trigger": {
  "type": "userAction",
  "actor": "login-form",
  "action": "click",
  "target": "ログインボタン"
}
```

### 6.2 steps を組み立てる

基本パターンは次です。

- `dispatch`: 命令やイベント送信
- `stateChange`: 状態更新
- `subscribe`: 状態変化の反映
- 必要に応じて `effect`, `render`

### 基本例

```json
"steps": [
  {
    "id": "step-submit-login",
    "type": "dispatch",
    "from": "login-form",
    "to": "auth-store",
    "action": "login(credentials)"
  },
  {
    "id": "step-start-loading",
    "type": "stateChange",
    "from": "auth-store",
    "to": "auth-store",
    "state": "is-loading",
    "action": "setLoading(true)"
  },
  {
    "id": "step-call-auth-api",
    "type": "dispatch",
    "from": "auth-store",
    "to": "auth-api",
    "action": "POST /auth/login",
    "isAsync": true
  },
  {
    "id": "step-set-user",
    "type": "stateChange",
    "from": "auth-store",
    "to": "auth-store",
    "state": "current-user",
    "action": "setUser(response.user)"
  },
  {
    "id": "step-update-ui",
    "type": "subscribe",
    "from": "auth-store",
    "to": "login-form",
    "state": "current-user",
    "action": "redirectToDashboard()"
  }
]
```

### 非同期の書き方

- API 呼び出しやタイマー起点の処理には `isAsync: true` を付ける
- `dispatch` だけでなく、必要なら `effect` に付けてもよい

---

## 7. Condition を使う

分岐がある場合は `conditions` に定義し、各 step から参照します。

### 例

```json
"conditions": [
  {
    "id": "input-is-valid",
    "expression": "isValid(credentials)",
    "description": "入力値が妥当な場合"
  }
]
```

```json
{
  "id": "step-submit-login",
  "type": "dispatch",
  "from": "login-form",
  "to": "auth-store",
  "action": "login(credentials)",
  "condition": "input-is-valid"
}
```

---

## 8. 参照整合性チェック

後続 validator 実装でもそのまま使える、最低限の確認項目です。

- `owner` が存在する Actor を参照しているか
- `trigger.actor` が存在する Actor を参照しているか
- `steps[].from` / `steps[].to` が存在する Actor を参照しているか
- `steps[].state` が存在する State を参照しているか
- `steps[].condition` が存在する Condition を参照しているか
- 各配列内の `id` が重複していないか
- `scope` を State 側に書いていないか
- `stateChange` がその State の owner と矛盾していないか

特に LLM 生成では、参照切れが最も起きやすいので必ず確認してください。

---

## 9. インポート結果の考え方

仕様とガイドでは、インポート結果に次の概念がある前提で扱って構いません。

- `success`
- `warning`
- `error`

また、サマリ件数として次を持つ前提で設計して問題ありません。

- `actor`
- `state`
- `flow`
- `condition`
- `error`
- `warning`
- `skip`
- `fix`

### 意味の目安

- `success`: 読込可能で重大問題なし
- `warning`: 読込可能だが修正推奨
- `error`: 読込不可、または明確な不正
- `skip`: 無視した要素
- `fix`: 自動補正した要素

注意: これらはインポート結果・validator 結果の概念です。通常のダイアグラム JSON 本体に含める必須フィールドではありません。

---

## 10. LLM に依頼するテンプレート

そのまま使える短めのテンプレートです。

```text
あなたは React / TypeScript アプリケーションの構造を整理するアシスタントです。
以下のコードを分析し、State Flow Visualizer 用の JSON を 1 つ生成してください。

要件:
- 出力は純粋な JSON のみ
- JSON はファイルアップロードでも貼り付けでも使える形式にする
- 日時は ISO 8601 文字列
- scope は State ではなく Actor に置く
- scope は主に store Actor に設定する
- actors / states / flows / conditions の参照整合性を守る
- 1 ファイル 1 機能または 1 主要シナリオに絞る
- 不明な要素は捏造しない

対象コード:
[ここにコードを貼る]
```

---

## 11. よくあるミス

- `createdAt` / `updatedAt` を Date オブジェクト表現のまま書く
- `scope` を `State` に付ける
- 存在しない Actor ID を `owner` や `from` / `to` に入れる
- 1 ファイルに複数機能を入れすぎる
- JSON の前後に説明文を付けてしまう
- `conditions` を定義したのに `steps[].condition` で参照しない、またはその逆

---

## 12. 作成前の最終チェック

- `id` と `name` がある
- `createdAt` / `updatedAt` が ISO 8601 文字列
- `scope` は Actor にのみある
- `store` Actor に必要な `scope` がある
- 参照 ID がすべて解決できる
- 貼り付け可能な純粋 JSON になっている
- 1 ファイルの責務が明確
