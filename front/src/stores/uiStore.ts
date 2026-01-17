import { create } from "zustand";

interface UIStore {
  /** 現在選択中のアクターID */
  selectedActorId: string | null;
  /** 現在選択中の状態ID */
  selectedStateId: string | null;
  /** 現在選択中のフローID */
  selectedFlowId: string | null;

  // サイドバーパネルの開閉状態
  isActorPanelOpen: boolean;
  isStatePanelOpen: boolean;
  isFlowPanelOpen: boolean;

  // モーダル状態
  isActorModalOpen: boolean;
  isStateModalOpen: boolean;
  isFlowModalOpen: boolean;
  isJsonModalOpen: boolean;

  // 編集対象（nullなら新規作成）
  editingActorId: string | null;
  editingStateId: string | null;
  editingFlowId: string | null;

  // 選択操作
  selectActor: (id: string | null) => void;
  selectState: (id: string | null) => void;
  selectFlow: (id: string | null) => void;

  // パネル開閉
  toggleActorPanel: () => void;
  toggleStatePanel: () => void;
  toggleFlowPanel: () => void;

  // モーダル操作
  openActorModal: (editId?: string) => void;
  closeActorModal: () => void;
  openStateModal: (editId?: string) => void;
  closeStateModal: () => void;
  openFlowModal: (editId?: string) => void;
  closeFlowModal: () => void;
  openJsonModal: () => void;
  closeJsonModal: () => void;
}

export const useUIStore = create<UIStore>((set) => ({
  selectedActorId: null,
  selectedStateId: null,
  selectedFlowId: null,

  isActorPanelOpen: true,
  isStatePanelOpen: true,
  isFlowPanelOpen: true,

  isActorModalOpen: false,
  isStateModalOpen: false,
  isFlowModalOpen: false,
  isJsonModalOpen: false,

  editingActorId: null,
  editingStateId: null,
  editingFlowId: null,

  selectActor: (id) => set({ selectedActorId: id }),
  selectState: (id) => set({ selectedStateId: id }),
  selectFlow: (id) => set({ selectedFlowId: id }),

  toggleActorPanel: () =>
    set((s) => ({ isActorPanelOpen: !s.isActorPanelOpen })),
  toggleStatePanel: () =>
    set((s) => ({ isStatePanelOpen: !s.isStatePanelOpen })),
  toggleFlowPanel: () => set((s) => ({ isFlowPanelOpen: !s.isFlowPanelOpen })),

  openActorModal: (editId) =>
    set({ isActorModalOpen: true, editingActorId: editId ?? null }),
  closeActorModal: () => set({ isActorModalOpen: false, editingActorId: null }),
  openStateModal: (editId) =>
    set({ isStateModalOpen: true, editingStateId: editId ?? null }),
  closeStateModal: () => set({ isStateModalOpen: false, editingStateId: null }),
  openFlowModal: (editId) =>
    set({ isFlowModalOpen: true, editingFlowId: editId ?? null }),
  closeFlowModal: () => set({ isFlowModalOpen: false, editingFlowId: null }),
  openJsonModal: () => set({ isJsonModalOpen: true }),
  closeJsonModal: () => set({ isJsonModalOpen: false }),
}));
