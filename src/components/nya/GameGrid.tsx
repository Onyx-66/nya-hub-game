import GameCard, { type GameBadge } from "./GameCard";
import GameListRow from "./GameListRow";
import CompactGameCard from "./CompactGameCard";
import type { GameMeta } from "@/types";
import type { GameViewMode } from "@/store/preferencesStore";

interface GameGridProps {
  games: GameMeta[];
  highScores?: Record<string, number>;
  badges?: Record<string, GameBadge>;
  onPlay: (game: GameMeta) => void;
  viewMode?: GameViewMode;
}

/**
 * Responsive game list that renders in 3 styles:
 * - grid: 2-col cards (mobile) / 3-col (tablet+) — the default rich card
 * - list: single-column horizontal rows with full descriptions
 * - compact: 3-col (mobile) / 5-col (tablet+) mini cards
 */
export default function GameGrid({
  games,
  highScores = {},
  badges = {},
  onPlay,
  viewMode = "grid",
}: GameGridProps) {
  if (viewMode === "list") {
    return (
      <div className="flex flex-col gap-2.5">
        {games.map((game, i) => (
          <GameListRow
            key={game.id}
            game={game}
            index={i}
            highScore={highScores[game.slug] ?? 0}
            badge={badges[game.slug] ?? null}
            onPlay={onPlay}
          />
        ))}
      </div>
    );
  }

  if (viewMode === "compact") {
    return (
      <div className="grid grid-cols-3 sm:grid-cols-5 gap-2.5">
        {games.map((game, i) => (
          <CompactGameCard
            key={game.id}
            game={game}
            index={i}
            highScore={highScores[game.slug] ?? 0}
            badge={badges[game.slug] ?? null}
            onPlay={onPlay}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
      {games.map((game, i) => (
        <GameCard
          key={game.id}
          game={game}
          index={i}
          highScore={highScores[game.slug] ?? 0}
          badge={badges[game.slug] ?? null}
          onPlay={onPlay}
        />
      ))}
    </div>
  );
}