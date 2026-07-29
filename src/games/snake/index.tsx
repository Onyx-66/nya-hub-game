import React, { Suspense } from "react";
import { SNAKE_GAME_META } from "./game.config";

// Lazy load the heavy game component
const SnakeGame = React.lazy(() => import("./components/SnakeGame"));

function SnakeLoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-[300px]">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm text-muted-foreground">
          Loading {SNAKE_GAME_META.displayName}...
        </p>
      </div>
    </div>
  );
}

export default function SnakeGameWrapper() {
  return (
    <Suspense fallback={<SnakeLoadingFallback />}>
      <SnakeGame />
    </Suspense>
  );
}

export { SNAKE_GAME_META };