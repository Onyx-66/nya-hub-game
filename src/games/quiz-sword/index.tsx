import React, { Suspense } from "react";
import { QUIZ_SWORD_META } from "./game.config";

const QuizSwordGame = React.lazy(() => import("./components/QuizSwordGame"));

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-[300px]">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm text-muted-foreground">Loading Sword of Knowledge...</p>
      </div>
    </div>
  );
}

export default function QuizSwordGameWrapper() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <QuizSwordGame />
    </Suspense>
  );
}

export { QUIZ_SWORD_META };