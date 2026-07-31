import React, { Suspense } from "react";
import { WHISKERS_RUNNER_META } from "./game.config";

const WhiskersRunnerGame = React.lazy(() => import("./components/WhiskersRunnerGame"));

function WhiskersRunnerLoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-[300px]">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm text-muted-foreground">
          Loading {WHISKERS_RUNNER_META.displayName}...
        </p>
      </div>
    </div>
  );
}

export default function WhiskersRunnerGameWrapper() {
  return (
    <Suspense fallback={<WhiskersRunnerLoadingFallback />}>
      <WhiskersRunnerGame />
    </Suspense>
  );
}

export { WHISKERS_RUNNER_META };