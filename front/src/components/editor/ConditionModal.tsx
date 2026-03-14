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
import { useDiagramStore } from "@/stores/diagramStore";
import { useUIStore } from "@/stores/uiStore";
import type { Condition } from "@/types/diagram";

export function ConditionModal() {
  const { diagram, addCondition, updateCondition } = useDiagramStore();
  const { isConditionModalOpen, closeConditionModal, editingConditionId } =
    useUIStore();

  const isEditing = !!editingConditionId;
  const editingCondition = isEditing
    ? diagram?.conditions.find((condition) => condition.id === editingConditionId)
    : null;

  const initialValues = {
    expression: editingCondition?.expression ?? "",
    description: editingCondition?.description ?? "",
  } as const;

  return (
    <Dialog open={isConditionModalOpen} onOpenChange={closeConditionModal}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? "条件を編集" : "条件を追加"}</DialogTitle>
          <DialogDescription>
            フローの分岐に使う条件式を定義します。
          </DialogDescription>
        </DialogHeader>
        <ConditionForm
          key={`${isConditionModalOpen}-${editingConditionId ?? "new"}`}
          initialValues={initialValues}
          isEditing={isEditing}
          editingConditionId={editingConditionId}
          onClose={closeConditionModal}
          addCondition={addCondition}
          updateCondition={updateCondition}
        />
      </DialogContent>
    </Dialog>
  );
}

interface ConditionFormProps {
  initialValues: {
    expression: string;
    description: string;
  };
  isEditing: boolean;
  editingConditionId: string | null;
  onClose: () => void;
  addCondition: (condition: Condition) => void;
  updateCondition: (id: string, updates: Partial<Condition>) => void;
}

function ConditionForm({
  initialValues,
  isEditing,
  editingConditionId,
  onClose,
  addCondition,
  updateCondition,
}: ConditionFormProps) {
  const [expression, setExpression] = useState(initialValues.expression);
  const [description, setDescription] = useState(initialValues.description);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expression.trim()) return;

    if (isEditing && editingConditionId) {
      updateCondition(editingConditionId, {
        expression: expression.trim(),
        description: description.trim() || undefined,
      });
    } else {
      addCondition({
        id: crypto.randomUUID(),
        expression: expression.trim(),
        description: description.trim() || undefined,
      });
    }

    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="condition-expression">条件式 *</Label>
        <Input
          id="condition-expression"
          value={expression}
          onChange={(e) => setExpression(e.target.value)}
          placeholder="例: product.stock > 0"
          autoFocus
        />
        <p className="text-xs text-muted-foreground">
          フローのステップに適用する条件式を入力してください
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="condition-description">説明</Label>
        <Textarea
          id="condition-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="この条件の説明（例：在庫がある場合）"
          rows={2}
        />
      </div>

      <div className="bg-muted/50 p-3 rounded-lg text-sm">
        <p className="font-medium mb-1">💡 使い方</p>
        <p className="text-muted-foreground text-xs">
          条件を作成後、フローのステップで「条件」として選択できます。条件が真の場合のみステップが実行されることを表現します。
        </p>
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onClose}>
          キャンセル
        </Button>
        <Button type="submit" disabled={!expression.trim()}>
          {isEditing ? "更新" : "追加"}
        </Button>
      </DialogFooter>
    </form>
  );
}
