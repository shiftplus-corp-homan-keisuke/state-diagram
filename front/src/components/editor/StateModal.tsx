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
import type { State } from "@/types/diagram";

export function StateModal() {
  const { diagram, addState, updateState } = useDiagramStore();
  const { isStateModalOpen, closeStateModal, editingStateId } = useUIStore();

  const isEditing = !!editingStateId;
  const editingState = isEditing
    ? diagram?.states.find((state) => state.id === editingStateId)
    : null;
  const actors = diagram?.actors || [];

  const initialValues = {
    name: editingState?.name ?? "",
    owner: editingState?.owner ?? actors[0]?.id ?? "",
    dataType: editingState?.dataType ?? "",
    description: editingState?.description ?? "",
  } as const;

  return (
    <Dialog open={isStateModalOpen} onOpenChange={closeStateModal}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? "状態を編集" : "状態を追加"}</DialogTitle>
          <DialogDescription>
            状態名と所有アクターを設定します。scope は state ではなく actor に属します。
          </DialogDescription>
        </DialogHeader>
        <StateForm
          key={`${isStateModalOpen}-${editingStateId ?? "new"}-${actors[0]?.id ?? "none"}`}
          initialValues={initialValues}
          actors={actors}
          isEditing={isEditing}
          editingStateId={editingStateId}
          onClose={closeStateModal}
          addState={addState}
          updateState={updateState}
        />
      </DialogContent>
    </Dialog>
  );
}

interface StateFormProps {
  initialValues: {
    name: string;
    owner: string;
    dataType: string;
    description: string;
  };
  actors: { id: string; name: string }[];
  isEditing: boolean;
  editingStateId: string | null;
  onClose: () => void;
  addState: (state: State) => void;
  updateState: (id: string, updates: Partial<State>) => void;
}

function StateForm({
  initialValues,
  actors,
  isEditing,
  editingStateId,
  onClose,
  addState,
  updateState,
}: StateFormProps) {
  const [name, setName] = useState(initialValues.name);
  const [owner, setOwner] = useState(initialValues.owner);
  const [dataType, setDataType] = useState(initialValues.dataType);
  const [description, setDescription] = useState(initialValues.description);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !owner) return;

    if (isEditing && editingStateId) {
      updateState(editingStateId, {
        name: name.trim(),
        owner,
        dataType: dataType.trim() || undefined,
        description: description.trim() || undefined,
      });
    } else {
      addState({
        id: crypto.randomUUID(),
        name: name.trim(),
        owner,
        dataType: dataType.trim() || undefined,
        description: description.trim() || undefined,
      });
    }

    onClose();
  };

  return (
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
          <SelectTrigger id="state-owner">
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
          <p className="text-xs text-muted-foreground">先にアクターを追加してください</p>
        )}
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
        <Button type="button" variant="outline" onClick={onClose}>
          キャンセル
        </Button>
        <Button type="submit" disabled={!name.trim() || !owner}>
          {isEditing ? "更新" : "追加"}
        </Button>
      </DialogFooter>
    </form>
  );
}
