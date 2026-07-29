import { SNAKE_META } from "./game.config";

/**
 * SnakeGame — placeholder component.
 * The full playable UI will be built in the next step.
 */
export default function SnakeGame() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 px-4">
      <span className="text-6xl">{SNAKE_META.icon}</span>
      <h1 className="font-heading font-bold text-2xl text-foreground">
        {SNAKE_META.name.en}
      </h1>
      <p className="text-sm text-muted-foreground text-center max-w-xs">
        {SNAKE_META.description.en}
      </p>
      <p className="text-xs text-muted-foreground/60">Coming soon…</p>
    </div>
  );
}