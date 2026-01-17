/** 状態のスコープ */
export type StateScope = "local" | "subtree" | "global";

/** アクターの種類 */
export type ActorType = "component" | "store" | "service" | "external";

/** アクター（コンポーネント、ストア、サービスなど） */
export interface Actor {
  id: string;
  type: ActorType;
  name: string;
  description?: string;
  parent?: string;
  color?: string;
  scope?: StateScope;
}

/** 状態定義 */
export interface State {
  id: string;
  name: string;
  owner: string;
  dataType?: string;
  description?: string;
}

/** フローのトリガー */
export interface FlowTrigger {
  type: "userAction" | "lifecycle" | "subscription" | "timer";
  actor: string;
  action: string;
  target?: string;
}

/** フローのステップ */
export interface FlowStep {
  id: string;
  type: "dispatch" | "stateChange" | "subscribe" | "effect" | "render";
  from?: string;
  to?: string;
  action?: string;
  state?: string;
  payload?: string;
  description?: string;
  condition?: string;
}

/** 条件分岐 */
export interface Condition {
  id: string;
  expression: string;
  description?: string;
}

/** フロー全体 */
export interface Flow {
  id: string;
  name: string;
  description?: string;
  trigger: FlowTrigger;
  steps: FlowStep[];
}

/** ダイアグラム（ルートドキュメント） */
export interface Diagram {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
  actors: Actor[];
  states: State[];
  flows: Flow[];
  conditions: Condition[];
}

/** 新規ダイアグラム作成用 */
export type CreateDiagramInput = Omit<
  Diagram,
  "id" | "createdAt" | "updatedAt"
>;
