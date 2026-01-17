import { useState, useEffect } from "react";
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

  const [name, setName] = useState("");
  const [type, setType] = useState<ActorType>("component");
  const [scope, setScope] = useState<StateScope>("local");
  const [description, setDescription] = useState("");

  const isEditing = !!editingActorId;
  const editingActor = isEditing
    ? diagram?.actors.find((a) => a.id === editingActorId)
    : null;

  useEffect(() => {
    if (editingActor) {
      setName(editingActor.name);
      setType(editingActor.type);
      setScope(editingActor.scope || "local");
      setDescription(editingActor.description || "");
    } else {
      setName("");
      setType("component");
      setScope("local");
      setDescription("");
    }
  }, [editingActor, isActorModalOpen]);

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
      const newActor: Actor = {
        id: crypto.randomUUID(),
        name: name.trim(),
        type,
        scope: type === "store" ? scope : undefined,
        description: description.trim() || undefined,
      };
      addActor(newActor);
    }

    closeActorModal();
  };

  return (
    <Dialog open={isActorModalOpen} onOpenChange={closeActorModal}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "アクターを編集" : "アクターを追加"}
          </DialogTitle>
        </DialogHeader>
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
            <Label htmlFor="actor-scope">種類</Label>
            <Select value={type} onValueChange={(v) => setType(v as ActorType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {actorTypes.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    <span className="flex items-center gap-2">
                      <span>{t.icon}</span>
                      <span>{t.label}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {type === "store" && (
            <div className="space-y-2">
              <Label htmlFor="actor-scope">スコープ</Label>
              <Select
                value={scope}
                onValueChange={(v) => setScope(v as StateScope)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {scopes.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      <span className="flex items-center gap-2">
                        <span>{s.icon}</span>
                        <span>{s.label}</span>
                        <span className="text-muted-foreground text-xs">
                          - {s.description}
                        </span>
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
            <Button type="button" variant="outline" onClick={closeActorModal}>
              キャンセル
            </Button>
            <Button type="submit" disabled={!name.trim()}>
              {isEditing ? "更新" : "追加"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
