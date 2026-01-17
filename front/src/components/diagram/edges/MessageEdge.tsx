import { memo } from "react";
import { EdgeLabelRenderer, type EdgeProps } from "@xyflow/react";
import type { StateScope } from "@/types/diagram";

interface MessageEdgeData {
  label: string;
  stepType: string;
  scope: StateScope;
  yPosition: number;
  sourceX: number;
  targetX: number;
}

const scopeColors: Record<StateScope, string> = {
  local: "bg-gray-500",
  subtree: "bg-blue-500",
  global: "bg-green-500",
};

const scopeStrokeColors: Record<StateScope, string> = {
  local: "#6b7280",
  subtree: "#3b82f6",
  global: "#22c55e",
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
  targetX,
  data,
  style,
}: EdgeProps & { data: MessageEdgeData }) {
  const yPosition = data?.yPosition ?? 100;
  const scope = data?.scope ?? "local";
  const label = data?.label ?? "";
  const stepType = data?.stepType ?? "dispatch";

  // 水平エッジのパスを計算
  const nodeWidth = 150;
  const startX = Math.min(sourceX, targetX) + nodeWidth / 2;
  const endX = Math.max(sourceX, targetX) + nodeWidth / 2;
  const isLeftToRight = sourceX < targetX;

  // 矢印の方向を決定
  const arrowX = isLeftToRight ? endX - 8 : startX + 8;
  const arrowDirection = isLeftToRight ? 1 : -1;

  // SVGパス
  const edgePath = `M ${startX} ${yPosition} L ${endX} ${yPosition}`;

  // ラベル位置（中央）
  const labelX = (startX + endX) / 2;
  const labelY = yPosition;

  const strokeColor = scopeStrokeColors[scope];
  const strokeWidth = scope === "global" ? 2 : 1;
  const strokeDasharray =
    scope === "local" ? "4 4" : scope === "subtree" ? "8 4" : undefined;

  return (
    <>
      {/* エッジの線 */}
      <path
        id={id}
        d={edgePath}
        fill="none"
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        strokeDasharray={strokeDasharray}
        style={style}
        className={stepType === "subscribe" ? "animate-pulse" : ""}
      />

      {/* 矢印 */}
      <polygon
        points={`${arrowX},${yPosition - 4} ${arrowX + arrowDirection * 8},${yPosition} ${arrowX},${yPosition + 4}`}
        fill={strokeColor}
      />

      {/* ラベル */}
      <EdgeLabelRenderer>
        <div
          className={`
            absolute px-2 py-0.5 rounded text-xs font-medium text-white shadow-sm
            ${scopeColors[scope]}
            pointer-events-all nodrag nopan
          `}
          style={{
            transform: `translate(-50%, -100%) translate(${labelX}px, ${labelY - 8}px)`,
          }}
        >
          <span className="mr-1">{stepTypeLabels[stepType] ?? "→"}</span>
          {label}
        </div>
      </EdgeLabelRenderer>
    </>
  );
});
