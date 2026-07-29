import React, { Suspense } from "react";
import { NYA_CRUSH_META } from "./game.config";

const NyaCrushGame = React.lazy(() => import("./components/NyaCrushGame"));

function NyaCrushLoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-[300px]">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm text-muted-foreground">
          Loading {NYA_CRUSH_META.displayName}...
        </p>
      </div>
    </div>
  );
}

export default function NyaCrushGameWrapper() {
  return (
    <Suspense fallback={<NyaCrushLoadingFallback />}>
      <NyaCrushGame />
    </Suspense>
  );
}

export { NYA_CRUSH_META };