import type {
  Actor,
  ActorType,
  Condition,
  Diagram,
  DiagramImportMessage,
  DiagramImportResult,
  DiagramImportStatus,
  DiagramImportSummary,
  Flow,
  FlowStep,
  FlowTrigger,
  State,
  StateScope,
} from "@/types/diagram";

const actorTypes = new Set<ActorType>([
  "component",
  "store",
  "service",
  "external",
]);

const stateScopes = new Set<StateScope>(["local", "subtree", "global"]);

const triggerTypes = new Set<FlowTrigger["type"]>([
  "userAction",
  "lifecycle",
  "subscription",
  "timer",
]);

const stepTypes = new Set<FlowStep["type"]>([
  "dispatch",
  "stateChange",
  "subscribe",
  "effect",
  "render",
]);

interface ValidateDiagramImportOptions {
  currentDiagramId?: string;
}

export function validateDiagramImport(
  jsonContent: string,
  options: ValidateDiagramImportOptions = {},
): DiagramImportResult {
  const summary = createSummary();
  const messages: DiagramImportMessage[] = [];

  const addMessage = (level: DiagramImportStatus, text: string) => {
    messages.push({ level, text });
    if (level === "error") summary.error += 1;
    if (level === "warning") summary.warning += 1;
  };

  let parsed: unknown;

  try {
    parsed = JSON.parse(jsonContent);
  } catch {
    addMessage("error", "JSON の解析に失敗しました");
    return createResult("error", null, summary, messages);
  }

  if (!isRecord(parsed)) {
    addMessage("error", "ダイアグラム JSON はオブジェクト形式である必要があります");
    return createResult("error", null, summary, messages);
  }

  const now = new Date();
  const id =
    options.currentDiagramId ??
    readRequiredString(parsed.id) ??
    applyFix(summary, addMessage, "ダイアグラム id がないため新規生成しました", () =>
      crypto.randomUUID(),
    );
  const name = readRequiredString(parsed.name);

  if (!name) {
    addMessage("error", "ダイアグラム名は必須です");
    return createResult("error", null, summary, messages);
  }

  const createdAt = readDate(
    parsed.createdAt,
    now,
    summary,
    addMessage,
    "createdAt",
  );
  const updatedAt = readDate(
    parsed.updatedAt,
    now,
    summary,
    addMessage,
    "updatedAt",
  );

  const actors = validateActors(parsed.actors, summary, addMessage);
  const actorIds = new Set(actors.map((actor) => actor.id));
  const states = validateStates(parsed.states, actorIds, summary, addMessage);
  const stateIds = new Set(states.map((state) => state.id));
  const conditions = validateConditions(parsed.conditions, summary, addMessage);
  const conditionIds = new Set(conditions.map((condition) => condition.id));
  const flows = validateFlows(
    parsed.flows,
    actorIds,
    stateIds,
    conditionIds,
    summary,
    addMessage,
  );

  summary.actor = actors.length;
  summary.state = states.length;
  summary.flow = flows.length;
  summary.condition = conditions.length;

  const diagram: Diagram = {
    id,
    name,
    description: readOptionalString(parsed.description),
    createdAt,
    updatedAt,
    actors,
    states,
    flows,
    conditions,
  };

  if (messages.length === 0) {
    messages.push({ level: "success", text: "インポート可能です" });
  }

  const status = summary.error > 0 ? "error" : summary.warning > 0 ? "warning" : "success";
  return createResult(status, diagram, summary, messages);
}

function validateActors(
  value: unknown,
  summary: DiagramImportSummary,
  addMessage: (level: DiagramImportStatus, text: string) => void,
): Actor[] {
  const list = readArray(value, summary, addMessage, "actors");
  const actors: Actor[] = [];

  for (const item of list) {
    if (!isRecord(item)) {
      skipItem(summary, addMessage, "無効な actor をスキップしました");
      continue;
    }

    const id = readRequiredString(item.id);
    const name = readRequiredString(item.name);
    const type = isActorType(item.type) ? item.type : null;

    if (!id || !name || !type) {
      skipItem(summary, addMessage, "必須項目が不足した actor をスキップしました");
      continue;
    }

    let scope: StateScope | undefined;
    if (item.scope != null) {
      if (isStateScope(item.scope)) {
        scope = item.scope;
      } else {
        summary.fix += 1;
        addMessage("warning", `actor ${name} の scope を補正しました`);
      }
    }

    actors.push({
      id,
      name,
      type,
      scope,
      parent: readOptionalString(item.parent),
      color: readOptionalString(item.color),
      description: readOptionalString(item.description),
    });
  }

  return actors;
}

