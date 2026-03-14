import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import type { Flow, FlowStep, FlowTrigger } from "@/types/diagram";

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

  const isEditing = !!editingFlowId;
  const editingFlow = isEditing
    ? diagram?.flows.find((flow) => flow.id === editingFlowId)
    : null;
  const actors = diagram?.actors || [];
  const states = diagram?.states || [];
  const conditions = diagram?.conditions || [];

  const initialValues = {
    name: editingFlow?.name ?? "",
    description: editingFlow?.description ?? "",
    triggerType: editingFlow?.trigger.type ?? "userAction",
    triggerActor: editingFlow?.trigger.actor ?? actors[0]?.id ?? "",
    triggerAction: editingFlow?.trigger.action ?? "click",
    triggerTarget: editingFlow?.trigger.target ?? "",
    steps: editingFlow?.steps ?? [],
  } as const;

  return (
    <Dialog open={isFlowModalOpen} onOpenChange={closeFlowModal}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "フローを編集" : "フローを作成"}</DialogTitle>
          <DialogDescription>
            トリガーとステップを定義して、アクター間の処理フローを表現します。
          </DialogDescription>
        </DialogHeader>
        <FlowForm
          key={`${isFlowModalOpen}-${editingFlowId ?? "new"}-${actors[0]?.id ?? "none"}`}
          initialValues={initialValues}
          actors={actors}
          states={states}
          conditions={conditions}
          isEditing={isEditing}
          editingFlowId={editingFlowId}
          onClose={closeFlowModal}
          addFlow={addFlow}
          updateFlow={updateFlow}
        />
      </DialogContent>
    </Dialog>
  );
}

interface FlowFormProps {
  initialValues: {
    name: string;
    description: string;
    triggerType: FlowTrigger["type"];
    triggerActor: string;
    triggerAction: string;
    triggerTarget: string;
    steps: FlowStep[];
  };
  actors: { id: string; name: string }[];
  states: { id: string; name: string }[];
  conditions: { id: string; expression: string }[];
  isEditing: boolean;
  editingFlowId: string | null;
  onClose: () => void;
  addFlow: (flow: Flow) => void;
  updateFlow: (id: string, updates: Partial<Flow>) => void;
}

function FlowForm({
  initialValues,
  actors,
  states,
  conditions,
  isEditing,
  editingFlowId,
  onClose,
  addFlow,
  updateFlow,
}: FlowFormProps) {
  const [name, setName] = useState(initialValues.name);
  const [description, setDescription] = useState(initialValues.description);
  const [triggerType, setTriggerType] = useState<FlowTrigger["type"]>(
    initialValues.triggerType,
  );
  const [triggerActor, setTriggerActor] = useState(initialValues.triggerActor);
  const [triggerAction, setTriggerAction] = useState(initialValues.triggerAction);
  const [triggerTarget, setTriggerTarget] = useState(initialValues.triggerTarget);
  const [steps, setSteps] = useState<FlowStep[]>(initialValues.steps);

  const addStep = () => {
    setSteps((current) => [
      ...current,
      {
        id: crypto.randomUUID(),
        type: "dispatch",
        from: actors[0]?.id,
        to: actors[1]?.id || actors[0]?.id,
      },
    ]);
  };

  const updateStep = (index: number, updates: Partial<FlowStep>) => {
    setSteps((current) =>
      current.map((step, stepIndex) =>
        stepIndex === index ? { ...step, ...updates } : step,
      ),
    );
  };

  const removeStep = (index: number) => {
    setSteps((current) => current.filter((_, stepIndex) => stepIndex !== index));
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

    onClose();
  };

  return (
    <ScrollArea className="max-h-[60vh] pr-4">
      <form onSubmit={handleSubmit} className="space-y-4">
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

        <div className="space-y-3">
          <h3 className="font-medium">トリガー</h3>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>種類</Label>
              <Select value={triggerType} onValueChange={(value) => setTriggerType(value as FlowTrigger["type"])}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {triggerTypes.map((trigger) => (
                    <SelectItem key={trigger.value} value={trigger.value}>
                      {trigger.label}
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
                  {actors.map((actor) => (
                    <SelectItem key={actor.id} value={actor.id}>
                      {actor.name}
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

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">ステップ</h3>
            <Button type="button" variant="outline" size="sm" onClick={addStep}>
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
            <div key={step.id} className="p-3 border rounded-lg space-y-2 bg-muted/30">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">ステップ {index + 1}</span>
                <Button type="button" variant="ghost" size="sm" onClick={() => removeStep(index)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs">種類</Label>
                  <Select value={step.type} onValueChange={(value) => updateStep(index, { type: value as FlowStep["type"] })}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {stepTypes.map((stepType) => (
                        <SelectItem key={stepType.value} value={stepType.value}>
                          {stepType.icon} {stepType.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">From</Label>
                  <Select value={step.from || ""} onValueChange={(value) => updateStep(index, { from: value })}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder="選択" />
                    </SelectTrigger>
                    <SelectContent>
                      {actors.map((actor) => (
                        <SelectItem key={actor.id} value={actor.id}>
                          {actor.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">To</Label>
                  <Select value={step.to || ""} onValueChange={(value) => updateStep(index, { to: value })}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder="選択" />
                    </SelectTrigger>
                    <SelectContent>
                      {actors.map((actor) => (
                        <SelectItem key={actor.id} value={actor.id}>
                          {actor.name}
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
                    onChange={(e) => updateStep(index, { action: e.target.value })}
                    placeholder="例: addItem"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">状態</Label>
                  <Select
                    value={step.state || "_none_"}
                    onValueChange={(value) =>
                      updateStep(index, { state: value === "_none_" ? undefined : value })
                    }
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder="選択" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="_none_">なし</SelectItem>
                      {states.map((state) => (
                        <SelectItem key={state.id} value={state.id}>
                          {state.name}
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
                  onChange={(e) => updateStep(index, { description: e.target.value })}
                  placeholder="このステップの説明"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs">条件</Label>
                <Select
                  value={step.condition || "_none_"}
                  onValueChange={(value) =>
                    updateStep(index, {
                      condition: value === "_none_" ? undefined : value,
                    })
                  }
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="選択" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="_none_">なし</SelectItem>
                    {conditions.map((condition) => (
                      <SelectItem key={condition.id} value={condition.id}>
                        {condition.expression}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id={`async-${step.id}`}
                  checked={step.isAsync || false}
                  onChange={(e) => updateStep(index, { isAsync: e.target.checked })}
                  className="h-4 w-4"
                />
                <Label htmlFor={`async-${step.id}`} className="text-xs">
                  ⏳ 非同期処理
                </Label>
              </div>
            </div>
          ))}
        </div>

        <DialogFooter className="pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            キャンセル
          </Button>
          <Button type="submit" disabled={!name.trim() || !triggerActor}>
            {isEditing ? "更新" : "作成"}
          </Button>
        </DialogFooter>
      </form>
    </ScrollArea>
  );
}
