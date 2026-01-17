import Dexie, { type EntityTable } from "dexie";
import type { Diagram } from "@/types/diagram";

/** DB保存用のダイアグラム型（Date → string） */
export interface DiagramRecord extends Omit<
  Diagram,
  "createdAt" | "updatedAt"
> {
  createdAt: string;
  updatedAt: string;
}

class DiagramDatabase extends Dexie {
  diagrams!: EntityTable<DiagramRecord, "id">;

  constructor() {
    super("StateFlowVisualizer");
    this.version(1).stores({
      diagrams: "id, name, createdAt, updatedAt",
    });
  }
}

export const db = new DiagramDatabase();

/** ダイアグラム一覧を取得 */
export async function getAllDiagrams(): Promise<Diagram[]> {
  const records = await db.diagrams.orderBy("updatedAt").reverse().toArray();
  return records.map(recordToDiagram);
}

/** ダイアグラムをIDで取得 */
export async function getDiagramById(id: string): Promise<Diagram | undefined> {
  const record = await db.diagrams.get(id);
  return record ? recordToDiagram(record) : undefined;
}

/** ダイアグラムを保存（新規作成または更新） */
export async function saveDiagram(diagram: Diagram): Promise<void> {
  const record = diagramToRecord(diagram);
  await db.diagrams.put(record);
}

/** ダイアグラムを削除 */
export async function deleteDiagram(id: string): Promise<void> {
  await db.diagrams.delete(id);
}

/** Record → Diagram 変換 */
function recordToDiagram(record: DiagramRecord): Diagram {
  return {
    ...record,
    createdAt: new Date(record.createdAt),
    updatedAt: new Date(record.updatedAt),
  };
}

/** Diagram → Record 変換 */
function diagramToRecord(diagram: Diagram): DiagramRecord {
  return {
    ...diagram,
    createdAt: diagram.createdAt.toISOString(),
    updatedAt: diagram.updatedAt.toISOString(),
  };
}
