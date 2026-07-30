import React, { Suspense } from "react";
import { MULTI_COLOR_FILL_META } from "./game.config";

const MultiColorFillGame = React.lazy(() => import("./components/MultiColorFillGame"));

function MultiColorFillLoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-[300px]">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm text-muted-foreground">
          Loading {MULTI_COLOR_FILL_META.displayName}...
        </p>
      </div>
    </div>
  );
}

export default function MultiColorFillGameWrapper() {
  return (
    <Suspense fallback={<MultiColorFillLoadingFallback />}>
      <MultiColorFillGame />
    </Suspense>
  );
}

export { MULTI_COLOR_FILL_META };