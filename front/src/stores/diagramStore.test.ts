import { beforeEach, describe, expect, it, vi } from "vitest";
import { createDiagram } from "@/test/factories";
import { useDiagramStore } from "@/stores/diagramStore";
import { saveDiagram as saveToDb } from "@/db/database";

vi.mock("@/db/database", () => ({
  saveDiagram: vi.fn(),
}));

describe("useDiagramStore", () => {
  beforeEach(() => {
    useDiagramStore.setState({
      diagram: null,
      lastSavedAt: null,
      isDirty: false,
    });
    vi.clearAllMocks();
  });

  it("編集時にdirty stateを立てる", () => {
    useDiagramStore.getState().setDiagram(createDiagram(), {
      lastSavedAt: new Date("2026-03-02T00:00:00.000Z"),
    });

    useDiagramStore.getState().renameDiagram("Renamed Diagram");

    const state = useDiagramStore.getState();
    expect(state.diagram?.name).toBe("Renamed Diagram");
    expect(state.isDirty).toBe(true);
    expect(state.lastSavedAt?.toISOString()).toBe("2026-03-02T00:00:00.000Z");
  });

  it("保存時にDB保存してdirty stateとlastSavedAtを更新する", async () => {
    const baseDiagram = createDiagram({ updatedAt: new Date("2026-03-02T00:00:00.000Z") });
    const saveSpy = vi.mocked(saveToDb).mockResolvedValue(undefined);

    useDiagramStore.getState().setDiagram(baseDiagram, {
      isDirty: true,
      lastSavedAt: new Date("2026-03-02T00:00:00.000Z"),
    });

    await useDiagramStore.getState().saveDiagram();

    const state = useDiagramStore.getState();
    expect(saveSpy).toHaveBeenCalledTimes(1);
    expect(saveSpy).toHaveBeenCalledWith(state.diagram);
    expect(state.isDirty).toBe(false);
    expect(state.lastSavedAt).toBeInstanceOf(Date);
    expect(state.lastSavedAt?.getTime()).toBe(state.diagram?.updatedAt.getTime());
    expect(state.lastSavedAt?.getTime()).toBeGreaterThan(baseDiagram.updatedAt.getTime());
  });

  it("diagram未設定時のsaveDiagramは何もしない", async () => {
    await useDiagramStore.getState().saveDiagram();

    expect(saveToDb).not.toHaveBeenCalled();
    expect(useDiagramStore.getState().isDirty).toBe(false);
  });
});
