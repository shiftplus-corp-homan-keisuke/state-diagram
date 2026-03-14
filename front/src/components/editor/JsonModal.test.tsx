import { beforeEach, describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { JsonModal } from "@/components/editor/JsonModal";
import { useDiagramStore } from "@/stores/diagramStore";
import { useUIStore } from "@/stores/uiStore";
import { createDiagram } from "@/test/factories";

describe("JsonModal", () => {
  beforeEach(() => {
    useDiagramStore.setState({
      diagram: createDiagram(),
      isDirty: false,
      lastSavedAt: new Date("2026-03-02T00:00:00.000Z"),
    });
    useUIStore.setState({ isJsonModalOpen: true });
  });

  it("不正なJSONでは適用ボタンが無効になる", async () => {
    const user = userEvent.setup();

    render(<JsonModal />);

    await user.click(screen.getByRole("button", { name: "インポート" }));
    fireEvent.change(
      screen.getByPlaceholderText("ここにJSONを貼り付けてください"),
      { target: { value: "{invalid json}" } },
    );

    expect(screen.getByRole("button", { name: "適用" })).toBeDisabled();
    expect(screen.getByText("インポート結果")).toBeInTheDocument();
    expect(screen.getByText("JSON の解析に失敗しました")).toBeInTheDocument();
  });

  it("warning付きJSONではsummaryを表示し適用ボタンが有効になる", async () => {
    const user = userEvent.setup();

    render(<JsonModal />);

    await user.click(screen.getByRole("button", { name: "インポート" }));
    fireEvent.change(
      screen.getByPlaceholderText("ここにJSONを貼り付けてください"),
      {
        target: {
          value: JSON.stringify({
            name: "Imported Diagram",
            createdAt: "invalid-date",
            updatedAt: "2026-03-10T00:00:00.000Z",
            actors: [
              {
                id: "actor-1",
                type: "component",
                name: "App",
              },
            ],
            states: [],
            conditions: [],
            flows: [],
          }),
        },
      },
    );

    expect(screen.getByRole("button", { name: "適用" })).toBeEnabled();
    expect(screen.getByText("Actor")).toBeInTheDocument();
    expect(screen.getByText("Warning")).toBeInTheDocument();
    expect(screen.getByText("Fix")).toBeInTheDocument();
    expect(screen.getByText("createdAt が不正なため現在時刻で補完しました")).toBeInTheDocument();
    expect(screen.getByText("warning")).toBeInTheDocument();
  });
});
