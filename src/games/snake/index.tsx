import SnakeGameView from "./components/SnakeGame";
import { SNAKE_META } from "./game.config";

/**
 * SnakeGame — main entry component.
 * Renders the playable Snake canvas with full controls and economy integration.
 */
export default function SnakeGame() {
  return (
    <div className="flex flex-col items-center gap-4 px-4 py-6">
      <div className="text-center">
        <h1 className="font-heading font-bold text-2xl text-foreground flex items-center gap-2 justify-center">
          <span className="text-3xl">{SNAKE_META.icon}</span>
          {SNAKE_META.name.en}
        </h1>
        <p className="text-sm text-muted-foreground mt-1 max-w-xs">
          {SNAKE_META.description.en}
        </p>
      </div>
      <SnakeGameView />
    </div>
  );
}