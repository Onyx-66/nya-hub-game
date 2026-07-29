import React, { Suspense } from "react";
import { WATER_SORT_META } from "./game.config";

const WaterSortGame = React.lazy(() => import("./components/WaterSortGame"));

function WaterSortLoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-[300px]">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm text-muted-foreground">
          Loading {WATER_SORT_META.displayName}...
        </p>
      </div>
    </div>
  );
}

export default function WaterSortGameWrapper() {
  return (
    <Suspense fallback={<WaterSortLoadingFallback />}>
      <WaterSortGame />
    </Suspense>
  );
}

export { WATER_SORT_META };