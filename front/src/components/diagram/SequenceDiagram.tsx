import { useCallback, useMemo } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useDiagramStore } from "@/stores/diagramStore";
import { ActorNode } from "./nodes/ActorNode";
import { MessageEdge } from "./edges/MessageEdge";
import type { StateScope } from "@/types/diagram";

const nodeTypes = {
  actor: ActorNode,
};

const edgeTypes = {
  message: MessageEdge,
};

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

export function SequenceDiagram() {
  const { diagram } = useDiagramStore();

  // ノードとエッジを計算
  const { initialNodes, initialEdges } = useMemo(() => {
    if (!diagram) {
      return { initialNodes: [], initialEdges: [] };
    }

    const ACTOR_WIDTH = 150;
    const ACTOR_GAP = 50;
    const STEP_HEIGHT = 60;
    const START_Y = 100;

    // 全ステップ数を計算してライフラインの高さを決定
    const totalSteps = diagram.flows.reduce(
      (acc, flow) => acc + flow.steps.length,
      0,
    );
    const lifelineHeight = Math.max(500, totalSteps * STEP_HEIGHT + 200);

    // アクターをノードに変換
    const actorNodes: Node[] = diagram.actors.map((actor, index) => ({
      id: actor.id,
      type: "actor",
      position: { x: index * (ACTOR_WIDTH + ACTOR_GAP), y: 0 },
      data: {
        label: actor.name,
        actorType: actor.type,
        scope: actor.scope,
        color: actor.color,
        lifelineHeight, // 動的な高さを渡す
      },
      draggable: true,
    }));

    // アクターIDからX座標へのマップを作成
    const actorPositions = new Map<string, number>();
    diagram.actors.forEach((actor, index) => {
      actorPositions.set(actor.id, index * (ACTOR_WIDTH + ACTOR_GAP));
    });

    // フローからエッジとトリガーノードを生成
    const edges: Edge[] = [];
    const triggerNodes: Node[] = []; // トリガーノード用配列
    let stepIndex = 0;

    diagram.flows.forEach((flow) => {
      // トリガーノードの生成
      if (
        flow.trigger &&
        flow.trigger.actor &&
        actorPositions.has(flow.trigger.actor)
      ) {
        const actorX = actorPositions.get(flow.trigger.actor) ?? 0;
        const triggerY = START_Y + stepIndex * STEP_HEIGHT - 40; // 最初のステップの少し上

        triggerNodes.push({
          id: `trigger-${flow.id}`,
          type: "input", // 入力っぽい見た目に
          position: { x: actorX - 120, y: triggerY }, // アクターの左側に配置
          data: {
            label: `Trigger: ${flow.trigger.action} ${
              flow.trigger.target ? `(${flow.trigger.target})` : ""
            }`,
          },
          style: {
            background: "#fef3c7", // 薄い黄色
            border: "1px solid #d97706",
            width: 150,
            fontSize: "12px",
          },
          draggable: false,
        });
      }

      flow.steps.forEach((step) => {
        if (step.from && step.to) {
          // ターゲットアクターの情報取得（色決定用）
          const targetActor = diagram.actors.find((a) => a.id === step.to);
          const targetType = targetActor?.type || "component";
          const targetScope = targetActor?.scope || "local";

          // 関連する状態の名前取得（通知ラベル用）
          const relatedState = step.state
            ? diagram.states.find((s) => s.id === step.state)
            : null;
          const stateName = relatedState?.name;

          const sourceX = actorPositions.get(step.from) ?? 0;
          const targetX = actorPositions.get(step.to) ?? 0;

          const isDispatch = step.type === "dispatch";
          const isSubscribe = step.type === "subscribe";

          // 色の決定：Dispatchは常にグレー、それ以外（StateChange, Subscribe）はターゲット/スコープ色
          const color = isDispatch
            ? "#64748b"
            : getColor(targetType, targetScope);

          // MessageEdgeに渡すデータも、Dispatchの場合はデフォルト（グレー）になるように調整
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
          stepIndex++;
        }
      });
      stepIndex++; // フロー間の間隔
    });

    return {
      initialNodes: [...actorNodes, ...triggerNodes],
      initialEdges: edges,
    };
  }, [diagram]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // ノード/エッジの更新時にリセット
  useMemo(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [initialNodes, initialEdges, setNodes, setEdges]);

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
