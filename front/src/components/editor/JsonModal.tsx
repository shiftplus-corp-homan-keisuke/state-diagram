import { useState } from "react";
import { Copy, Download, Upload, Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useDiagramStore } from "@/stores/diagramStore";
import { useUIStore } from "@/stores/uiStore";
import type { Diagram } from "@/types/diagram";

export function JsonModal() {
  const { diagram, setDiagram } = useDiagramStore();
  const { isJsonModalOpen, closeJsonModal } = useUIStore();
  const [jsonContent, setJsonContent] = useState("");
  const [mode, setMode] = useState<"export" | "import">("export");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  const handleExport = () => {
    if (!diagram) return;
    const json = JSON.stringify(diagram, null, 2);
    setJsonContent(json);
    setMode("export");
    setError("");
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(jsonContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("クリップボードへのコピーに失敗しました");
    }
  };

  const handleDownload = () => {
    if (!diagram) return;
    const blob = new Blob([jsonContent], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${diagram.name}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    setMode("import");
    setJsonContent("");
    setError("");
  };

  const handleApplyImport = () => {
    try {
      const parsed = JSON.parse(jsonContent) as any;

      // 基本的なバリデーション
      if (!parsed.id || !parsed.name) {
        throw new Error("無効なダイアグラム形式です（id, nameは必須です）");
      }

      // Dateオブジェクトへの変換
      // JSON.parse直後は文字列なので、明示的にDate型に変換する必要があります
      parsed.createdAt = parsed.createdAt
        ? new Date(parsed.createdAt)
        : new Date();
      parsed.updatedAt = parsed.updatedAt
        ? new Date(parsed.updatedAt)
        : new Date();

      if (!Array.isArray(parsed.actors)) parsed.actors = [];
      if (!Array.isArray(parsed.states)) parsed.states = [];
      if (!Array.isArray(parsed.flows)) parsed.flows = [];
      if (!Array.isArray(parsed.conditions)) parsed.conditions = [];

      // バリデーション完了後、Diagram型として扱う
      const validDiagram = parsed as Diagram;

      // 現在のダイアグラムのIDを維持（インポートしたデータで上書きする場合）
      if (diagram) {
        validDiagram.id = diagram.id;
        validDiagram.updatedAt = new Date();
      }

      setDiagram(validDiagram);
      closeJsonModal();
    } catch (e) {
      setError(e instanceof Error ? e.message : "JSONの解析に失敗しました");
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setJsonContent(content);
      setError("");
    };
    reader.onerror = () => {
      setError("ファイルの読み込みに失敗しました");
    };
    reader.readAsText(file);
  };

  return (
    <Dialog open={isJsonModalOpen} onOpenChange={closeJsonModal}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] flex flex-col overflow-hidden">
        <DialogHeader className="shrink-0">
          <DialogTitle>JSON エクスポート / インポート</DialogTitle>
        </DialogHeader>

        <div className="flex gap-2 mb-4 shrink-0">
          <Button
            variant={mode === "export" ? "default" : "outline"}
            size="sm"
            onClick={handleExport}
          >
            <Download className="h-4 w-4 mr-1" />
            エクスポート
          </Button>
          <Button
            variant={mode === "import" ? "default" : "outline"}
            size="sm"
            onClick={handleImport}
          >
            <Upload className="h-4 w-4 mr-1" />
            インポート
          </Button>
        </div>

        <div className="space-y-3 flex flex-col flex-1 min-h-0 overflow-hidden">
          {mode === "import" && (
            <div className="flex items-center gap-2 shrink-0">
              <label className="flex-1">
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Button variant="outline" size="sm" asChild>
                  <span className="cursor-pointer">
                    <Upload className="h-4 w-4 mr-1" />
                    ファイルを選択
                  </span>
                </Button>
              </label>
              <span className="text-sm text-muted-foreground">
                または下に直接JSONを貼り付け
              </span>
            </div>
          )}

          <Textarea
            value={jsonContent}
            onChange={(e) => setJsonContent(e.target.value)}
            placeholder={
              mode === "export"
                ? "エクスポートボタンを押すとJSONが表示されます"
                : "ここにJSONを貼り付けてください"
            }
            className="font-mono text-xs flex-1 min-h-[200px] resize-none overflow-y-auto"
            readOnly={mode === "export"}
          />

          {error && (
            <p className="text-sm text-destructive shrink-0">{error}</p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={closeJsonModal}>
            閉じる
          </Button>
          {mode === "export" && jsonContent && (
            <>
              <Button variant="outline" onClick={handleCopy}>
                {copied ? (
                  <>
                    <Check className="h-4 w-4 mr-1" />
                    コピー済み
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-1" />
                    コピー
                  </>
                )}
              </Button>
              <Button onClick={handleDownload}>
                <Download className="h-4 w-4 mr-1" />
                ダウンロード
              </Button>
            </>
          )}
          {mode === "import" && jsonContent && (
            <Button onClick={handleApplyImport}>適用</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
