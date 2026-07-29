import React, { Suspense } from "react";
import { MEOWDOKU_META } from "./game.config";

const MeowdokuGame = React.lazy(() => import("./components/MeowdokuGame"));

function MeowdokuLoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-[300px]">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm text-muted-foreground">
          Loading {MEOWDOKU_META.displayName}...
        </p>
      </div>
    </div>
  );
}

export default function MeowdokuGameWrapper() {
  return (
    <Suspense fallback={<MeowdokuLoadingFallback />}>
      <MeowdokuGame />
    </Suspense>
  );
}

export { MEOWDOKU_META };