import React, { Suspense } from "react";
import { PAWS_MERGE_META } from "./game.config";

const PawsMergeGame = React.lazy(() => import("./components/PawsMergeGame"));

function PawsMergeLoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-[300px]">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm text-muted-foreground">
          Loading {PAWS_MERGE_META.displayName}...
        </p>
      </div>
    </div>
  );
}

export default function PawsMergeGameWrapper() {
  return (
    <Suspense fallback={<PawsMergeLoadingFallback />}>
      <PawsMergeGame />
    </Suspense>
  );
}

export { PAWS_MERGE_META };