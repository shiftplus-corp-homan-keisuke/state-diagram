import { describe, expect, it, vi, afterEach } from "vitest";
import { validateDiagramImport } from "@/lib/diagramImport";

describe("validateDiagramImport", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("不正なJSONをerrorとして返す", () => {
    const result = validateDiagramImport("{invalid json}");

    expect(result.status).toBe("error");
    expect(result.diagram).toBeNull();
    expect(result.summary.error).toBe(1);
    expect(result.messages).toContainEqual({
      level: "error",
      text: "JSON の解析に失敗しました",
    });
  });

  it("不足値を補正しつつwarningとして取り込める", () => {
    vi.spyOn(globalThis.crypto, "randomUUID").mockReturnValue(
      "00000000-0000-0000-0000-000000000000",
    );

    const result = validateDiagramImport(
      JSON.stringify({
        name: "Imported Diagram",
        createdAt: "invalid-date",
        updatedAt: "2026-03-10T00:00:00.000Z",
        actors: [
          {
            id: "actor-1",
            type: "component",
            name: "App",
            scope: "invalid-scope",
          },
        ],
        states: [
          {
            id: "state-1",
            name: "count",
            owner: "actor-1",
            scope: "legacy",
          },
        ],
        conditions: [
          {
            id: "condition-1",
            expression: "count > 0",
          },
        ],
        flows: [
          {
            id: "flow-1",
            name: "Increment",
            trigger: {
              type: "userAction",
              actor: "actor-1",
              action: "click",
            },
            steps: [
              {
                id: "step-1",
                type: "stateChange",
                from: "missing-actor",
                state: "missing-state",
                condition: "missing-condition",
              },
            ],
          },
        ],
      }),
    );

    expect(result.status).toBe("warning");
    expect(result.diagram).not.toBeNull();
    expect(result.diagram?.id).toBe("00000000-0000-0000-0000-000000000000");
    expect(result.diagram?.states[0]).toEqual({
      id: "state-1",
      name: "count",
      owner: "actor-1",
      dataType: undefined,
      description: undefined,
    });
    expect(result.diagram?.flows[0].steps[0]).toMatchObject({
      id: "step-1",
      type: "stateChange",
      from: undefined,
      state: undefined,
      condition: undefined,
    });
    expect(result.summary).toMatchObject({
      actor: 1,
      state: 1,
      flow: 1,
      condition: 1,
      warning: 7,
      fix: 7,
      skip: 0,
      error: 0,
    });
  });

  it("currentDiagramIdを優先して既存IDを維持する", () => {
    const result = validateDiagramImport(
      JSON.stringify({
        id: "external-id",
        name: "Imported Diagram",
        createdAt: "2026-03-01T00:00:00.000Z",
        updatedAt: "2026-03-02T00:00:00.000Z",
        actors: [],
        states: [],
        conditions: [],
        flows: [],
      }),
      { currentDiagramId: "current-id" },
    );

    expect(result.status).toBe("success");
    expect(result.diagram?.id).toBe("current-id");
    expect(result.messages).toContainEqual({
      level: "success",
      text: "インポート可能です",
    });
  });
});
