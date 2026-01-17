import { memo } from "react";
import {
  BaseEdge,
  EdgeLabelRenderer,
  getStraightPath,
  type EdgeProps,
} from "@xyflow/react";
import type { StateScope } from "@/types/diagram";

interface MessageEdgeData {
  label: string;
  stepType: string;
  scope: StateScope;
  yPosition?: number;
}

const scopeColors: Record<StateScope, string> = {
  local: "bg-gray-500",
  subtree: "bg-blue-500",
  global: "bg-green-500",
};

const stepTypeLabels: Record<string, string> = {
  dispatch: "→",
  stateChange: "⟳",
  subscribe: "◎",
  effect: "⚡",
  render: "🔄",
};

export const MessageEdge = memo(function MessageEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  data,
  style,
}: EdgeProps & { data: MessageEdgeData }) {
  const [edgePath, labelX, labelY] = getStraightPath({
    sourceX,
    sourceY: sourceY + 80, // アクターノードの下から開始
    targetX,
    targetY: targetY + 80,
  });

  const scope = data?.scope ?? "local";
  const label = data?.label ?? "";
  const stepType = data?.stepType ?? "dispatch";

  return (
    <>
      <BaseEdge id={id} path={edgePath} style={style} />
      <EdgeLabelRenderer>
        <div
          className={`
            absolute px-2 py-1 rounded text-xs font-medium text-white
            ${scopeColors[scope]}
            pointer-events-all nodrag nopan
          `}
          style={{
            transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
          }}
        >
          <span className="mr-1">{stepTypeLabels[stepType] ?? "→"}</span>
          {label}
        </div>
      </EdgeLabelRenderer>
    </>
  );
});
