import { motion } from "framer-motion";
import { Lock, Play, Star } from "lucide-react";
import type { GameMeta } from "@/types";
import { scoreToStars } from "@/hooks/useGameEconomy";

interface GameCardProps {
  game: GameMeta;
  index?: number;
  highScore?: number;
  onPlay?: (game: GameMeta) => void;
}

/** Pastel gradient per category */
const categoryGradients: Record<string, string> = {
  arcade: "from-pink-400 to-rose-500",
  puzzle: "from-violet-400 to-purple-500",
  action: "from-orange-400 to-pink-500",
  adventure: "from-emerald-400 to-teal-500",
  strategy: "from-cyan-400 to-blue-500",
  idle: "from-amber-400 to-orange-500",
};

/**
 * Hub game card — displays a game's icon, name, difficulty, and a Play button.
 * Accepts a GameMeta object. Shows a "Coming Soon" lock state when isComingSoon is true.
 */
export default function GameCard({ game, index = 0, highScore, onPlay }: GameCardProps) {
  const gradient = categoryGradients[game.category] ?? "from-pink-400 to-violet-500";
  const locked = game.isComingSoon;
  const stars = scoreToStars(highScore ?? 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4, ease: "easeOut" }}
      className="relative"
    >
      <div
        className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${gradient} p-4 aspect-[4/5] flex flex-col justify-between shadow-lg ${
          locked ? "opacity-60" : ""
        }`}
      >
        {/* decorative blobs */}
        <div className="absolute -top-8 -right-8 w-28 h-28 rounded-full bg-white/10 blur-xl" />
        <div className="absolute -bottom-10 -left-6 w-32 h-32 rounded-full bg-black/10 blur-xl" />

        {/* category badge + coming soon */}
        <div className="relative flex items-start justify-between">
          <span className="text-[10px] font-heading uppercase tracking-wider bg-black/25 backdrop-blur-sm text-white px-2.5 py-1 rounded-full">
            {game.category}
          </span>
          {locked && (
            <span className="flex items-center gap-1 text-[10px] font-bold bg-black/40 text-white/80 px-2 py-1 rounded-full">
              <Lock className="w-2.5 h-2.5" /> Soon
            </span>
          )}
        </div>

        {/* icon */}
        <div className="relative flex justify-center items-center flex-1 my-2">
          <span className="text-6xl drop-shadow-2xl">{game.icon}</span>
        </div>

        {/* name + play */}
        <div className="relative">
          <h3 className="font-heading font-bold text-white text-lg leading-tight">
            {game.name.en}
          </h3>
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-white/80 capitalize">
                {game.difficulty}
              </span>
              {highScore !== undefined && highScore > 0 && (
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3 h-3 ${
                        i < stars ? "fill-gold text-gold" : "text-white/25"
                      }`}
                    />
                  ))}
                  <span className="text-[10px] text-white/70 ml-1">{highScore}</span>
                </div>
              )}
            </div>
            <button
              onClick={() => !locked && onPlay?.(game)}
              disabled={locked}
              className={`flex items-center gap-1.5 text-xs font-bold px-4 py-1.5 rounded-full transition-all ${
                locked
                  ? "bg-black/30 text-white/50 cursor-not-allowed"
                  : "bg-white text-gray-900 active:scale-95"
              }`}
            >
              {locked ? (
                <>
                  <Lock className="w-3 h-3" /> Soon
                </>
              ) : (
                <>
                  <Play className="w-3 h-3 fill-gray-900" /> Play
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}