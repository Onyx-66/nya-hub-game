import React, { Suspense } from "react";
import { BLOCK_BLAST_META } from "./game.config";

const BlockBlastGame = React.lazy(() => import("./components/BlockBlastGame"));

function BlockBlastLoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-[300px]">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm text-muted-foreground">
          Loading {BLOCK_BLAST_META.displayName}...
        </p>
      </div>
    </div>
  );
}

export default function BlockBlastGameWrapper() {
  return (
    <Suspense fallback={<BlockBlastLoadingFallback />}>
      <BlockBlastGame />
    </Suspense>
  );
}

export { BLOCK_BLAST_META };