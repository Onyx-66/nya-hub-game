import React, { Suspense } from "react";
import { SUPER_CAT_JUMP_META } from "./game.config";

const SuperCatJumpGame = React.lazy(() => import("./components/SuperCatJumpGame"));

function SuperCatJumpLoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-[300px]">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm text-muted-foreground">
          Loading {SUPER_CAT_JUMP_META.displayName}...
        </p>
      </div>
    </div>
  );
}

export default function SuperCatJumpGameWrapper() {
  return (
    <Suspense fallback={<SuperCatJumpLoadingFallback />}>
      <SuperCatJumpGame />
    </Suspense>
  );
}

export { SUPER_CAT_JUMP_META };