import { afterAll, beforeEach, describe, expect, it } from "vitest";
import {
  db,
  deleteDiagram,
  getAllDiagrams,
  getDiagramById,
  saveDiagram,
} from "@/db/database";
import { createDiagram } from "@/test/factories";

describe("database", () => {
  beforeEach(async () => {
    await db.diagrams.clear();
  });

  afterAll(async () => {
    await db.delete();
  });

  it("saveDiagram した内容を getDiagramById で Date を保ったまま取得できる", async () => {
    const diagram = createDiagram({
      id: "diagram-roundtrip",
      createdAt: new Date("2026-03-01T10:00:00.000Z"),
      updatedAt: new Date("2026-03-02T11:30:00.000Z"),
    });

    await saveDiagram(diagram);

    const result = await getDiagramById("diagram-roundtrip");

    expect(result).toEqual(diagram);
    expect(result?.createdAt).toBeInstanceOf(Date);
    expect(result?.updatedAt).toBeInstanceOf(Date);
  });

  it("getAllDiagrams は updatedAt 降順で返し Date を復元する", async () => {
    const olderDiagram = createDiagram({
      id: "diagram-older",
      name: "Older",
      createdAt: new Date("2026-03-01T00:00:00.000Z"),
      updatedAt: new Date("2026-03-02T00:00:00.000Z"),
    });
    const newerDiagram = createDiagram({
      id: "diagram-newer",
      name: "Newer",
      createdAt: new Date("2026-03-03T00:00:00.000Z"),
      updatedAt: new Date("2026-03-04T00:00:00.000Z"),
    });

    await saveDiagram(olderDiagram);
    await saveDiagram(newerDiagram);

    const results = await getAllDiagrams();

    expect(results).toHaveLength(2);
    expect(results.map((diagram) => diagram.id)).toEqual([
      "diagram-newer",
      "diagram-older",
    ]);
    expect(results[0]?.updatedAt).toBeInstanceOf(Date);
    expect(results[1]?.createdAt).toBeInstanceOf(Date);
    expect(results[0]?.updatedAt.toISOString()).toBe("2026-03-04T00:00:00.000Z");
    expect(results[1]?.updatedAt.toISOString()).toBe("2026-03-02T00:00:00.000Z");
  });

  it("deleteDiagram した内容は取得できなくなる", async () => {
    const diagram = createDiagram({ id: "diagram-delete" });

    await saveDiagram(diagram);
    await deleteDiagram("diagram-delete");

    const result = await getDiagramById("diagram-delete");

    expect(result).toBeUndefined();
  });
});
