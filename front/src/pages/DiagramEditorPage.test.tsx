import { act, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import DiagramEditorPage from "@/pages/DiagramEditorPage";
import { getDiagramById } from "@/db/database";
import { useDiagramStore } from "@/stores/diagramStore";
import { useUIStore } from "@/stores/uiStore";
import { createDiagram } from "@/test/factories";

const navigateMock = vi.fn();

vi.mock("@tanstack/react-router", () => ({
  useParams: () => ({ diagramId: "diagram-1" }),
  useNavigate: () => navigateMock,
}));

vi.mock("react-hot-toast", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock("@/db/database", () => ({
  getDiagramById: vi.fn(),
}));

vi.mock("@/components/layout/Sidebar", () => ({
  Sidebar: () => <div data-testid="sidebar" />,
}));

vi.mock("@/components/diagram/SequenceDiagram", () => ({
  SequenceDiagram: () => <div data-testid="sequence-diagram" />,
}));

vi.mock("@/components/editor/ActorModal", () => ({
  ActorModal: () => null,
}));

vi.mock("@/components/editor/StateModal", () => ({
  StateModal: () => null,
}));

vi.mock("@/components/editor/FlowModal", () => ({
  FlowModal: () => null,
}));

vi.mock("@/components/editor/ConditionModal", () => ({
  ConditionModal: () => null,
}));

vi.mock("@/components/editor/JsonModal", () => ({
  JsonModal: () => null,
}));

describe("DiagramEditorPage 保存状態表示", () => {
  beforeEach(() => {
    useDiagramStore.setState({
      diagram: null,
      isDirty: false,
      lastSavedAt: null,
    });
    useUIStore.setState({ isJsonModalOpen: false });
    navigateMock.mockReset();
    vi.mocked(getDiagramById).mockResolvedValue(createDiagram());
  });

  it("ロード直後は保存済みを表示する", async () => {
    render(<DiagramEditorPage />);

    expect(await screen.findByText("保存済み")).toBeInTheDocument();
  });

  it("storeがdirtyなら変更ありを表示する", async () => {
    render(<DiagramEditorPage />);
    await screen.findByText("保存済み");

    act(() => {
      useDiagramStore.setState({
        diagram: createDiagram(),
        isDirty: true,
        lastSavedAt: new Date("2026-03-02T00:00:00.000Z"),
      });
    });

    expect(screen.getByText("変更あり")).toBeInTheDocument();
  });

  it("lastSavedAtがなければ未保存を表示する", async () => {
    render(<DiagramEditorPage />);
    await screen.findByText("保存済み");

    act(() => {
      useDiagramStore.setState({
        diagram: createDiagram(),
        isDirty: false,
        lastSavedAt: null,
      });
    });

    await waitFor(() => {
      expect(screen.getByText("未保存")).toBeInTheDocument();
    });
  });
});
