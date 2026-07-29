import React, { Suspense } from "react";
import { ANGRY_BIRDS_META } from "./game.config";

const FuriousFelinesGame = React.lazy(() => import("./components/FuriousFelinesGame"));

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-[300px]">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm text-muted-foreground">Loading Furious Felines...</p>
      </div>
    </div>
  );
}

export default function FuriousFelinesGameWrapper() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <FuriousFelinesGame />
    </Suspense>
  );
}

export { ANGRY_BIRDS_META };