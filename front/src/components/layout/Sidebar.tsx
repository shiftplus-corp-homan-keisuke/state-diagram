import { Plus, ChevronDown, ChevronRight, Trash2, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useDiagramStore } from "@/stores/diagramStore";
import { useUIStore } from "@/stores/uiStore";
import type { StateScope } from "@/types/diagram";

const scopeIcons: Record<StateScope, string> = {
  local: "📍",
  subtree: "🌲",
  global: "🌍",
};

const actorTypeColors: Record<string, string> = {
  component: "bg-blue-500",
  store: "bg-green-500",
  service: "bg-purple-500",
  external: "bg-orange-500",
};

export function Sidebar() {
  const { diagram, deleteActor, deleteState, deleteFlow, deleteCondition } =
    useDiagramStore();
  const {
    isActorPanelOpen,
    isStatePanelOpen,
    isFlowPanelOpen,
    isConditionPanelOpen,
    toggleActorPanel,
    toggleStatePanel,
    toggleFlowPanel,
    toggleConditionPanel,
    openActorModal,
    openStateModal,
    openFlowModal,
    openConditionModal,
    selectedActorId,
    selectedStateId,
    selectedFlowId,
    selectActor,
    selectState,
    selectFlow,
    focusFlow,
  } = useUIStore();

  if (!diagram) return null;

  return (
    <aside className="w-64 border-r bg-muted/30 flex flex-col">
      <ScrollArea className="flex-1">
        <div className="p-3 space-y-4">
          {/* アクターセクション */}
          <section>
            <button
              className="flex items-center justify-between w-full text-sm font-medium mb-2"
              onClick={toggleActorPanel}
            >
              <span className="flex items-center gap-1">
                {isActorPanelOpen ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
                アクター
              </span>
              <span className="text-xs text-muted-foreground">
                {diagram.actors.length}
              </span>
            </button>
            {isActorPanelOpen && (
              <div className="space-y-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-xs"
                  onClick={() => openActorModal()}
                >
                  <Plus className="h-3 w-3 mr-1" />
                  追加
                </Button>
                {diagram.actors.map((actor) => (
                  <div
                    key={actor.id}
                    className={`group flex items-center justify-between px-2 py-1 rounded text-sm cursor-pointer hover:bg-muted ${
                      selectedActorId === actor.id ? "bg-muted" : ""
                    }`}
                    onClick={() => selectActor(actor.id)}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className={`w-2 h-2 rounded-full ${actorTypeColors[actor.type]}`}
                      />
                      <span className="truncate">{actor.name}</span>
                    </div>
                    <div className="hidden group-hover:flex items-center gap-1">
                      <button
                        className="p-0.5 hover:text-primary"
                        onClick={(e) => {
                          e.stopPropagation();
                          openActorModal(actor.id);
                        }}
                      >
                        <Edit2 className="h-3 w-3" />
                      </button>
                      <button
                        className="p-0.5 hover:text-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteActor(actor.id);
                        }}
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <Separator />

          {/* 状態セクション */}
          <section>
            <button
              className="flex items-center justify-between w-full text-sm font-medium mb-2"
              onClick={toggleStatePanel}
            >
              <span className="flex items-center gap-1">
                {isStatePanelOpen ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
                状態
              </span>
              <span className="text-xs text-muted-foreground">
                {diagram.states.length}
              </span>
            </button>
            {isStatePanelOpen && (
              <div className="space-y-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-xs"
                  onClick={() => openStateModal()}
                >
                  <Plus className="h-3 w-3 mr-1" />
                  追加
                </Button>
                <div className="space-y-3 mt-2">
                  {diagram.actors.map((actor) => {
                    const actorStates = diagram.states.filter(
                      (s) => s.owner === actor.id,
                    );
                    if (actorStates.length === 0) return null;

                    return (
                      <div key={actor.id} className="space-y-1">
                        <div className="flex items-center gap-2 px-2 text-xs font-semibold text-muted-foreground">
                          <span>{scopeIcons[actor.scope || "local"]}</span>
                          <span className="truncate">{actor.name}</span>
                        </div>
                        <div className="pl-2 border-l-2 border-muted ml-3 space-y-0.5">
                          {actorStates.map((state) => (
                            <div
                              key={state.id}
                              className={`group flex items-center justify-between px-2 py-1 rounded text-sm cursor-pointer hover:bg-muted ${
                                selectedStateId === state.id ? "bg-muted" : ""
                              }`}
                              onClick={() => selectState(state.id)}
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <span className="truncate">{state.name}</span>
                              </div>
                              <div className="hidden group-hover:flex items-center gap-1">
                                <button
                                  className="p-0.5 hover:text-primary"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openStateModal(state.id);
                                  }}
                                >
                                  <Edit2 className="h-3 w-3" />
                                </button>
                                <button
                                  className="p-0.5 hover:text-destructive"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    deleteState(state.id);
                                  }}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </section>

          <Separator />

          {/* フローセクション */}
          <section>
            <button
              className="flex items-center justify-between w-full text-sm font-medium mb-2"
              onClick={toggleFlowPanel}
            >
              <span className="flex items-center gap-1">
                {isFlowPanelOpen ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
                フロー
              </span>
              <span className="text-xs text-muted-foreground">
                {diagram.flows.length}
              </span>
            </button>
            {isFlowPanelOpen && (
              <div className="space-y-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-xs"
                  onClick={() => openFlowModal()}
                >
                  <Plus className="h-3 w-3 mr-1" />
                  追加
                </Button>
                {diagram.flows.map((flow) => (
                  <div
                    key={flow.id}
                    className={`group flex items-center justify-between px-2 py-1 rounded text-sm cursor-pointer hover:bg-muted ${
                      selectedFlowId === flow.id ? "bg-muted" : ""
                    }`}
                    onClick={() => selectFlow(flow.id)}
                    onDoubleClick={() => focusFlow(flow.id)}
                    title="ダブルクリックでジャンプ"
                  >
                    <span className="truncate">{flow.name}</span>
                    <div className="hidden group-hover:flex items-center gap-1">
                      <button
                        className="p-0.5 hover:text-primary"
                        onClick={(e) => {
                          e.stopPropagation();
                          openFlowModal(flow.id);
                        }}
                      >
                        <Edit2 className="h-3 w-3" />
                      </button>
                      <button
                        className="p-0.5 hover:text-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteFlow(flow.id);
                        }}
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <Separator />

          {/* 条件セクション */}
          <section>
            <button
              className="flex items-center justify-between w-full text-sm font-medium mb-2"
              onClick={toggleConditionPanel}
            >
              <span className="flex items-center gap-1">
                {isConditionPanelOpen ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
                条件
              </span>
              <span className="text-xs text-muted-foreground">
                {diagram.conditions.length}
              </span>
            </button>
            {isConditionPanelOpen && (
              <div className="space-y-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-xs"
                  onClick={() => openConditionModal()}
                >
                  <Plus className="h-3 w-3 mr-1" />
                  追加
                </Button>
                {diagram.conditions.map((condition) => (
                  <div
                    key={condition.id}
                    className="group flex items-center justify-between px-2 py-1 rounded text-sm cursor-pointer hover:bg-muted"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="truncate font-mono text-xs">
                        {condition.expression}
                      </span>
                    </div>
                    <div className="hidden group-hover:flex items-center gap-1">
                      <button
                        className="p-0.5 hover:text-primary"
                        onClick={(e) => {
                          e.stopPropagation();
                          openConditionModal(condition.id);
                        }}
                      >
                        <Edit2 className="h-3 w-3" />
                      </button>
                      <button
                        className="p-0.5 hover:text-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteCondition(condition.id);
                        }}
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </ScrollArea>

      {/* 凡例 */}
      <div className="p-3 border-t text-xs space-y-1">
        <p className="font-medium text-muted-foreground">スコープ凡例</p>
        <div className="flex gap-3">
          <span>📍 ローカル</span>
          <span>🌲 サブツリー</span>
          <span>🌍 グローバル</span>
        </div>
      </div>
    </aside>
  );
}
