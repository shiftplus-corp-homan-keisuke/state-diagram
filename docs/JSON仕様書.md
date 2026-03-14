# JSON仕様書

State Flow Visualizer で扱うダイアグラム JSON の仕様です。現行フロントエンド実装 `front/src/types/diagram.ts` と、現在のインポート UI の挙動に合わせて整理しています。

## この仕様の前提

- JSON ルートは `Diagram` です
- `createdAt` / `updatedAt` は JSON 上では ISO 8601 文字列です
- アプリ実行時の `Diagram` 型では `createdAt` / `updatedAt` は `Date` として扱います
- そのため、JSON 読込時に文字列を `Date` へ変換します
- `scope` は `State` ではなく `Actor` に属します
- `scope` は主に `type: "store"` の Actor で使います
- インポートはファイルアップロードと JSON 貼り付けの両方に対応します

---

## 1. Diagram

```typescript
interface Diagram {
  id: string;
  name: string;
  description?: string;
  createdAt: string; // JSON上はISO 8601文字列
  updatedAt: string; // JSON上はISO 8601文字列
  actors: Actor[];
  states: State[];
  flows: Flow[];
  conditions: Condition[];
}
```

### フィールド

| フィールド | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| `id` | `string` | 必須 | ダイアグラムID |
| `name` | `string` | 必須 | ダイアグラム名 |
| `description` | `string` | 任意 | ダイアグラム説明 |
| `createdAt` | `string` | 推奨 | ISO 8601 形式の作成日時 |
| `updatedAt` | `string` | 推奨 | ISO 8601 形式の更新日時 |
| `actors` | `Actor[]` | 必須 | アクター一覧 |
| `states` | `State[]` | 必須 | 状態一覧 |
| `flows` | `Flow[]` | 必須 | フロー一覧 |
| `conditions` | `Condition[]` | 必須 | 条件一覧 |

### 日時の扱い

- JSON として保存・受け渡しする値は文字列です
- 文字列形式は ISO 8601 を使用します
- 読込時に `new Date(createdAt)` / `new Date(updatedAt)` のように `Date` へ変換します
- 現行インポーターでは日時が未指定でも読込自体は可能で、その場合は現在日時で補完されます

---

## 2. Actor

```typescript
type ActorType = "component" | "store" | "service" | "external";
type StateScope = "local" | "subtree" | "global";

interface Actor {
  id: string;
  type: ActorType;
  name: string;
  description?: string;
  parent?: string;
  color?: string;
  scope?: StateScope;
}
```

### フィールド

| フィールド | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| `id` | `string` | 必須 | アクターID |
| `type` | `ActorType` | 必須 | アクター種別 |
| `name` | `string` | 必須 | 表示名 |
| `description` | `string` | 任意 | 説明 |
| `parent` | `string` | 任意 | 親アクターID |
| `color` | `string` | 任意 | 表示色 |
| `scope` | `StateScope` | 任意 | スコープ |

### `type`

| 値 | 説明 | 例 |
| --- | --- | --- |
| `component` | UI コンポーネント | `ProductList`, `LoginForm` |
| `store` | 状態管理ストア | `CartStore`, `AuthStore` |
| `service` | サービス層 | `ApiService`, `AuthService` |
| `external` | 外部システム | `Backend API`, `Firebase` |

### `scope`

| 値 | 説明 | 主な利用例 |
| --- | --- | --- |
| `local` | ローカルな影響範囲 | コンポーネント内限定ストア |
| `subtree` | 一部ツリー配下に影響 | 特定機能配下の共有ストア |
| `global` | アプリ全体に影響 | グローバルストア |

### `scope` に関する重要事項

- `scope` は `State` ではなく `Actor` の属性です
- 現行 UI では主に `type: "store"` の Actor に対して設定します
- `component` / `service` / `external` では通常は省略します
- 描画上は `scope` によって store 系 Actor の見た目や凡例が変わります

---

## 3. State

```typescript
interface State {
  id: string;
  name: string;
  owner: string;
  dataType?: string;
  description?: string;
}
```

### フィールド

| フィールド | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| `id` | `string` | 必須 | 状態ID |
| `name` | `string` | 必須 | 状態名 |
| `owner` | `string` | 必須 | 所有 Actor の ID |
| `dataType` | `string` | 任意 | 型情報 |
| `description` | `string` | 任意 | 説明 |

### 注意

- `State` 自体には `scope` を持ちません
- スコープ表現が必要な場合は、所有元 Actor の `scope` を使います

---

## 4. Flow

```typescript
interface Flow {
  id: string;
  name: string;
  description?: string;
  trigger: FlowTrigger;
  steps: FlowStep[];
}

interface FlowTrigger {
  type: "userAction" | "lifecycle" | "subscription" | "timer";
  actor: string;
  action: string;
  target?: string;
}
```

### FlowTrigger

| フィールド | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| `type` | `"userAction" \| "lifecycle" \| "subscription" \| "timer"` | 必須 | 開始契機 |
| `actor` | `string` | 必須 | トリガー元 Actor ID |
| `action` | `string` | 必須 | 契機名 |
| `target` | `string` | 任意 | 対象 UI やイベント対象 |

---

## 5. FlowStep

```typescript
interface FlowStep {
  id: string;
  type: "dispatch" | "stateChange" | "subscribe" | "effect" | "render";
  from?: string;
  to?: string;
  action?: string;
  state?: string;
  payload?: string;
  description?: string;
  condition?: string;
  isAsync?: boolean;
}
```

### フィールド

