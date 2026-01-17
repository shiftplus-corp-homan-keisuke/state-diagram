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

// スコープに応じたエッジスタイル
const scopeEdgeStyles: Record<
  StateScope,
  { strokeDasharray?: string; strokeWidth: number }
> = {
  local: { strokeDasharray: "4 4", strokeWidth: 1 },
  subtree: { strokeDasharray: "8 4", strokeWidth: 2 },
  global: { strokeWidth: 3 },
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

    // アクターをノードに変換
    const actorNodes: Node[] = diagram.actors.map((actor, index) => ({
      id: actor.id,
      type: "actor",
      position: { x: index * (ACTOR_WIDTH + ACTOR_GAP), y: 0 },
      data: {
        label: actor.name,
        actorType: actor.type,
        color: actor.color,
      },
      draggable: true,
    }));

    // フローからエッジを生成
    const edges: Edge[] = [];
    let stepIndex = 0;

    diagram.flows.forEach((flow) => {
      flow.steps.forEach((step) => {
        if (step.from && step.to && step.from !== step.to) {
          // 関連する状態のスコープを取得
          const relatedState = step.state
            ? diagram.states.find((s) => s.id === step.state)
            : null;
          const scope = relatedState?.scope ?? "local";

          edges.push({
            id: `${flow.id}-${step.id}`,
            source: step.from,
            target: step.to,
            type: "message",
            data: {
              label: step.action || step.description || step.type,
              stepType: step.type,
              scope,
              yPosition: START_Y + stepIndex * STEP_HEIGHT,
            },
            style: scopeEdgeStyles[scope],
            animated: step.type === "subscribe",
          });
          stepIndex++;
        }
      });
    });

    return { initialNodes: actorNodes, initialEdges: edges };
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
