import { motion } from "framer-motion";
import { Play, Lock, Flame, TrendingUp } from "lucide-react";
import type { GameMeta } from "@/types";
import { GAME_SLUG_ICONS, type GameBadge } from "@/components/nya/GameCard";

const categoryGradients: Record<string, string> = {
  arcade: "from-pink-400 to-rose-500",
  puzzle: "from-violet-400 to-purple-500",
  action: "from-orange-400 to-pink-500",
  adventure: "from-emerald-400 to-teal-500",
  strategy: "from-cyan-400 to-blue-500",
  idle: "from-amber-400 to-orange-500",
};

interface CompactGameCardProps {
  game: GameMeta;
  index?: number;
  highScore?: number;
  badge?: GameBadge;
  onPlay?: (game: GameMeta) => void;
}

export default function CompactGameCard({ game, index = 0, badge = null, onPlay }: CompactGameCardProps) {
  const gradient = categoryGradients[game.category] ?? "from-pink-400 to-violet-500";
  const locked = game.isComingSoon;
  const Icon = GAME_SLUG_ICONS[game.slug];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.03, duration: 0.3 }}
      whileTap={{ scale: locked ? 1 : 0.95 }}
      className="relative"
    >
      <div className={`relative overflow-hidden rounded-xl bg-gradient-to-br ${gradient} p-2.5 flex flex-col items-center gap-1.5 shadow-md ${locked ? "opacity-50" : ""}`}>
        {/* Badges */}
        <div className="absolute top-1.5 right-1.5 flex gap-1">
          {badge === "trend" && (
            <span className="flex items-center text-[7px] font-bold bg-violet-600 text-white px-1 py-0.5 rounded-full">
              <TrendingUp className="w-2 h-2" />
            </span>
          )}
          {badge === "hot" && (
            <span className="flex items-center text-[7px] font-bold bg-orange-600 text-white px-1 py-0.5 rounded-full">
              <Flame className="w-2 h-2" />
            </span>
          )}
          {locked && <Lock className="w-3 h-3 text-white/70" />}
        </div>

        {/* Icon */}
        <div className="w-10 h-10 rounded-lg bg-white/15 flex items-center justify-center mt-1.5">
          {Icon ? <Icon className="w-6 h-6 text-white" /> : <Play className="w-5 h-5 text-white" />}
        </div>

        {/* Name */}
        <h3 className="font-heading font-bold text-white text-[10px] leading-tight text-center line-clamp-2 w-full">
          {game.name.en}
        </h3>

        {/* Play */}
        <button
          onClick={() => !locked && onPlay?.(game)}
          disabled={locked}
          className="w-full flex items-center justify-center gap-0.5 text-[9px] font-bold px-2 py-1.5 rounded-full bg-white text-gray-900 active:scale-95 transition-transform"
        >
          {locked ? <Lock className="w-2.5 h-2.5" /> : <Play className="w-2.5 h-2.5 fill-gray-900" />}
          {locked ? "Soon" : "Play"}
        </button>
      </div>
    </motion.div>
  );
}