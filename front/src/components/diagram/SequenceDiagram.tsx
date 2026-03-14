import { useCallback, useMemo, useEffect } from "react";
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  Controls,
  MiniMap,
  Panel,
  useNodesState,
  useEdgesState,
  useReactFlow,
  type Node,
  type Edge,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useDiagramStore } from "@/stores/diagramStore";
import { useUIStore } from "@/stores/uiStore";
import type { Diagram } from "@/types/diagram";
import { ActorNode } from "./nodes/ActorNode";
import { MessageEdge } from "./edges/MessageEdge";

const nodeTypes = {
  actor: ActorNode,
};

const edgeTypes = {
  message: MessageEdge,
};

const ACTOR_WIDTH = 150;
const ACTOR_GAP = 50;
const STEP_HEIGHT = 60;
const START_Y = 150;
const FLOW_HEADER_HEIGHT = 30;
const MAX_VISIBLE_ISSUES = 5;

type DiagramAnomalySummary = {
  issues: string[];
  invalidStateOwners: number;
  invalidTriggerActors: number;
  invalidStepActors: number;
  invalidStepStates: number;
  invalidStepConditions: number;
  skippedEdges: number;
  skippedTriggers: number;
};

const EMPTY_ANOMALY_SUMMARY: DiagramAnomalySummary = {
  issues: [],
  invalidStateOwners: 0,
  invalidTriggerActors: 0,
  invalidStepActors: 0,
  invalidStepStates: 0,
  invalidStepConditions: 0,
  skippedEdges: 0,
  skippedTriggers: 0,
};

