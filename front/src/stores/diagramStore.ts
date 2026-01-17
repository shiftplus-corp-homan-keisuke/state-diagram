import { create } from "zustand";
import type { Diagram, Actor, State, Flow, Condition } from "@/types/diagram";
import { saveDiagram as saveToDb } from "@/db/database";

interface DiagramStore {
  /** 現在編集中のダイアグラム */
  diagram: Diagram | null;
  /** ダイアグラムを設定 */
  setDiagram: (diagram: Diagram | null) => void;
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

  setDiagram: (diagram) => set({ diagram }),

  saveDiagram: async () => {
    const { diagram } = get();
    if (diagram) {
      const updated = { ...diagram, updatedAt: new Date() };
      set({ diagram: updated });
      await saveToDb(updated);
    }
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
      };
    }),
}));
