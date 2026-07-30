import { motion } from "framer-motion";
import { Play, Lock, Star, Flame, TrendingUp } from "lucide-react";
import type { GameMeta } from "@/types";
import { scoreToStars } from "@/hooks/useGameEconomy";
import DifficultyDots from "@/components/nya/DifficultyDots";
import { GAME_SLUG_ICONS, type GameBadge } from "@/components/nya/GameCard";

const categoryGradients: Record<string, string> = {
  arcade: "from-pink-400 to-rose-500",
  puzzle: "from-violet-400 to-purple-500",
  action: "from-orange-400 to-pink-500",
  adventure: "from-emerald-400 to-teal-500",
  strategy: "from-cyan-400 to-blue-500",
  idle: "from-amber-400 to-orange-500",
};

interface GameListRowProps {
  game: GameMeta;
  index?: number;
  highScore?: number;
  badge?: GameBadge;
  onPlay?: (game: GameMeta) => void;
}

export default function GameListRow({ game, index = 0, highScore = 0, badge = null, onPlay }: GameListRowProps) {
  const gradient = categoryGradients[game.category] ?? "from-pink-400 to-violet-500";
  const locked = game.isComingSoon;
  const stars = scoreToStars(highScore);
  const played = highScore > 0;
  const Icon = GAME_SLUG_ICONS[game.slug];

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.03, duration: 0.3 }}
      className="flex items-center gap-3 bg-card rounded-2xl border border-border/50 p-3 hover:border-primary/30 transition-colors"
    >
      {/* Icon tile */}
      <div className={`shrink-0 w-14 h-14 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-md`}>
        {Icon ? (
          <Icon className="w-7 h-7 text-white" />
        ) : (
          <Play className="w-6 h-6 text-white" />
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="font-heading font-bold text-sm text-foreground truncate">
            {game.name.en}
          </h3>
          {badge === "trend" && (
            <span className="flex items-center gap-0.5 text-[8px] font-bold bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white px-1.5 py-0.5 rounded-full shrink-0">
              <TrendingUp className="w-2 h-2" />
            </span>
          )}
          {badge === "hot" && (
            <span className="flex items-center gap-0.5 text-[8px] font-bold bg-gradient-to-r from-orange-500 to-red-500 text-white px-1.5 py-0.5 rounded-full shrink-0">
              <Flame className="w-2 h-2" />
            </span>
          )}
          {locked && <Lock className="w-3 h-3 text-muted-foreground shrink-0" />}
        </div>
        <p className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">
          {game.description?.en}
        </p>
        <div className="flex items-center gap-2 mt-1">
          <DifficultyDots difficulty={game.difficulty} variant="dark" />
          {played && (
            <div className="flex items-center gap-0.5">
              {Array.from({ length: 3 }).map((_, i) => (
                <Star key={i} className={`w-2.5 h-2.5 ${i < stars ? "fill-gold text-gold" : "text-muted-foreground/30"}`} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Play button */}
      <button
        onClick={() => !locked && onPlay?.(game)}
        disabled={locked}
        className={`shrink-0 flex items-center gap-1 text-xs font-bold px-4 py-2 rounded-full transition-all ${
          locked
            ? "bg-muted text-muted-foreground/50 cursor-not-allowed"
            : "bg-primary text-primary-foreground active:scale-95"
        }`}
      >
        {locked ? <Lock className="w-3 h-3" /> : <Play className="w-3 h-3 fill-primary-foreground" />}
        {locked ? "Soon" : "Play"}
      </button>
    </motion.div>
  );
}