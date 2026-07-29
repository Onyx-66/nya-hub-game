import React, { Suspense } from "react";
import { COLORING_META } from "./game.config";

const ColoringGame = React.lazy(() => import("./components/ColoringGame"));

function ColoringLoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-[300px]">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm text-muted-foreground">
          Loading {COLORING_META.displayName}...
        </p>
      </div>
    </div>
  );
}

export default function ColoringGameWrapper() {
  return (
    <Suspense fallback={<ColoringLoadingFallback />}>
      <ColoringGame />
    </Suspense>
  );
}

export { COLORING_META };