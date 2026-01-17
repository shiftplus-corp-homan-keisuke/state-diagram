import { useState, useEffect } from "react";
import { Plus, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useDiagramStore } from "@/stores/diagramStore";
import { useUIStore } from "@/stores/uiStore";
import type { Flow, FlowTrigger, FlowStep } from "@/types/diagram";

const triggerTypes: { value: FlowTrigger["type"]; label: string }[] = [
  { value: "userAction", label: "ユーザーアクション" },
  { value: "lifecycle", label: "ライフサイクル" },
  { value: "subscription", label: "サブスクリプション" },
  { value: "timer", label: "タイマー" },
];

const stepTypes: { value: FlowStep["type"]; label: string; icon: string }[] = [
  { value: "dispatch", label: "ディスパッチ", icon: "→" },
  { value: "stateChange", label: "状態変更", icon: "⟳" },
  { value: "subscribe", label: "購読", icon: "◎" },
  { value: "effect", label: "副作用", icon: "⚡" },
  { value: "render", label: "レンダリング", icon: "🔄" },
];

export function FlowModal() {
  const { diagram, addFlow, updateFlow } = useDiagramStore();
  const { isFlowModalOpen, closeFlowModal, editingFlowId } = useUIStore();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [triggerType, setTriggerType] =
    useState<FlowTrigger["type"]>("userAction");
  const [triggerActor, setTriggerActor] = useState("");
  const [triggerAction, setTriggerAction] = useState("");
  const [triggerTarget, setTriggerTarget] = useState("");
  const [steps, setSteps] = useState<FlowStep[]>([]);

  const isEditing = !!editingFlowId;
  const editingFlow = isEditing
    ? diagram?.flows.find((f) => f.id === editingFlowId)
    : null;

  useEffect(() => {
    if (editingFlow) {
      setName(editingFlow.name);
      setDescription(editingFlow.description || "");
      setTriggerType(editingFlow.trigger.type);
      setTriggerActor(editingFlow.trigger.actor);
      setTriggerAction(editingFlow.trigger.action);
      setTriggerTarget(editingFlow.trigger.target || "");
      setSteps(editingFlow.steps);
    } else {
      setName("");
      setDescription("");
      setTriggerType("userAction");
      setTriggerActor(diagram?.actors[0]?.id || "");
      setTriggerAction("click");
      setTriggerTarget("");
      setSteps([]);
    }
  }, [editingFlow, isFlowModalOpen, diagram?.actors]);

  const addStep = () => {
    const newStep: FlowStep = {
      id: crypto.randomUUID(),
      type: "dispatch",
      from: diagram?.actors[0]?.id,
      to: diagram?.actors[1]?.id || diagram?.actors[0]?.id,
    };
    setSteps([...steps, newStep]);
  };

  const updateStep = (index: number, updates: Partial<FlowStep>) => {
    const newSteps = [...steps];
    newSteps[index] = { ...newSteps[index], ...updates };
    setSteps(newSteps);
  };

  const removeStep = (index: number) => {
    setSteps(steps.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !triggerActor) return;

    const flow: Flow = {
      id: isEditing && editingFlowId ? editingFlowId : crypto.randomUUID(),
      name: name.trim(),
      description: description.trim() || undefined,
      trigger: {
        type: triggerType,
        actor: triggerActor,
        action: triggerAction,
        target: triggerTarget || undefined,
      },
      steps,
    };

    if (isEditing && editingFlowId) {
      updateFlow(editingFlowId, flow);
    } else {
      addFlow(flow);
    }

    closeFlowModal();
  };

  const actors = diagram?.actors || [];
  const states = diagram?.states || [];

  return (
    <Dialog open={isFlowModalOpen} onOpenChange={closeFlowModal}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "フローを編集" : "フローを作成"}
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] pr-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* 基本情報 */}
            <div className="space-y-2">
              <Label htmlFor="flow-name">フロー名 *</Label>
              <Input
                id="flow-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="例: 商品をカートに追加"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="flow-description">説明</Label>
              <Textarea
                id="flow-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="このフローの説明"
                rows={2}
              />
            </div>

            <Separator />

            {/* トリガー設定 */}
            <div className="space-y-3">
              <h3 className="font-medium">トリガー</h3>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>種類</Label>
                  <Select
                    value={triggerType}
                    onValueChange={(v) =>
                      setTriggerType(v as FlowTrigger["type"])
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {triggerTypes.map((t) => (
                        <SelectItem key={t.value} value={t.value}>
                          {t.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>アクター *</Label>
                  <Select value={triggerActor} onValueChange={setTriggerActor}>
                    <SelectTrigger>
                      <SelectValue placeholder="選択" />
                    </SelectTrigger>
                    <SelectContent>
                      {actors.map((a) => (
                        <SelectItem key={a.id} value={a.id}>
                          {a.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>アクション</Label>
                  <Input
                    value={triggerAction}
                    onChange={(e) => setTriggerAction(e.target.value)}
                    placeholder="例: click, onInit"
                  />
                </div>

                <div className="space-y-2">
                  <Label>ターゲット</Label>
                  <Input
                    value={triggerTarget}
                    onChange={(e) => setTriggerTarget(e.target.value)}
                    placeholder="例: 追加ボタン"
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* ステップ設定 */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">ステップ</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addStep}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  追加
                </Button>
              </div>

              {steps.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  ステップを追加してください
                </p>
              )}

              {steps.map((step, index) => (
                <div
                  key={step.id}
                  className="p-3 border rounded-lg space-y-2 bg-muted/30"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      ステップ {index + 1}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeStep(index)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div className="space-y-1">
                      <Label className="text-xs">種類</Label>
                      <Select
                        value={step.type}
                        onValueChange={(v) =>
                          updateStep(index, { type: v as FlowStep["type"] })
                        }
                      >
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {stepTypes.map((t) => (
                            <SelectItem key={t.value} value={t.value}>
                              {t.icon} {t.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1">
                      <Label className="text-xs">From</Label>
                      <Select
                        value={step.from || ""}
                        onValueChange={(v) => updateStep(index, { from: v })}
                      >
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue placeholder="選択" />
                        </SelectTrigger>
                        <SelectContent>
                          {actors.map((a) => (
                            <SelectItem key={a.id} value={a.id}>
                              {a.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1">
                      <Label className="text-xs">To</Label>
                      <Select
                        value={step.to || ""}
                        onValueChange={(v) => updateStep(index, { to: v })}
                      >
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue placeholder="選択" />
                        </SelectTrigger>
                        <SelectContent>
                          {actors.map((a) => (
                            <SelectItem key={a.id} value={a.id}>
                              {a.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label className="text-xs">アクション名</Label>
                      <Input
                        className="h-8 text-xs"
                        value={step.action || ""}
                        onChange={(e) =>
                          updateStep(index, { action: e.target.value })
                        }
                        placeholder="例: addItem"
                      />
                    </div>

                    <div className="space-y-1">
                      <Label className="text-xs">状態</Label>
                      <Select
                        value={step.state || "_none_"}
                        onValueChange={(v) =>
                          updateStep(index, {
                            state: v === "_none_" ? undefined : v,
                          })
                        }
                      >
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue placeholder="選択" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="_none_">なし</SelectItem>
                          {states.map((s) => (
                            <SelectItem key={s.id} value={s.id}>
                              {s.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs">説明</Label>
                    <Input
                      className="h-8 text-xs"
                      value={step.description || ""}
                      onChange={(e) =>
                        updateStep(index, { description: e.target.value })
                      }
                      placeholder="このステップの説明"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs">条件</Label>
                    <Select
                      value={step.condition || "_none_"}
                      onValueChange={(v) =>
                        updateStep(index, {
                          condition: v === "_none_" ? undefined : v,
                        })
                      }
                    >
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue placeholder="選択" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="_none_">なし</SelectItem>
                        {(diagram?.conditions || []).map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.expression}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              ))}
            </div>

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={closeFlowModal}>
                キャンセル
              </Button>
              <Button type="submit" disabled={!name.trim() || !triggerActor}>
                {isEditing ? "更新" : "作成"}
              </Button>
            </DialogFooter>
          </form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
