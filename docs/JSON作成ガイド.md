# JSONデータ作成ガイド

このドキュメントでは、State Flow Visualizerで使用するJSONデータを実際に作成する手順を解説します。
手動で作成する場合や、生成AIに指示を出して生成させる場合の参考にしてください。

## 1. 準備：可視化範囲の特定

まず、どのシナリオ（ユースケース）を可視化したいかを明確にします。
複雑すぎるフローは分割し、1つのJSONファイルにつき1つの主要なシナリオ（「カートに追加する」「ログインする」など）に焦点を当てると分かりやすくなります。

### 1.1 土台の作成 (Root)

JSONファイルの一番外側（ルート）には、必ず `id` と `name` が必要です。これがないとエラーになります。

```json
{
  "id": "my-diagram-001",
  "name": "Todoアプリ シナリオA",
  "description": "...",
  "actors": [],
  "states": [],
  "flows": []
}
```

## 2. アクター (Actors) の定義

登場人物を洗い出します。

### 手順

1.  **IDの決定**: ユニークなIDを振ります（例: `ui`, `store`, `api` など短縮形が書きやすいです）。
2.  **種類の特定 (`type`)**:
    - `component`: Reactコンポーネント、UI要素
    - `store`: 状態管理（Zustand, Redux, Context）
    - `service`: APIクライアント、ロジック層
    - `external`: 外部システム、DB
3.  **スコープ (`scope`)**（※Storeの場合）:
    - 状態の影響範囲を設定します（`local`, `subtree`, `global`）。これで図の色が変わります。

### 例

```json
"actors": [
  { "id": "ui", "type": "component", "name": "TodoList" },
  { "id": "store", "type": "store", "name": "TodoStore", "scope": "global" },
  { "id": "api", "type": "service", "name": "TodoApi" }
]
```

## 3. 状態 (States) の定義

フロー内で変化する重要な変数を定義します。

### 手順

1.  **オーナーの特定 (`owner`)**: どのActorが持っている状態か（IDで指定）。
2.  **状態名の決定**: 変数名（例: `todos`, `isLoading`）。

### 例

```json
"states": [
  { "id": "s_todos", "name": "todos", "owner": "store" },
  { "id": "s_loading", "name": "isLoading", "owner": "store" }
]
```

## 4. フロー (Flows) の構築

物語（シナリオ）をステップ・バイ・ステップで記述します。

### 4.1 トリガー (`trigger`)

物語の開始地点です。

- **User Action**: ユーザーがボタンを押した、文字を入力した、など。
- **Action名**: 具体的に（例: `[Click] Add Button`）。

### 4.2 ステップ (`steps`)

ここが最も重要です。以下の順序で組み立てるのが基本パターンです。

**基本パターン: Action -> State Update -> UI Update**

1.  **Dispatch (命令)**: UIからStore/Serviceへ。
    - `type: "dispatch"`, `from: "ui"`, `to: "store"`, `action: "addTodo(...)"`
    - ※矢印のラベルになります。
2.  **State Change (変化)**: Store内で値が変わる。
    - `type: "stateChange"`, `from: "store"`, `to: "store"`, `state: "s_todos"`, `action: "push(newTodo)"`
    - ※緑色のノードとして強調表示されます。
3.  **Subscribe (通知)**: 変化をUIが検知する。
    - `type: "subscribe"`, `from: "store"`, `to: "ui"`, `state: "s_todos"`, `action: "render()"`
    - ※青い破線でフィードバックを表現します。
4.  **Effect / API Call (副作用)**: 必要に応じて外部システムの呼び出し。
    - `type: "dispatch"`, `from: "store"`, `to: "api"`, `action: "post(...)"`

### 例

```json
"flows": [
  {
    "id": "flow1",
    "name": "Todo追加フロー",
    "trigger": { "type": "userAction", "actor": "ui", "action": "Click Add" },
    "steps": [
      { "id": "st1", "type": "dispatch", "from": "ui", "to": "store", "action": "add('Buy Milk')" },
      { "id": "st2", "type": "stateChange", "from": "store", "to": "store", "state": "s_todos", "action": "updated" },
      { "id": "st3", "type": "subscribe", "from": "store", "to": "ui", "state": "s_todos", "action": "render()" }
    ]
  }
]
```

### 4.3 条件分岐 (`conditions`)

「在庫がある場合のみ追加する」といった分岐を表現する場合に使用します。

1.  **条件定義**: `conditions` 配列に条件式を定義します。
    - `id: "cond_stock"`, `expression: "stock > 0"`
2.  **ステップへの適用**: 分岐が発生するステップに `condition` IDを指定します。
    - `{ ..., "condition": "cond_stock" }`

### 例

```json
"conditions": [
  { "id": "c1", "expression": "isLoggedIn == true" }
],
"flows": [
  {
    ...,
    "steps": [
      { "id": "st1", "type": "dispatch", "action": "checkout()", "condition": "c1" }
    ]
  }
]
```

## 5. よくある間違いと注意点 (Critical Check)

JSON作成時に最もエラーになりやすいポイントです。必ずチェックしてください。

- [ ] **IDの参照整合性**:
  - `steps` の `from`, `to` に指定するIDは、必ず `actors` 配列に存在するIDでなければなりません。
  - `state` に指定するIDは、必ず `states` 配列に存在するIDでなければなりません。
- [ ] **State Ownerの一致**:
  - `stateChange` ステップで変更するstateは、そのstepの `to` (Actor) が所有 (`owner`) している必要があります。
- [ ] **一意なID**:
  - すべての `id` フィールドは、その配列内でユニークである必要があります。

## 6. 生成AIへのプロンプト例

既存のソースコードからこのJSONを生成させたい場合、以下のプロンプトテンプレートを使用すると効果的です。

---

**プロンプト:**

あなたはReact/TypeScriptアプリケーションのアーキテクトです。
以下のソースコード（コンポーネントとストア）を分析し、**State Flow Visualizer**用のJSONデータを生成してください。

**出力要件:**

1.  **Actors**: 主要なコンポーネントとストアを抽出。
2.  **States**: `useState`, `useStore` などで管理されている主要な状態変数を抽出。
3.  **Flow**: ユーザーの「[具体的な操作名]」をトリガーとする一連の処理フローをステップ化してください。
    - 関数呼び出しは `dispatch`
    - 状態変数の更新は `stateChange`
    - UIへの反映は `subscribe`
      として表現すること。

**ターゲットコード:**
[ここにコードを貼り付け]

**JSONフォーマット参考:**
(JSON仕様書.md の内容を参照または貼り付け)

---

## 6. ヒントとベストプラクティス

- **粒度**: すべての行をステップにする必要はありません。「主要なデータの流れ」が見える粒度が最適です。
- **ID管理**: 手書きの場合は `a1`, `s1`, `st1` のような短いIDでも十分ですが、`ui_header`, `state_user` のように意味のあるIDにするとデバッグしやすくなります。
- **ラベル**: `action` フィールドは図の中に表示されるテキストです。コードそのままでなく、人間が読みやすい要約（例: `fetchData` → `データ取得開始`）にしても構いません。