function validateStates(
  value: unknown,
  actorIds: Set<string>,
  summary: DiagramImportSummary,
  addMessage: (level: DiagramImportStatus, text: string) => void,
): State[] {
  const list = readArray(value, summary, addMessage, "states");
  const states: State[] = [];

  for (const item of list) {
    if (!isRecord(item)) {
      skipItem(summary, addMessage, "無効な state をスキップしました");
      continue;
    }

    const id = readRequiredString(item.id);
    const name = readRequiredString(item.name);
    const owner = readRequiredString(item.owner);

    if (!id || !name || !owner) {
      skipItem(summary, addMessage, "必須項目が不足した state をスキップしました");
      continue;
    }

    if (!actorIds.has(owner)) {
      skipItem(summary, addMessage, `state ${name} の owner が存在しないためスキップしました`);
      continue;
    }

    if ("scope" in item) {
      summary.fix += 1;
      addMessage("warning", `state ${name} の scope を削除しました`);
    }

    states.push({
      id,
      name,
      owner,
      dataType: readOptionalString(item.dataType),
      description: readOptionalString(item.description),
    });
  }

  return states;
}

function validateConditions(
  value: unknown,
  summary: DiagramImportSummary,
  addMessage: (level: DiagramImportStatus, text: string) => void,
): Condition[] {
  const list = readArray(value, summary, addMessage, "conditions");
  const conditions: Condition[] = [];

  for (const item of list) {
    if (!isRecord(item)) {
      skipItem(summary, addMessage, "無効な condition をスキップしました");
      continue;
    }

    const id = readRequiredString(item.id);
    const expression = readRequiredString(item.expression);

    if (!id || !expression) {
      skipItem(summary, addMessage, "必須項目が不足した condition をスキップしました");
      continue;
    }

    conditions.push({
      id,
      expression,
      description: readOptionalString(item.description),
    });
  }

  return conditions;
}

function validateFlows(
  value: unknown,
  actorIds: Set<string>,
  stateIds: Set<string>,
  conditionIds: Set<string>,
  summary: DiagramImportSummary,
  addMessage: (level: DiagramImportStatus, text: string) => void,
): Flow[] {
  const list = readArray(value, summary, addMessage, "flows");
  const flows: Flow[] = [];

  for (const item of list) {
    if (!isRecord(item)) {
      skipItem(summary, addMessage, "無効な flow をスキップしました");
      continue;
    }

    const id = readRequiredString(item.id);
    const name = readRequiredString(item.name);

    if (!id || !name || !isRecord(item.trigger)) {
      skipItem(summary, addMessage, "必須項目が不足した flow をスキップしました");
      continue;
    }

    const trigger = validateTrigger(item.trigger, actorIds);
    if (!trigger) {
      skipItem(summary, addMessage, `flow ${name} の trigger が不正なためスキップしました`);
      continue;
    }

    const steps = validateSteps(
      item.steps,
      name,
      actorIds,
      stateIds,
      conditionIds,
      summary,
      addMessage,
    );

    flows.push({
      id,
      name,
      description: readOptionalString(item.description),
      trigger,
      steps,
    });
  }

  return flows;
}

function validateTrigger(
  value: Record<string, unknown>,
  actorIds: Set<string>,
): FlowTrigger | null {
  const type = isTriggerType(value.type) ? value.type : null;
  const actor = readRequiredString(value.actor);
  const action = readRequiredString(value.action);

  if (!type || !actor || !action || !actorIds.has(actor)) {
    return null;
  }

  return {
    type,
    actor,
    action,
    target: readOptionalString(value.target),
  };
}

