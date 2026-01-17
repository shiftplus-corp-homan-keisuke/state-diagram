import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";

interface ActorNodeData {
  label: string;
  actorType: "component" | "store" | "service" | "external";
  color?: string;
}

const actorTypeStyles: Record<
  string,
  { bg: string; border: string; icon: string }
> = {
  component: { bg: "bg-blue-50", border: "border-blue-500", icon: "🧩" },
  store: { bg: "bg-green-50", border: "border-green-500", icon: "📦" },
  service: { bg: "bg-purple-50", border: "border-purple-500", icon: "⚙️" },
  external: { bg: "bg-orange-50", border: "border-orange-500", icon: "🌐" },
};

export const ActorNode = memo(function ActorNode({
  data,
  selected,
}: NodeProps & { data: ActorNodeData }) {
  const style = actorTypeStyles[data.actorType] ?? actorTypeStyles.component;

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
          <p className="text-xs text-gray-500 capitalize">{data.actorType}</p>
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
          height: "500px",
          borderStyle: "dashed",
          borderWidth: "0 1px 0 0",
          borderColor: "#d1d5db",
        }}
      />
    </div>
  );
});
