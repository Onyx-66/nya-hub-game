import { motion } from "framer-motion";
import { Lock, Play, Star, Sparkles } from "lucide-react";
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

/** Colored dot for each difficulty level */
const difficultyDots: Record<string, string> = {
  easy: "bg-emerald-400",
  medium: "bg-amber-400",
  hard: "bg-rose-500",
};

/**
 * Hub game card — displays a game's icon, name, description, difficulty,
 * featured badge, and a Play button. Shows a "Coming Soon" lock state when
 * isComingSoon is true, and star ratings for played games.
 */
export default function GameCard({ game, index = 0, highScore, onPlay }: GameCardProps) {
  const gradient = categoryGradients[game.category] ?? "from-pink-400 to-violet-500";
  const locked = game.isComingSoon;
  const stars = scoreToStars(highScore ?? 0);
  const played = highScore !== undefined && highScore > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4, ease: "easeOut" }}
      whileHover={{ scale: locked ? 1 : 1.03 }}
      whileTap={{ scale: locked ? 1 : 0.97 }}
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

        {/* category badge + featured + coming soon */}
        <div className="relative flex items-start justify-between">
          <span className="text-[10px] font-heading uppercase tracking-wider bg-black/25 backdrop-blur-sm text-white px-2.5 py-1 rounded-full">
            {game.category}
          </span>
          <div className="flex items-center gap-1.5">
            {game.isFeatured && !locked && (
              <span className="flex items-center gap-0.5 text-[9px] font-bold bg-gold/90 text-black px-2 py-1 rounded-full">
                <Sparkles className="w-2.5 h-2.5" /> Featured
              </span>
            )}
            {locked && (
              <span className="flex items-center gap-1 text-[10px] font-bold bg-black/40 text-white/80 px-2 py-1 rounded-full">
                <Lock className="w-2.5 h-2.5" /> Soon
              </span>
            )}
          </div>
        </div>

        {/* icon */}
        <div className="relative flex justify-center items-center flex-1 my-2">
          <span className="text-6xl drop-shadow-2xl">{game.icon}</span>
        </div>

        {/* name + description + play */}
        <div className="relative">
          <h3 className="font-heading font-bold text-white text-lg leading-tight">
            {game.name.en}
          </h3>
          <p className="text-[11px] text-white/70 line-clamp-1 mt-0.5">
            {game.description?.en}
          </p>
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-2">
              {/* difficulty dots */}
              <div className="flex items-center gap-1">
                {["easy", "medium", "hard"].map((lvl) => (
                  <span
                    key={lvl}
                    className={`w-1.5 h-1.5 rounded-full ${
                      game.difficulty === lvl
                        ? difficultyDots[lvl]
                        : "bg-white/20"
                    }`}
                  />
                ))}
              </div>
              <span className="text-[11px] text-white/80 capitalize">
                {game.difficulty}
              </span>
              {played && (
                <div className="flex items-center gap-0.5 ml-1">
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