function validateSteps(
  value: unknown,
  flowName: string,
  actorIds: Set<string>,
  stateIds: Set<string>,
  conditionIds: Set<string>,
  summary: DiagramImportSummary,
  addMessage: (level: DiagramImportStatus, text: string) => void,
): FlowStep[] {
  const list = readArray(value, summary, addMessage, `flow ${flowName} の steps`);
  const steps: FlowStep[] = [];

  for (const item of list) {
    if (!isRecord(item)) {
      skipItem(summary, addMessage, `flow ${flowName} の無効な step をスキップしました`);
      continue;
    }

    const id = readRequiredString(item.id);
    const type = isStepType(item.type) ? item.type : null;

    if (!id || !type) {
      skipItem(summary, addMessage, `flow ${flowName} の不正な step をスキップしました`);
      continue;
    }

    const from = readLinkedId(item.from, actorIds, summary, addMessage, `${flowName} step.from`);
    const to = readLinkedId(item.to, actorIds, summary, addMessage, `${flowName} step.to`);
    const state = readLinkedId(item.state, stateIds, summary, addMessage, `${flowName} step.state`);
    const condition = readLinkedId(
      item.condition,
      conditionIds,
      summary,
      addMessage,
      `${flowName} step.condition`,
    );

    steps.push({
      id,
      type,
      from,
      to,
      state,
      condition,
      action: readOptionalString(item.action),
      payload: readOptionalString(item.payload),
      description: readOptionalString(item.description),
      isAsync: typeof item.isAsync === "boolean" ? item.isAsync : undefined,
    });
  }

  return steps;
}

function readLinkedId(
  value: unknown,
  knownIds: Set<string>,
  summary: DiagramImportSummary,
  addMessage: (level: DiagramImportStatus, text: string) => void,
  label: string,
): string | undefined {
  const id = readOptionalString(value);
  if (!id) return undefined;
  if (knownIds.has(id)) return id;

  summary.fix += 1;
  addMessage("warning", `${label} の参照が見つからないため削除しました`);
  return undefined;
}

function readArray(
  value: unknown,
  summary: DiagramImportSummary,
  addMessage: (level: DiagramImportStatus, text: string) => void,
  label: string,
): unknown[] {
  if (Array.isArray(value)) {
    return value;
  }

  summary.fix += 1;
  addMessage("warning", `${label} が配列ではないため空配列に補正しました`);
  return [];
}

function readDate(
  value: unknown,
  fallback: Date,
  summary: DiagramImportSummary,
  addMessage: (level: DiagramImportStatus, text: string) => void,
  label: string,
): Date {
  if (typeof value === "string") {
    const date = new Date(value);
    if (!Number.isNaN(date.getTime())) {
      return date;
    }
  }

  summary.fix += 1;
  addMessage("warning", `${label} が不正なため現在時刻で補完しました`);
  return fallback;
}

function readRequiredString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function readOptionalString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function skipItem(
  summary: DiagramImportSummary,
  addMessage: (level: DiagramImportStatus, text: string) => void,
  text: string,
) {
  summary.skip += 1;
  addMessage("warning", text);
}

function applyFix<T>(
  summary: DiagramImportSummary,
  addMessage: (level: DiagramImportStatus, text: string) => void,
  text: string,
  factory: () => T,
): T {
  summary.fix += 1;
  addMessage("warning", text);
  return factory();
}

function createSummary(): DiagramImportSummary {
  return {
    actor: 0,
    state: 0,
    flow: 0,
    condition: 0,
    error: 0,
    warning: 0,
    skip: 0,
    fix: 0,
  };
}

function createResult(
  status: DiagramImportStatus,
  diagram: Diagram | null,
  summary: DiagramImportSummary,
  messages: DiagramImportMessage[],
): DiagramImportResult {
  return {
    status,
    diagram,
    summary,
    messages,
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isActorType(value: unknown): value is ActorType {
  return typeof value === "string" && actorTypes.has(value as ActorType);
}

function isStateScope(value: unknown): value is StateScope {
  return typeof value === "string" && stateScopes.has(value as StateScope);
}

function isTriggerType(value: unknown): value is FlowTrigger["type"] {
  return typeof value === "string" && triggerTypes.has(value as FlowTrigger["type"]);
}

function isStepType(value: unknown): value is FlowStep["type"] {
  return typeof value === "string" && stepTypes.has(value as FlowStep["type"]);
}