function buildSequenceDiagramData(diagram: Diagram) {
  const actorIds = new Set(diagram.actors.map((actor) => actor.id));
  const stateById = new Map(diagram.states.map((state) => [state.id, state]));
  const conditionById = new Map(
    diagram.conditions.map((condition) => [condition.id, condition]),
  );
  const actorById = new Map(diagram.actors.map((actor) => [actor.id, actor]));
  const actorPositions = new Map<string, number>();

  diagram.actors.forEach((actor, index) => {
    actorPositions.set(actor.id, index * (ACTOR_WIDTH + ACTOR_GAP));
  });

  const anomalySummary: DiagramAnomalySummary = {
    ...EMPTY_ANOMALY_SUMMARY,
    issues: [],
  };
  const addIssue = (message: string) => {
    anomalySummary.issues.push(message);
  };

  diagram.states.forEach((state) => {
    if (!actorIds.has(state.owner)) {
      anomalySummary.invalidStateOwners += 1;
      addIssue(
        `state "${state.name}" が存在しない actor "${state.owner}" を参照しています。`,
      );
    }
  });

  const totalSteps = diagram.flows.reduce(
    (count, flow) => count + flow.steps.length,
    0,
  );
  const lifelineHeight = Math.max(500, totalSteps * STEP_HEIGHT + 200);

  const actorNodes: Node[] = diagram.actors.map((actor, index) => ({
    id: actor.id,
    type: "actor",
    position: { x: index * (ACTOR_WIDTH + ACTOR_GAP), y: 0 },
    data: {
      label: actor.name,
      actorType: actor.type,
      scope: actor.scope,
      color: actor.color,
      lifelineHeight,
    },
    draggable: true,
  }));

  const edges: Edge[] = [];
  const triggerNodes: Node[] = [];
  const flowHeaderNodes: Node[] = [];
  const totalWidth = diagram.actors.length * (ACTOR_WIDTH + ACTOR_GAP);
  let stepIndex = 0;

  diagram.flows.forEach((flow, flowIndex) => {
    if (diagram.flows.length > 1) {
      const headerY = START_Y + stepIndex * STEP_HEIGHT - FLOW_HEADER_HEIGHT - 10;

      flowHeaderNodes.push({
        id: `flow-header-${flow.id}`,
        type: "default",
        position: { x: -20, y: headerY },
        data: { label: `📌 ${flow.name}` },
        style: {
          width: totalWidth + 40,
          height: FLOW_HEADER_HEIGHT,
          background: flowIndex % 2 === 0 ? "#eff6ff" : "#f0fdf4",
          border:
            flowIndex % 2 === 0 ? "2px solid #3b82f6" : "2px solid #22c55e",
          borderRadius: "8px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: "bold",
          fontSize: "14px",
          color: flowIndex % 2 === 0 ? "#1d4ed8" : "#15803d",
        },
        draggable: false,
        selectable: false,
      });

      stepIndex += 0.5;
    }

    const hasValidTriggerActor = actorIds.has(flow.trigger.actor);

    if (hasValidTriggerActor) {
      const actorX = actorPositions.get(flow.trigger.actor) ?? 0;
      const triggerY = START_Y + stepIndex * STEP_HEIGHT - 40;

      triggerNodes.push({
        id: `trigger-${flow.id}`,
        type: "input",
        position: { x: actorX - 120, y: triggerY },
        data: {
          label: `Trigger: ${flow.trigger.action} ${
            flow.trigger.target ? `(${flow.trigger.target})` : ""
          }`,
        },
        style: {
          background: "#fef3c7",
          border: "1px solid #d97706",
          width: 150,
          fontSize: "12px",
        },
        draggable: false,
      });
    } else {
      anomalySummary.invalidTriggerActors += 1;
      anomalySummary.skippedTriggers += 1;
      addIssue(
        `flow "${flow.name}" の trigger.actor が存在しない actor "${flow.trigger.actor}" を参照しています。`,
      );
    }

    flow.steps.forEach((step) => {
      const hasInvalidFrom = Boolean(step.from && !actorIds.has(step.from));
      const hasInvalidTo = Boolean(step.to && !actorIds.has(step.to));
      const hasInvalidState = Boolean(step.state && !stateById.has(step.state));
      const hasInvalidCondition = Boolean(
        step.condition && !conditionById.has(step.condition),
      );

      if (hasInvalidFrom) {
        anomalySummary.invalidStepActors += 1;
        addIssue(
          `step "${step.id}" の from が存在しない actor "${step.from}" を参照しています。`,
        );
      }

      if (hasInvalidTo) {
        anomalySummary.invalidStepActors += 1;
        addIssue(
          `step "${step.id}" の to が存在しない actor "${step.to}" を参照しています。`,
        );
      }

      if (hasInvalidState) {
        anomalySummary.invalidStepStates += 1;
        addIssue(
          `step "${step.id}" の state が存在しない state "${step.state}" を参照しています。`,
        );
      }

      if (hasInvalidCondition) {
        anomalySummary.invalidStepConditions += 1;
        addIssue(
          `step "${step.id}" の condition が存在しない condition "${step.condition}" を参照しています。`,
        );
      }

      if (!step.from || !step.to || hasInvalidFrom || hasInvalidTo) {
        anomalySummary.skippedEdges += 1;
        return;
      }

      const targetActor = actorById.get(step.to);
      const targetType = targetActor?.type || "component";
      const targetScope = targetActor?.scope || "local";
      const stateName = step.state ? stateById.get(step.state)?.name : undefined;
      const conditionExpression = step.condition
        ? conditionById.get(step.condition)?.expression
        : undefined;

      const sourceX = actorPositions.get(step.from) ?? 0;
      const targetX = actorPositions.get(step.to) ?? 0;

      const isDispatch = step.type === "dispatch";
      const isSubscribe = step.type === "subscribe";
      const color = isDispatch ? "#64748b" : getColor(targetType, targetScope);
      const displayType = isDispatch ? "external" : targetType;
      const displayScope = isDispatch ? "local" : targetScope;

      edges.push({
        id: `${flow.id}-${step.id}`,
        source: step.from,
        target: step.to,
        type: "message",
        data: {
          label:
            isSubscribe && stateName
              ? `Notify: ${stateName}`
              : isDispatch
                ? "dispatch"
                : step.action || step.description || step.type,
          targetAction: isSubscribe || isDispatch ? step.action : undefined,
          stepType: step.type,
          targetType: displayType,
          targetScope: displayScope,
          stateName,
          conditionExpression,
          isAsync: step.isAsync,
          yPosition: START_Y + stepIndex * STEP_HEIGHT,
          sourceX,
          targetX,
        },
        style: {
          stroke: color,
          strokeWidth: step.type === "subscribe" ? 2 : 1.5,
          strokeDasharray: step.type === "subscribe" ? "4 4" : undefined,
        },
        animated: step.type === "subscribe",
      });

      stepIndex += 1;
    });

    stepIndex += diagram.flows.length > 1 ? 1.5 : 1;
  });

  return {
    initialNodes: [...actorNodes, ...flowHeaderNodes, ...triggerNodes],
    initialEdges: edges,
    anomalySummary,
  };
}

// カラーパレット定義
const getColor = (type: string, scope?: string) => {
  if (type === "component") return "#3b82f6"; // blue-500
  if (type === "service") return "#a855f7"; // purple-500
  if (type === "store") {
    if (scope === "global") return "#22c55e"; // green-500
    if (scope === "subtree") return "#14b8a6"; // teal-500
    return "#f97316"; // orange-500 (local)
  }
  return "#64748b"; // slate-500 (default/external)
};

