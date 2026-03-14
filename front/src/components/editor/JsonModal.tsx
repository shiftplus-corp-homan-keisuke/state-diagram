import { useMemo, useState, type ChangeEvent } from "react";
import { Copy, Download, Upload, Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { validateDiagramImport } from "@/lib/diagramImport";
import { useDiagramStore } from "@/stores/diagramStore";
import { useUIStore } from "@/stores/uiStore";

const summaryLabels = [
  ["actor", "Actor"],
  ["state", "State"],
  ["flow", "Flow"],
  ["condition", "Condition"],
  ["error", "Error"],
  ["warning", "Warning"],
  ["skip", "Skip"],
  ["fix", "Fix"],
] as const;

export function JsonModal() {
  const { diagram, setDiagram } = useDiagramStore();
  const { isJsonModalOpen, closeJsonModal } = useUIStore();
  const [jsonContent, setJsonContent] = useState("");
  const [mode, setMode] = useState<"export" | "import">("export");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  const importResult = useMemo(() => {
    if (mode !== "import" || !jsonContent.trim()) {
      return null;
    }

    return validateDiagramImport(jsonContent, {
      currentDiagramId: diagram?.id,
    });
  }, [diagram?.id, jsonContent, mode]);

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
    if (!importResult || importResult.status === "error" || !importResult.diagram) {
      return;
    }

    setDiagram(importResult.diagram, { isDirty: true });
    closeJsonModal();
  };

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
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
          <DialogDescription>
            ダイアグラム JSON の書き出しと取り込みを行います。インポート時は検証結果を確認してから適用してください。
          </DialogDescription>
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

          {mode === "import" && importResult && (
            <div className="space-y-3 shrink-0 border rounded-md p-3 bg-muted/20">
              <div className="flex items-center gap-2 text-sm">
                <span
                  className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                    importResult.status === "success"
                      ? "bg-emerald-100 text-emerald-700"
                      : importResult.status === "warning"
                        ? "bg-amber-100 text-amber-700"
                        : "bg-red-100 text-red-700"
                  }`}
                >
                  {importResult.status}
                </span>
                <span className="text-muted-foreground">インポート結果</span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
                {summaryLabels.map(([key, label]) => (
                  <div key={key} className="rounded border bg-background px-2 py-1">
                    <div className="text-muted-foreground">{label}</div>
                    <div className="font-semibold">{importResult.summary[key]}</div>
                  </div>
                ))}
              </div>

              <div className="max-h-40 space-y-1 overflow-y-auto text-xs">
                {importResult.messages.map((message, index) => (
                  <p
                    key={`${message.level}-${index}`}
                    className={
                      message.level === "error"
                        ? "text-destructive"
                        : message.level === "warning"
                          ? "text-amber-700"
                          : "text-emerald-700"
                    }
                  >
                    {message.text}
                  </p>
                ))}
              </div>
            </div>
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
            <Button
              onClick={handleApplyImport}
              disabled={!importResult || importResult.status === "error"}
            >
              適用
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
