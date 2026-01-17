import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";

interface ActorNodeData {
  label: string;
  actorType: "component" | "store" | "service" | "external";
  scope?: "local" | "subtree" | "global";
  color?: string;
  lifelineHeight?: number;
}

const getStyle = (type: string, scope?: string) => {
  if (type === "component")
    return { bg: "bg-blue-50", border: "border-blue-500", icon: "🧩" };
  if (type === "service")
    return { bg: "bg-purple-50", border: "border-purple-500", icon: "⚙️" };
  if (type === "store") {
    if (scope === "global")
      return { bg: "bg-green-50", border: "border-green-500", icon: "📦" };
    if (scope === "subtree")
      return { bg: "bg-teal-50", border: "border-teal-500", icon: "🗳️" };
    return { bg: "bg-orange-50", border: "border-orange-500", icon: "👜" };
  }
  return { bg: "bg-slate-50", border: "border-slate-500", icon: "🌐" };
};

export const ActorNode = memo(function ActorNode({
  data,
  selected,
}: NodeProps & { data: ActorNodeData }) {
  const style = getStyle(data.actorType, data.scope);
  const height = data.lifelineHeight ?? 500;

  return (
    <div
      className={`
        px-4 py-3 rounded-lg border-2 shadow-sm min-w-[120px]
        ${style.bg} ${style.border}
        ${selected ? "ring-2 ring-primary ring-offset-2" : ""}
      `}
    >
      <Handle type="target" position={Position.Top} className="!bg-gray-400" />
      <div className="flex items-center gap-2">
        <span className="text-lg">{style.icon}</span>
        <div>
          <p className="font-medium text-sm text-gray-800">{data.label}</p>
          <p className="text-xs text-gray-500 capitalize">
            {data.actorType}
            {data.actorType === "store" && data.scope ? ` (${data.scope})` : ""}
          </p>
        </div>
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-gray-400"
      />

      {/* ライフライン（縦線） */}
      <div
        className="absolute left-1/2 -translate-x-1/2 w-0.5 bg-gray-300 -z-10"
        style={{
          top: "100%",
          height: `${height}px`,
          borderStyle: "dashed",
          borderWidth: "0 1px 0 0",
          borderColor: "#d1d5db",
        }}
      />
    </div>
  );
});
