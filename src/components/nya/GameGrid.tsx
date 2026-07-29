import { motion } from "framer-motion";
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
 */
export default function GameGrid({ games, highScores = {}, onPlay }: GameGridProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
      {games.map((game, i) => (
        <motion.div
          key={game.id}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.05, duration: 0.3 }}
        >
          <GameCard
            game={game}
            index={i}
            highScore={highScores[game.slug] ?? 0}
            onPlay={onPlay}
          />
        </motion.div>
      ))}
    </div>
  );
}