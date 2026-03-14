import { useState } from "react";
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
import { useDiagramStore } from "@/stores/diagramStore";
import { useUIStore } from "@/stores/uiStore";
import type { Actor, ActorType, StateScope } from "@/types/diagram";

const actorTypes: { value: ActorType; label: string; icon: string }[] = [
  { value: "component", label: "コンポーネント", icon: "🧩" },
  { value: "store", label: "ストア", icon: "📦" },
  { value: "service", label: "サービス", icon: "⚙️" },
  { value: "external", label: "外部システム", icon: "🌐" },
];

const scopes: {
  value: StateScope;
  label: string;
  icon: string;
  description: string;
}[] = [
  {
    value: "local",
    label: "ローカル",
    icon: "📍",
    description: "コンポーネント内で完結",
  },
  {
    value: "subtree",
    label: "サブツリー",
    icon: "🌲",
    description: "特定のコンポーネント以下",
  },
  {
    value: "global",
    label: "グローバル",
    icon: "🌍",
    description: "アプリ全体",
  },
];

export function ActorModal() {
  const { diagram, addActor, updateActor } = useDiagramStore();
  const { isActorModalOpen, closeActorModal, editingActorId } = useUIStore();

  const isEditing = !!editingActorId;
  const editingActor = isEditing
    ? diagram?.actors.find((actor) => actor.id === editingActorId)
    : null;

  const initialValues = {
    name: editingActor?.name ?? "",
    type: editingActor?.type ?? "component",
    scope: editingActor?.scope ?? "local",
    description: editingActor?.description ?? "",
  } as const;

  return (
    <Dialog open={isActorModalOpen} onOpenChange={closeActorModal}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "アクターを編集" : "アクターを追加"}
          </DialogTitle>
          <DialogDescription>
            図に登場するコンポーネントやストアなどのアクターを設定します。
          </DialogDescription>
        </DialogHeader>
        <ActorForm
          key={`${isActorModalOpen}-${editingActorId ?? "new"}`}
          initialValues={initialValues}
          isEditing={isEditing}
          editingActorId={editingActorId}
          onClose={closeActorModal}
          addActor={addActor}
          updateActor={updateActor}
        />
      </DialogContent>
    </Dialog>
  );
}

interface ActorFormProps {
  initialValues: {
    name: string;
    type: ActorType;
    scope: StateScope;
    description: string;
  };
  isEditing: boolean;
  editingActorId: string | null;
  onClose: () => void;
  addActor: (actor: Actor) => void;
  updateActor: (id: string, updates: Partial<Actor>) => void;
}

function ActorForm({
  initialValues,
  isEditing,
  editingActorId,
  onClose,
  addActor,
  updateActor,
}: ActorFormProps) {
  const [name, setName] = useState(initialValues.name);
  const [type, setType] = useState<ActorType>(initialValues.type);
  const [scope, setScope] = useState<StateScope>(initialValues.scope);
  const [description, setDescription] = useState(initialValues.description);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (isEditing && editingActorId) {
      updateActor(editingActorId, {
        name: name.trim(),
        type,
        scope: type === "store" ? scope : undefined,
        description: description.trim() || undefined,
      });
    } else {
      addActor({
        id: crypto.randomUUID(),
        name: name.trim(),
        type,
        scope: type === "store" ? scope : undefined,
        description: description.trim() || undefined,
      });
    }

    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="actor-name">名前 *</Label>
        <Input
          id="actor-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="例: ProductList, CartStore"
          autoFocus
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="actor-type">種類</Label>
        <Select value={type} onValueChange={(value) => setType(value as ActorType)}>
          <SelectTrigger id="actor-type">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {actorTypes.map((actorType) => (
              <SelectItem key={actorType.value} value={actorType.value}>
                <span className="flex items-center gap-2">
                  <span>{actorType.icon}</span>
                  <span>{actorType.label}</span>
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {type === "store" && (
        <div className="space-y-2">
          <Label htmlFor="actor-scope">スコープ</Label>
          <Select value={scope} onValueChange={(value) => setScope(value as StateScope)}>
            <SelectTrigger id="actor-scope">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {scopes.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  <span className="flex items-center gap-2">
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                    <span className="text-muted-foreground text-xs">- {item.description}</span>
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="actor-description">説明</Label>
        <Textarea
          id="actor-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="このアクターの役割を説明"
          rows={2}
        />
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onClose}>
          キャンセル
        </Button>
        <Button type="submit" disabled={!name.trim()}>
          {isEditing ? "更新" : "追加"}
        </Button>
      </DialogFooter>
    </form>
  );
}
