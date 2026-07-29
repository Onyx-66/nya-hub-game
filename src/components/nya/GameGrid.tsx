import GameCard from "./GameCard";
import type { GameMeta } from "@/types";

interface GameGridProps {
  games: GameMeta[];
  highScores?: Record<string, number>;
  onPlay: (game: GameMeta) => void;
}

/**
 * Responsive grid of GameCards.
 * 2 columns on mobile, 3 on tablet+.
 * Stagger animation is handled by GameCard itself (no double-wrapper).
 */
export default function GameGrid({ games, highScores = {}, onPlay }: GameGridProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
      {games.map((game, i) => (
        <GameCard
          key={game.id}
          game={game}
          index={i}
          highScore={highScores[game.slug] ?? 0}
          onPlay={onPlay}
        />
      ))}
    </div>
  );
}