| フィールド | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| `id` | `string` | 必須 | ステップID |
| `type` | `FlowStepType` | 必須 | ステップ種別 |
| `from` | `string` | 任意 | 送信元 Actor ID |
| `to` | `string` | 任意 | 送信先 Actor ID |
| `action` | `string` | 任意 | 動作名 |
| `state` | `string` | 任意 | 関連 State ID |
| `payload` | `string` | 任意 | ペイロード説明 |
| `description` | `string` | 任意 | 補足説明 |
| `condition` | `string` | 任意 | 条件ID |
| `isAsync` | `boolean` | 任意 | 非同期処理フラグ |

### `type`

| 値 | 説明 |
| --- | --- |
| `dispatch` | Actor 間の命令・イベント送信 |
| `stateChange` | 状態変更 |
| `subscribe` | 状態変化の購読・通知 |
| `effect` | 副作用の実行 |
| `render` | UI 再描画 |

### ステップ記述ルール

- `from` / `to` は Actor ID を参照します
- `state` は State ID を参照します
- `condition` は Condition ID を参照します
- `stateChange` は通常、変更対象 State の `owner` と整合する Actor から記述します
- 非同期通信や非同期ジョブは `isAsync: true` を付けます

---

## 6. Condition

```typescript
interface Condition {
  id: string;
  expression: string;
  description?: string;
}
```

| フィールド | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| `id` | `string` | 必須 | 条件ID |
| `expression` | `string` | 必須 | 条件式 |
| `description` | `string` | 任意 | 人間向け説明 |

---

## 7. 参照整合性ルール

validator 実装で前提にしてよい基本ルールです。

- `actors[].id` は一意であること
- `states[].id` は一意であること
- `flows[].id` は一意であること
- `conditions[].id` は一意であること
- 各 `flow.steps[].id` は、その flow 内で一意であること
- `states[].owner` は存在する `actors[].id` を参照すること
- `flows[].trigger.actor` は存在する `actors[].id` を参照すること
- `flow.steps[].from` / `to` は、指定するなら存在する `actors[].id` を参照すること
- `flow.steps[].state` は、指定するなら存在する `states[].id` を参照すること
- `flow.steps[].condition` は、指定するなら存在する `conditions[].id` を参照すること
- `type: "store"` 以外に `scope` を付ける場合は warning 扱い候補としてよいこと
- `stateChange` で参照する `state` は、その State の `owner` と step の主体が矛盾しないことが望ましいこと

---

## 8. インポート処理の考え方

現行 UI では JSON を読み込み、基本チェック後にエディタへ反映します。後続の validator 実装では、以下の結果分類を前提にできます。

### 結果分類

- `success`: 問題なく取り込めた
- `warning`: 読み込めるが修正推奨
- `error`: 取り込み不可、または要修正

### 集計サマリ

以下の件数を集計対象にして構いません。

- `actor`
- `state`
- `flow`
- `condition`
- `error`
- `warning`
- `skip`
- `fix`

### 補足

- これはインポート結果や validator 出力の概念であり、`Diagram` JSON 本体の必須フィールドではありません
- `skip` は未採用要素、`fix` は自動補正や補完を指す想定です

---

## 9. サンプル JSON

```json
{
  "id": "diagram-cart",
  "name": "ショッピングカート機能",
  "description": "商品追加からカート更新までの主要フロー",
  "createdAt": "2026-01-17T15:00:00.000Z",
  "updatedAt": "2026-01-17T15:00:00.000Z",
  "actors": [
    {
      "id": "product-list",
      "type": "component",
      "name": "ProductList"
    },
    {
      "id": "cart-store",
      "type": "store",
      "name": "CartStore",
      "scope": "global"
    },
    {
      "id": "cart-icon",
      "type": "component",
      "name": "CartIcon"
    }
  ],
  "states": [
    {
      "id": "cart-items",
      "name": "cartItems",
      "owner": "cart-store",
      "dataType": "Array<CartItem>",
      "description": "カート内の商品一覧"
    }
  ],
  "flows": [
    {
      "id": "add-item-flow",
      "name": "商品をカートに追加",
      "trigger": {
        "type": "userAction",
        "actor": "product-list",
        "action": "click",
        "target": "追加ボタン"
      },
      "steps": [
        {
          "id": "step-dispatch-add-item",
          "type": "dispatch",
          "from": "product-list",
          "to": "cart-store",
          "action": "addItem",
          "payload": "{ productId, quantity }"
        },
        {
          "id": "step-change-cart-items",
          "type": "stateChange",
          "from": "cart-store",
          "to": "cart-store",
          "state": "cart-items",
          "description": "cartItems に商品を追加"
        },
        {
          "id": "step-subscribe-cart-icon",
          "type": "subscribe",
          "from": "cart-store",
          "to": "cart-icon",
          "state": "cart-items",
          "description": "カート件数バッジを更新"
        }
      ]
    }
  ],
  "conditions": []
}
```

---

## 10. LLM 向け指示

LLM に JSON 生成を依頼するときは、次を明示してください。

- 出力はこの仕様に従うこと
- 日時は ISO 8601 文字列で出力すること
- `scope` は `Actor` に置き、主に `store` Actor に付けること
- ファイルアップロードでも貼り付けでも読めるよう、純粋な JSON のみを返すこと
- 機能単位・シナリオ単位で JSON を分けること
- `actors` / `states` / `flows` / `conditions` 間の参照整合性を守ること
- 不明な要素は推測で捏造せず、必要なら省略または `description` で補足すること
