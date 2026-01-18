import { memo } from "react";
import { EdgeLabelRenderer, type EdgeProps } from "@xyflow/react";
import type { StateScope } from "@/types/diagram";

interface MessageEdgeData extends Record<string, unknown> {
  label?: string;
  stepType?: string;
  scope?: StateScope;
  yPosition?: number;
  sourceX?: number;
  targetX?: number;
  stateName?: string;
  targetAction?: string;
  conditionExpression?: string;
  isAsync?: boolean;
}

const stepTypeLabels: Record<string, string> = {
  dispatch: "→",
  stateChange: "⟳",
  subscribe: "◎",
  effect: "⚡",
  render: "🔄",
};

export const MessageEdge = memo(function MessageEdge({
  id,
  sourceX, // React Flowからの正確なハンドル位置を使用
  targetX,
  data,
  style,
}: EdgeProps & { data: MessageEdgeData }) {
  const yPosition = data?.yPosition ?? 100;
  const scope = data?.scope ?? "local";
  const label = data?.label ?? "";
  const stepType = data?.stepType ?? "dispatch";
  const stateName = data?.stateName;
  const targetAction = data?.targetAction;
  const conditionExpression = data?.conditionExpression;
  const isAsync = data?.isAsync;

  // ラベルテキストの構築
  let displayLabel = label;
  if (stepType === "stateChange" && stateName) {
    // 状態変更の場合は「状態名 ← 値」のように表示
    displayLabel = `${stateName} ← ${label}`;
  }

  // 水平エッジのパスを計算（ハンドル位置をそのまま使用）
  const startX = Math.min(sourceX, targetX);
  const endX = Math.max(sourceX, targetX);
  const isLeftToRight = sourceX < targetX;

  // 矢印の方向を決定
  const arrowX = isLeftToRight ? endX - 8 : startX + 8;
  const arrowDirection = isLeftToRight ? 1 : -1;

  // SVGパス
  const edgePath = `M ${startX} ${yPosition} L ${endX} ${yPosition}`;

  // ラベル位置（中央）
  const labelX = (startX + endX) / 2;
  const labelY = yPosition;

  const targetType = (data?.targetType as string) ?? "component";
  const targetScope = (data?.targetScope as StateScope) ?? "local";

  // バブル/ラベルのスタイル決定ロジック
  const getBubbleStyle = (type: string, scope?: StateScope) => {
    if (type === "component")
      return {
        bg: "bg-blue-500",
        border: "border-blue-600",
        tri: "border-b-blue-500",
        text: "text-white",
      };
    if (type === "service")
      return {
        bg: "bg-purple-500",
        border: "border-purple-600",
        tri: "border-b-purple-500",
        text: "text-white",
      };
    if (type === "store") {
      if (scope === "global")
        return {
          bg: "bg-green-500",
          border: "border-green-600",
          tri: "border-b-green-500",
          text: "text-white",
        };
      if (scope === "subtree")
        return {
          bg: "bg-teal-500", // Tailwind default teal
          border: "border-teal-600",
          tri: "border-b-teal-500",
          text: "text-white",
        };
      return {
        bg: "bg-orange-500",
        border: "border-orange-600",
        tri: "border-b-orange-500",
        text: "text-white",
      };
    }
    // Default / External / Dispatch
    return {
      bg: "bg-slate-500",
      border: "border-slate-600",
      tri: "border-b-slate-500",
      text: "text-white",
    };
  };

  const bubbleStyle = getBubbleStyle(targetType, targetScope);

  // strokeDasharray は scope に依存するため残す
  const strokeDasharray =
    scope === "local" ? "4 4" : scope === "subtree" ? "8 4" : undefined;

  return (
    <>
      {/* エッジの線 */}
      <path
        id={id}
        d={edgePath}
        fill="none"
        stroke={style?.stroke ?? "#64748b"} // styleがあればそれを使用、なければデフォルト
        strokeWidth={style?.strokeWidth ?? 1}
        strokeDasharray={strokeDasharray}
        className={stepType === "subscribe" ? "animate-pulse" : ""}
      />

      {/* 矢印 (色は線の色に合わせる) */}
      <polygon
        points={`${arrowX},${yPosition - 4} ${arrowX + arrowDirection * 8},${yPosition} ${arrowX},${yPosition + 4}`}
        fill={style?.stroke ?? "#64748b"}
        className="pointer-events-none"
      />

      {/* ラベル（エッジ中央） */}
      {/* ラベル（エッジ中央） - Dispatchの場合はターゲットの吹き出しのみで十分なので非表示 */}
      {stepType !== "dispatch" && (
        <EdgeLabelRenderer>
          <div
            className={`
            absolute px-2 py-0.5 rounded text-xs font-medium shadow-sm
            ${bubbleStyle.bg} ${bubbleStyle.text}
            pointer-events-all nodrag nopan
            whitespace-nowrap z-10
          `}
            style={{
              transform: `translate(-50%, -100%) translate(${labelX}px, ${
                labelY - 5
              }px)`,
            }}
          >
            <span className="mr-1">{stepTypeLabels[stepType] ?? "→"}</span>
            {displayLabel}
          </div>
        </EdgeLabelRenderer>
      )}

      {/* ターゲットアクションの吹き出し（矢印の先端） */}
      {targetAction && (
        <EdgeLabelRenderer>
          <div
            className={`
              absolute px-2 py-1 rounded text-xs shadow-sm pointer-events-all nodrag nopan z-20 whitespace-nowrap hover:z-50 transition-all
              ${bubbleStyle.bg} ${bubbleStyle.border} ${bubbleStyle.text} border
            `}
            style={{
              // 矢印の下側に表示（通知ラベルとの被りを回避）
              transform: `translate(-50%, 0) translate(${arrowX}px, ${
                yPosition + 10
              }px)`,
            }}
          >
            {/* 上向きの三角（吹き出しのツノ） */}
            <div
              className={`absolute bottom-full left-1/2 -translate-x-1/2 -mb-px border-4 border-transparent ${bubbleStyle.tri}`}
            ></div>
            {targetAction}
          </div>
        </EdgeLabelRenderer>
      )}

      {/* 条件バッジ（エッジの開始位置付近） */}
      {conditionExpression && (
        <EdgeLabelRenderer>
          <div
            className="absolute px-2 py-0.5 rounded-full text-xs font-medium shadow-sm pointer-events-all nodrag nopan z-30 whitespace-nowrap bg-amber-500 text-white border border-amber-600"
            style={{
              transform: `translate(-50%, -50%) translate(${startX + 50}px, ${yPosition}px)`,
            }}
          >
            🔀 if: {conditionExpression}
          </div>
        </EdgeLabelRenderer>
      )}

      {/* 非同期バッジ（エッジの終了位置付近） */}
      {isAsync && (
        <EdgeLabelRenderer>
          <div
            className="absolute px-2 py-0.5 rounded-full text-xs font-medium shadow-sm pointer-events-all nodrag nopan z-30 whitespace-nowrap bg-purple-500 text-white border border-purple-600"
            style={{
              transform: `translate(-50%, -50%) translate(${endX - 40}px, ${yPosition}px)`,
            }}
          >
            ⏳ async
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
});
