import { create } from "zustand";
import type { Diagram, Actor, State, Flow, Condition } from "@/types/diagram";
import { saveDiagram as saveToDb } from "@/db/database";

interface DiagramStore {
  /** 現在編集中のダイアグラム */
  diagram: Diagram | null;
  /** 保存済み基準時刻 */
  lastSavedAt: Date | null;
  /** 未保存変更の有無 */
  isDirty: boolean;
  /** ダイアグラムを設定 */
  setDiagram: (
    diagram: Diagram | null,
    options?: {
      isDirty?: boolean;
      lastSavedAt?: Date | null;
    },
  ) => void;
  /** ダイアグラム名を更新 */
  renameDiagram: (name: string) => void;
  /** ダイアグラムをDBに保存 */
  saveDiagram: () => Promise<void>;

  // アクター操作
  addActor: (actor: Actor) => void;
  updateActor: (id: string, updates: Partial<Actor>) => void;
  deleteActor: (id: string) => void;

  // 状態操作
  addState: (state: State) => void;
  updateState: (id: string, updates: Partial<State>) => void;
  deleteState: (id: string) => void;

  // フロー操作
  addFlow: (flow: Flow) => void;
  updateFlow: (id: string, updates: Partial<Flow>) => void;
  deleteFlow: (id: string) => void;

  // 条件操作
  addCondition: (condition: Condition) => void;
  updateCondition: (id: string, updates: Partial<Condition>) => void;
  deleteCondition: (id: string) => void;
}

export const useDiagramStore = create<DiagramStore>((set, get) => ({
  diagram: null,
  lastSavedAt: null,
  isDirty: false,

  setDiagram: (diagram, options) =>
    set((state) => ({
      diagram,
      isDirty: options?.isDirty ?? false,
      lastSavedAt: diagram
        ? options?.lastSavedAt !== undefined
          ? options.lastSavedAt
          : state.lastSavedAt
        : null,
    })),

  renameDiagram: (name) =>
    set((state) => {
      if (!state.diagram) return state;
      return {
        diagram: {
          ...state.diagram,
          name,
        },
        isDirty: true,
      };
    }),

  saveDiagram: async () => {
    const { diagram } = get();
    if (!diagram) return;

    const updated = { ...diagram, updatedAt: new Date() };
    await saveToDb(updated);
    set({ diagram: updated, isDirty: false, lastSavedAt: updated.updatedAt });
  },

  // アクター操作
  addActor: (actor) =>
    set((state) => {
      if (!state.diagram) return state;
      return {
        diagram: {
          ...state.diagram,
          actors: [...state.diagram.actors, actor],
        },
        isDirty: true,
      };
    }),

  updateActor: (id, updates) =>
    set((state) => {
      if (!state.diagram) return state;
      return {
        diagram: {
          ...state.diagram,
          actors: state.diagram.actors.map((a) =>
            a.id === id ? { ...a, ...updates } : a,
          ),
        },
        isDirty: true,
      };
    }),

  deleteActor: (id) =>
    set((state) => {
      if (!state.diagram) return state;
      return {
        diagram: {
          ...state.diagram,
          actors: state.diagram.actors.filter((a) => a.id !== id),
        },
        isDirty: true,
      };
    }),

  // 状態操作
  addState: (newState) =>
    set((state) => {
      if (!state.diagram) return state;
      return {
        diagram: {
          ...state.diagram,
          states: [...state.diagram.states, newState],
        },
        isDirty: true,
      };
    }),

  updateState: (id, updates) =>
    set((state) => {
      if (!state.diagram) return state;
      return {
        diagram: {
          ...state.diagram,
          states: state.diagram.states.map((s) =>
            s.id === id ? { ...s, ...updates } : s,
          ),
        },
        isDirty: true,
      };
    }),

  deleteState: (id) =>
    set((state) => {
      if (!state.diagram) return state;
      return {
        diagram: {
          ...state.diagram,
          states: state.diagram.states.filter((s) => s.id !== id),
        },
        isDirty: true,
      };
    }),

  // フロー操作
  addFlow: (flow) =>
    set((state) => {
      if (!state.diagram) return state;
      return {
        diagram: {
          ...state.diagram,
          flows: [...state.diagram.flows, flow],
        },
        isDirty: true,
      };
    }),

  updateFlow: (id, updates) =>
    set((state) => {
      if (!state.diagram) return state;
      return {
        diagram: {
          ...state.diagram,
          flows: state.diagram.flows.map((f) =>
            f.id === id ? { ...f, ...updates } : f,
          ),
        },
        isDirty: true,
      };
    }),

  deleteFlow: (id) =>
    set((state) => {
      if (!state.diagram) return state;
      return {
        diagram: {
          ...state.diagram,
          flows: state.diagram.flows.filter((f) => f.id !== id),
        },
        isDirty: true,
      };
    }),

  // 条件操作
  addCondition: (condition) =>
    set((state) => {
      if (!state.diagram) return state;
      return {
        diagram: {
          ...state.diagram,
          conditions: [...state.diagram.conditions, condition],
        },
        isDirty: true,
      };
    }),

  updateCondition: (id, updates) =>
    set((state) => {
      if (!state.diagram) return state;
      return {
        diagram: {
          ...state.diagram,
          conditions: state.diagram.conditions.map((c) =>
            c.id === id ? { ...c, ...updates } : c,
          ),
        },
        isDirty: true,
      };
    }),

  deleteCondition: (id) =>
    set((state) => {
      if (!state.diagram) return state;
      return {
        diagram: {
          ...state.diagram,
          conditions: state.diagram.conditions.filter((c) => c.id !== id),
        },
        isDirty: true,
      };
    }),
}));
