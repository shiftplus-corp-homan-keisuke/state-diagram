import { useState, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Plus, FileJson } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { getAllDiagrams, saveDiagram, deleteDiagram } from "@/db/database";
import type { Diagram } from "@/types/diagram";

export default function DiagramListPage() {
  const navigate = useNavigate();
  const [diagrams, setDiagrams] = useState<Diagram[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDiagrams();
  }, []);

  const loadDiagrams = async () => {
    try {
      const data = await getAllDiagrams();
      setDiagrams(data);
    } catch (error) {
      console.error("Failed to load diagrams:", error);
    } finally {
      setLoading(false);
    }
  };

  const createNewDiagram = async () => {
    const id = crypto.randomUUID();
    const now = new Date();
    const newDiagram: Diagram = {
      id,
      name: "新しいダイアグラム",
      description: "",
      createdAt: now,
      updatedAt: now,
      actors: [],
      states: [],
      flows: [],
      conditions: [],
    };
    await saveDiagram(newDiagram);
    navigate({ to: "/diagram/$diagramId", params: { diagramId: id } });
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("このダイアグラムを削除しますか？")) {
      await deleteDiagram(id);
      await loadDiagrams();
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("ja-JP", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">読み込み中...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileJson className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold">State Flow Visualizer</h1>
          </div>
          <Button onClick={createNewDiagram}>
            <Plus className="h-4 w-4 mr-2" />
            新規作成
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {diagrams.length === 0 ? (
          <div className="text-center py-16">
            <FileJson className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">
              ダイアグラムがありません
            </h2>
            <p className="text-muted-foreground mb-4">
              新規作成ボタンをクリックして、最初のダイアグラムを作成しましょう
            </p>
            <Button onClick={createNewDiagram}>
              <Plus className="h-4 w-4 mr-2" />
              新規作成
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {diagrams.map((diagram) => (
              <Card
                key={diagram.id}
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() =>
                  navigate({
                    to: "/diagram/$diagramId",
                    params: { diagramId: diagram.id },
                  })
                }
              >
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="line-clamp-1">
                        {diagram.name}
                      </CardTitle>
                      <CardDescription className="line-clamp-2 mt-1">
                        {diagram.description || "No description"}
                      </CardDescription>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={(e) => handleDelete(diagram.id, e)}
                    >
                      削除
                    </Button>
                  </div>
                  <div className="flex gap-4 text-xs text-muted-foreground mt-2">
                    <span>アクター: {diagram.actors.length}</span>
                    <span>フロー: {diagram.flows.length}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    更新: {formatDate(diagram.updatedAt)}
                  </p>
                </CardHeader>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
