import type { Diagram } from "@/types/diagram";

export function createDiagram(overrides: Partial<Diagram> = {}): Diagram {
  return {
    id: "diagram-1",
    name: "Sample Diagram",
    description: "sample",
    createdAt: new Date("2026-03-01T00:00:00.000Z"),
    updatedAt: new Date("2026-03-02T00:00:00.000Z"),
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
        owner: "actor-1",
      },
    ],
    flows: [
      {
        id: "flow-1",
        name: "Increment",
        trigger: {
          type: "userAction",
          actor: "actor-1",
          action: "click increment",
        },
        steps: [
          {
            id: "step-1",
            type: "stateChange",
            from: "actor-1",
            state: "state-1",
            action: "increment",
          },
        ],
      },
    ],
    conditions: [
      {
        id: "condition-1",
        expression: "count > 0",
      },
    ],
    ...overrides,
  };
}