function InnerSequenceDiagram() {
  const { diagram } = useDiagramStore();
  const { focusFlowId, clearFocusFlow } = useUIStore();
  const { fitView } = useReactFlow();

  // フローフォーカス時にズーム
  useEffect(() => {
    if (focusFlowId) {
      // フローヘッダーノードにフィット
      const nodeId = `flow-header-${focusFlowId}`;
      setTimeout(() => {
        fitView({
          nodes: [{ id: nodeId }],
          duration: 500,
          padding: 0.5,
        });
        clearFocusFlow();
      }, 100);
    }
  }, [focusFlowId, fitView, clearFocusFlow]);

  const { initialNodes, initialEdges, anomalySummary } = useMemo(() => {
    if (!diagram) {
      return {
        initialNodes: [],
        initialEdges: [],
        anomalySummary: EMPTY_ANOMALY_SUMMARY,
      };
    }

    return buildSequenceDiagramData(diagram);
  }, [diagram]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  useEffect(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [initialNodes, initialEdges, setNodes, setEdges]);

  const issueCount = anomalySummary.issues.length;
  const hasAnomalies = issueCount > 0;

  const onConnect = useCallback(() => {
    // 接続機能は後で実装
  }, []);

  if (!diagram) {
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground">
        ダイアグラムを読み込んでいます...
      </div>
    );
  }

  if (diagram.actors.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
        <p className="text-lg mb-2">アクターがありません</p>
        <p className="text-sm">サイドバーからアクターを追加してください</p>
      </div>
    );
  }

  return (
    <div className="h-full w-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.1}
        maxZoom={2}
      >
        {hasAnomalies ? (
          <Panel position="top-left">
            <div className="max-w-[420px] rounded-md border border-amber-300 bg-amber-50/95 p-3 text-xs text-amber-950 shadow-sm">
              <p className="font-semibold">異常データを検知しました</p>
              <p className="mt-1 text-[11px] leading-5 text-amber-900">
                {issueCount}件の問題を検知し、edge {anomalySummary.skippedEdges}件 / trigger {anomalySummary.skippedTriggers}件をスキップしました。
              </p>
              <div className="mt-2 flex flex-wrap gap-1 text-[11px]">
                {anomalySummary.invalidStateOwners > 0 ? (
                  <span className="rounded border border-amber-300 px-2 py-0.5">
                    state.owner {anomalySummary.invalidStateOwners}
                  </span>
                ) : null}
                {anomalySummary.invalidTriggerActors > 0 ? (
                  <span className="rounded border border-amber-300 px-2 py-0.5">
                    trigger.actor {anomalySummary.invalidTriggerActors}
                  </span>
                ) : null}
                {anomalySummary.invalidStepActors > 0 ? (
                  <span className="rounded border border-amber-300 px-2 py-0.5">
                    step actor {anomalySummary.invalidStepActors}
                  </span>
                ) : null}
                {anomalySummary.invalidStepStates > 0 ? (
                  <span className="rounded border border-amber-300 px-2 py-0.5">
                    step.state {anomalySummary.invalidStepStates}
                  </span>
                ) : null}
                {anomalySummary.invalidStepConditions > 0 ? (
                  <span className="rounded border border-amber-300 px-2 py-0.5">
                    step.condition {anomalySummary.invalidStepConditions}
                  </span>
                ) : null}
              </div>
              <ul className="mt-2 space-y-1 text-[11px] leading-5 text-amber-900">
                {anomalySummary.issues
                  .slice(0, MAX_VISIBLE_ISSUES)
                  .map((issue, index) => (
                    <li key={`${issue}-${index}`}>• {issue}</li>
                  ))}
              </ul>
              {issueCount > MAX_VISIBLE_ISSUES ? (
                <p className="mt-2 text-[11px] text-amber-900">
                  他 {issueCount - MAX_VISIBLE_ISSUES}件
                </p>
              ) : null}
            </div>
          </Panel>
        ) : null}
        <Background />
        <Controls />
        <MiniMap
          nodeColor={(node) => {
            const colors: Record<string, string> = {
              component: "#3b82f6",
              store: "#22c55e",
              service: "#a855f7",
              external: "#f97316",
            };
            return (
              colors[
                (node.data as { actorType?: string })?.actorType ?? "component"
              ] ?? "#888"
            );
          }}
          maskColor="rgba(0, 0, 0, 0.1)"
        />
      </ReactFlow>
    </div>
  );
}

// ReactFlowProviderでラップしてエクスポート
export function SequenceDiagram() {
  return (
    <ReactFlowProvider>
      <InnerSequenceDiagram />
    </ReactFlowProvider>
  );
}
