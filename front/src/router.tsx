import {
  createRouter,
  createRootRoute,
  createRoute,
  Outlet,
} from "@tanstack/react-router";
import { lazy, Suspense } from "react";

// 遅延読み込みコンポーネント
const DiagramListPage = lazy(() => import("./pages/DiagramListPage"));
const DiagramEditorPage = lazy(() => import("./pages/DiagramEditorPage"));

// ローディングコンポーネント
const Loading = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <p className="text-muted-foreground">読み込み中...</p>
  </div>
);

// ルートレイアウト
const rootRoute = createRootRoute({
  component: () => <Outlet />,
});

// ダイアグラム一覧ページ
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: () => (
    <Suspense fallback={<Loading />}>
      <DiagramListPage />
    </Suspense>
  ),
});

// ダイアグラム編集ページ
const diagramRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/diagram/$diagramId",
  component: () => (
    <Suspense fallback={<Loading />}>
      <DiagramEditorPage />
    </Suspense>
  ),
});

// ルートツリー
const routeTree = rootRoute.addChildren([indexRoute, diagramRoute]);

// ルーターを作成
export const router = createRouter({ routeTree });

// 型安全のための宣言
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
