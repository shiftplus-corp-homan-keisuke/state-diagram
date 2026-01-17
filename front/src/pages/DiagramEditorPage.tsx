import { useEffect, useState } from "react";
import { useParams, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Save, FileJson } from "lucide-react";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getDiagramById } from "@/db/database";
import { useDiagramStore } from "@/stores/diagramStore";
import { Sidebar } from "@/components/layout/Sidebar";
import { SequenceDiagram } from "@/components/diagram/SequenceDiagram";
import { ActorModal } from "@/components/editor/ActorModal";
import { StateModal } from "@/components/editor/StateModal";
import { FlowModal } from "@/components/editor/FlowModal";
import { ConditionModal } from "@/components/editor/ConditionModal";
import { JsonModal } from "@/components/editor/JsonModal";
import { useUIStore } from "@/stores/uiStore";

export default function DiagramEditorPage() {
  const { diagramId } = useParams({ from: "/diagram/$diagramId" });
  const navigate = useNavigate();
  const { diagram, setDiagram, saveDiagram } = useDiagramStore();
  const { openJsonModal } = useUIStore();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState("");

  useEffect(() => {
    loadDiagram();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [diagramId]);

  const loadDiagram = async () => {
    try {
      const data = await getDiagramById(diagramId);
      if (data) {
        setDiagram(data);
        setNameInput(data.name);
      } else {
        navigate({ to: "/" });
      }
    } catch (error) {
      console.error("Failed to load diagram:", error);
      navigate({ to: "/" });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveDiagram();
      toast.success("保存しました");
    } catch (e) {
      console.error(e);
      toast.error("保存に失敗しました");
    } finally {
      setSaving(false);
    }
  };

  const handleNameSubmit = () => {
    if (diagram && nameInput.trim()) {
      useDiagramStore.setState({
        diagram: { ...diagram, name: nameInput.trim() },
      });
    }
    setEditingName(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">読み込み中...</p>
      </div>
    );
  }

  if (!diagram) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">ダイアグラムが見つかりません</p>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* ヘッダー */}
      <header className="border-b px-4 py-2 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate({ to: "/" })}
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            一覧
          </Button>
          {editingName ? (
            <Input
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              onBlur={handleNameSubmit}
              onKeyDown={(e) => e.key === "Enter" && handleNameSubmit()}
              className="w-64"
              autoFocus
            />
          ) : (
            <h1
              className="font-semibold cursor-pointer hover:text-primary"
              onClick={() => setEditingName(true)}
            >
              {diagram.name}
            </h1>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => openJsonModal()}>
            <FileJson className="h-4 w-4 mr-1" />
            JSON
          </Button>
          <Button size="sm" onClick={handleSave} disabled={saving}>
            <Save className="h-4 w-4 mr-1" />
            {saving ? "保存中..." : "保存"}
          </Button>
        </div>
      </header>

      {/* メインコンテンツ */}
      <div className="flex-1 flex overflow-hidden">
        {/* サイドバー */}
        <Sidebar />

        {/* シーケンス図 */}
        <main className="flex-1 overflow-hidden">
          <SequenceDiagram />
        </main>
      </div>

      {/* モーダル */}
      <ActorModal />
      <StateModal />
      <FlowModal />
      <ConditionModal />
      <JsonModal />
    </div>
  );
}
