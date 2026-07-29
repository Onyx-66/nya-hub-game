import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Lock } from "lucide-react";
import { getGameById } from "@/services/games";
import { usePlayerStore } from "@/store/usePlayerStore";

export default function GamePlayer() {
  const { gameId } = useParams<{ gameId: string }>();
  const game = gameId ? getGameById(gameId) : undefined;
  const playerLevel = usePlayerStore((s) => s.level);

  if (!game) {
    return (
      <div className="px-4 py-10 text-center">
        <p className="text-muted-foreground">Game not found.</p>
        <Link to="/" className="text-primary text-sm mt-2 inline-block">
          Back to hub
        </Link>
      </div>
    );
  }

  const locked = playerLevel < game.unlockLevel;
  const GameComponent = game.component;

  return (
    <div>
      <div className="px-4 py-3 flex items-center gap-3">
        <Link
          to="/"
          className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center text-foreground hover:bg-muted/70 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="font-heading font-bold text-foreground text-lg">
            {game.title}
          </h1>
          <p className="text-xs text-muted-foreground capitalize">
            {game.category} · {game.difficulty}
          </p>
        </div>
      </div>

      {locked ? (
        <div className="px-4 py-16 text-center">
          <Lock className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="font-heading font-bold text-foreground">
            Reach Level {game.unlockLevel} to unlock
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            You're level {playerLevel} — keep playing!
          </p>
        </div>
      ) : (
        <GameComponent />
      )}
    </div>
  );
}