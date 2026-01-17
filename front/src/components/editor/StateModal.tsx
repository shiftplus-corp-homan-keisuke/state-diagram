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
import type { State, StateScope } from "@/types/diagram";

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

export function StateModal() {
  const { diagram, addState, updateState } = useDiagramStore();
  const { isStateModalOpen, closeStateModal, editingStateId } = useUIStore();

  const [name, setName] = useState("");
  const [scope, setScope] = useState<StateScope>("global");
  const [owner, setOwner] = useState("");
  const [dataType, setDataType] = useState("");
  const [description, setDescription] = useState("");

  const isEditing = !!editingStateId;
  const editingState = isEditing
    ? diagram?.states.find((s) => s.id === editingStateId)
    : null;

  useEffect(() => {
    if (editingState) {
      setName(editingState.name);
      setScope(editingState.scope);
      setOwner(editingState.owner);
      setDataType(editingState.dataType || "");
      setDescription(editingState.description || "");
    } else {
      setName("");
      setScope("global");
      setOwner(diagram?.actors[0]?.id || "");
      setDataType("");
      setDescription("");
    }
  }, [editingState, isStateModalOpen, diagram?.actors]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !owner) return;

    if (isEditing && editingStateId) {
      updateState(editingStateId, {
        name: name.trim(),
        scope,
        owner,
        dataType: dataType.trim() || undefined,
        description: description.trim() || undefined,
      });
    } else {
      const newState: State = {
        id: crypto.randomUUID(),
        name: name.trim(),
        scope,
        owner,
        dataType: dataType.trim() || undefined,
        description: description.trim() || undefined,
      };
      addState(newState);
    }

    closeStateModal();
  };

  const actors = diagram?.actors || [];

  return (
    <Dialog open={isStateModalOpen} onOpenChange={closeStateModal}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? "状態を編集" : "状態を追加"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="state-name">状態名 *</Label>
            <Input
              id="state-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例: cartItems, isLoading"
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="state-owner">所有者 *</Label>
            <Select value={owner} onValueChange={setOwner}>
              <SelectTrigger>
                <SelectValue placeholder="アクターを選択" />
              </SelectTrigger>
              <SelectContent>
                {actors.map((actor) => (
                  <SelectItem key={actor.id} value={actor.id}>
                    {actor.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {actors.length === 0 && (
              <p className="text-xs text-muted-foreground">
                先にアクターを追加してください
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="state-scope">スコープ</Label>
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

          <div className="space-y-2">
            <Label htmlFor="state-dataType">データ型</Label>
            <Input
              id="state-dataType"
              value={dataType}
              onChange={(e) => setDataType(e.target.value)}
              placeholder="例: Array<CartItem>, boolean"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="state-description">説明</Label>
            <Textarea
              id="state-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="この状態の役割を説明"
              rows={2}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={closeStateModal}>
              キャンセル
            </Button>
            <Button type="submit" disabled={!name.trim() || !owner}>
              {isEditing ? "更新" : "追加"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
