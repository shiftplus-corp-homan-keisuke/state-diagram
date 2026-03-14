import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, within } from "@testing-library/react";
import { SequenceDiagram } from "@/components/diagram/SequenceDiagram";
import { useDiagramStore } from "@/stores/diagramStore";
import { useUIStore } from "@/stores/uiStore";
import { createDiagram } from "@/test/factories";

vi.mock("@xyflow/react", async () => {
  const React = await import("react");

  return {
    ReactFlowProvider: ({ children }: { children: ReactNode }) => <>{children}</>,
    ReactFlow: ({
      children,
      nodes,
      edges,
    }: {
      children?: ReactNode;
      nodes: unknown[];
      edges: unknown[];
    }) => (
      <div data-testid="react-flow">
        <span data-testid="node-count">{nodes.length}</span>
        <span data-testid="edge-count">{edges.length}</span>
        {children}
      </div>
    ),
    Background: () => null,
    Controls: () => null,
    MiniMap: () => null,
    Panel: ({ children }: { children: ReactNode }) => (
      <div data-testid="flow-panel">{children}</div>
    ),
    useNodesState: (initialNodes: unknown[]) => {
      const [nodes, setNodes] = React.useState(initialNodes);
      return [nodes, setNodes, vi.fn()] as const;
    },
    useEdgesState: (initialEdges: unknown[]) => {
      const [edges, setEdges] = React.useState(initialEdges);
      return [edges, setEdges, vi.fn()] as const;
    },
    useReactFlow: () => ({ fitView: vi.fn() }),
  };
});

describe("SequenceDiagram 異常データ表示", () => {
  beforeEach(() => {
    cleanup();
    useDiagramStore.setState({
      diagram: null,
      isDirty: false,
      lastSavedAt: null,
    });
    useUIStore.setState({
      focusFlowId: null,
      selectedActorId: null,
      selectedStateId: null,
      selectedFlowId: null,
    });
  });

  it("不整合データでは warning バナーと件数表示を出す", () => {
    useDiagramStore.setState({
      diagram: createDiagram({
        actors: [
          {
            id: "actor-1",
            type: "component",
            name: "App",
          },
        ],
        states: [
          {
            id: "state-1",
            name: "count",
            owner: "missing-owner",
          },
        ],
        flows: [
          {
            id: "flow-1",
            name: "Broken Flow",
            trigger: {
              type: "userAction",
              actor: "missing-trigger-actor",
              action: "click",
            },
            steps: [
              {
                id: "step-1",
                type: "stateChange",
                from: "actor-1",
                to: "missing-target",
                state: "missing-state",
                condition: "missing-condition",
                action: "update",
              },
            ],
          },
        ],
        conditions: [],
      }),
      isDirty: false,
      lastSavedAt: new Date("2026-03-02T00:00:00.000Z"),
    });

    const view = render(<SequenceDiagram />);

    const local = within(view.container);

    expect(local.getByTestId("flow-panel")).toBeInTheDocument();
    expect(local.getByText("異常データを検知しました")).toBeInTheDocument();
    expect(
      local.getByText("5件の問題を検知し、edge 1件 / trigger 1件をスキップしました。"),
    ).toBeInTheDocument();
    expect(local.getByText("state.owner 1")).toBeInTheDocument();
    expect(local.getByText("trigger.actor 1")).toBeInTheDocument();
    expect(local.getByText("step actor 1")).toBeInTheDocument();
    expect(local.getByText("step.state 1")).toBeInTheDocument();
    expect(local.getByText("step.condition 1")).toBeInTheDocument();
  });

  it("正常データでは warning バナーを出さない", () => {
    useDiagramStore.setState({
      diagram: createDiagram({
        actors: [
          {
            id: "actor-1",
            type: "component",
            name: "App",
          },
          {
            id: "actor-2",
            type: "store",
            name: "CartStore",
            scope: "global",
          },
        ],
        states: [
          {
            id: "state-1",
            name: "count",
            owner: "actor-2",
          },
        ],
        flows: [
          {
            id: "flow-1",
            name: "Valid Flow",
            trigger: {
              type: "userAction",
              actor: "actor-1",
              action: "click",
            },
            steps: [
              {
                id: "step-1",
                type: "stateChange",
                from: "actor-1",
                to: "actor-2",
                state: "state-1",
                action: "update",
              },
            ],
          },
        ],
        conditions: [],
      }),
      isDirty: false,
      lastSavedAt: new Date("2026-03-02T00:00:00.000Z"),
    });

    const view = render(<SequenceDiagram />);

    const local = within(view.container);

    expect(local.getByTestId("react-flow")).toBeInTheDocument();
    expect(local.queryByTestId("flow-panel")).not.toBeInTheDocument();
    expect(local.queryByText("異常データを検知しました")).not.toBeInTheDocument();
  });
});
