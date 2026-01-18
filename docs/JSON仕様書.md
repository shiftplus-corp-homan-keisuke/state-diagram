# JSON仕様書

State Flow Visualizerで使用するダイアグラムJSONの仕様書です。

## 概要

ダイアグラムは以下の要素で構成されます：

- **Diagram**: ルートドキュメント
- **Actor**: コンポーネント、ストア、サービスなど
- **State**: 状態定義
- **Flow**: イベント/データフローの定義
- **Condition**: 条件分岐

---

## スキーマ定義

### Diagram（ルート）

```typescript
interface Diagram {
  id: string; // UUID
  name: string; // ダイアグラム名
  description?: string; // 説明
  createdAt: string; // ISO 8601形式
  updatedAt: string; // ISO 8601形式
  actors: Actor[];
  states: State[];
  flows: Flow[];
  conditions: Condition[];
}
```

### Actor（アクター）

```typescript
type ActorType = "component" | "store" | "service" | "external";

interface Actor {
  id: string; // UUID
  type: ActorType; // アクターの種類
  name: string; // 表示名
  description?: string; // 説明
  parent?: string; // 親アクターID（ツリー構造用）
  color?: string; // 表示色（HEX）
}
```

| type      | 説明             | 例                      |
| --------- | ---------------- | ----------------------- |
| component | UIコンポーネント | ProductList, CartIcon   |
| store     | 状態管理ストア   | CartStore, UserStore    |
| service   | サービス層       | ApiService, AuthService |
| external  | 外部システム     | Backend API, Firebase   |

### State（状態）

```typescript
type StateScope = "local" | "subtree" | "global";

interface State {
  id: string; // UUID
  name: string; // 状態名
  owner: string; // 所有アクターID
  scope: StateScope; // スコープ
  dataType?: string; // 型情報（例: "Array<CartItem>"）
  description?: string; // 説明
}
```

| scope   | 説明                           | 例                          |
| ------- | ------------------------------ | --------------------------- |
| local   | コンポーネント内で完結         | useState, signal            |
| subtree | 特定のコンポーネント以下に影響 | useContext, DI module       |
| global  | アプリ全体                     | Zustand, providedIn: 'root' |

### Flow（フロー）

```typescript
interface Flow {
  id: string;
  name: string; // フロー名
  description?: string;
  trigger: FlowTrigger; // トリガー条件
  steps: FlowStep[]; // ステップ一覧
}

interface FlowTrigger {
  type: "userAction" | "lifecycle" | "subscription" | "timer";
  actor: string; // トリガー元アクターID
  action: string; // アクション名（例: "click", "onInit"）
  target?: string; // ターゲット要素（例: "追加ボタン"）
}
```

### FlowStep（ステップ）

```typescript
interface FlowStep {
  id: string;
  type: "dispatch" | "stateChange" | "subscribe" | "effect" | "render";
  from?: string; // 送信元アクターID
  to?: string; // 送信先アクターID
  action?: string; // アクション名
  state?: string; // 関連する状態ID
  payload?: string; // ペイロードの説明
  description?: string; // 説明
  condition?: string; // 条件ID
  isAsync?: boolean; // 非同期処理フラグ
}
```

| type        | 説明                     |
| ----------- | ------------------------ |
| dispatch    | アクションをディスパッチ |
| stateChange | 状態の変更               |
| subscribe   | 状態の購読               |
| effect      | 副作用の実行             |
| render      | 再レンダリング           |

### Condition（条件）

```typescript
interface Condition {
  id: string;
  expression: string; // 条件式（例: "product.stock > 0"）
  description?: string; // 説明
}
```

---

## サンプルJSON

```json
{
  "id": "diagram-001",
  "name": "ショッピングカート機能",
  "description": "商品追加からカート更新までのフロー",
  "createdAt": "2026-01-17T15:00:00Z",
  "updatedAt": "2026-01-17T15:00:00Z",
  "actors": [
    { "id": "a1", "type": "component", "name": "ProductList" },
    { "id": "a2", "type": "store", "name": "CartStore" },
    { "id": "a3", "type": "component", "name": "CartIcon" }
  ],
  "states": [
    {
      "id": "s1",
      "name": "cartItems",
      "owner": "a2",
      "scope": "global",
      "dataType": "Array<CartItem>"
    }
  ],
  "flows": [
    {
      "id": "f1",
      "name": "商品をカートに追加",
      "trigger": {
        "type": "userAction",
        "actor": "a1",
        "action": "click",
        "target": "追加ボタン"
      },
      "steps": [
        {
          "id": "step1",
          "type": "dispatch",
          "from": "a1",
          "to": "a2",
          "action": "addItem",
          "payload": "{ productId, quantity }"
        },
        {
          "id": "step2",
          "type": "stateChange",
          "from": "a2",
          "state": "s1",
          "description": "cartItemsに商品を追加"
        },
        {
          "id": "step3",
          "type": "subscribe",
          "from": "a2",
          "to": "a3",
          "state": "s1",
          "description": "バッジ数を更新"
        }
      ]
    }
  ],
  "conditions": []
}
```

---

## 生成AIでの利用

このJSON仕様を生成AIに渡すことで、既存のコードベースからダイアグラムJSONを生成できます。

### プロンプト例

```
以下のReactコンポーネントとZustandストアを分析し、
State Flow VisualizerのJSON形式でデータフローを出力してください。

[コードをここに貼り付け]

出力形式は上記のJSON仕様に従ってください。
```
