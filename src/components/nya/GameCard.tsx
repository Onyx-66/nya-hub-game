import { useState } from "react";
import { motion } from "framer-motion";
import { Lock, Play, Star, Sparkles, Flame, TrendingUp, PawPrint, Feather, Sword, LayoutGrid, Droplet, Gem, Palette, PaintBucket } from "lucide-react";
import type { ComponentType, CSSProperties } from "react";
import type { GameMeta } from "@/types";
import { scoreToStars } from "@/hooks/useGameEconomy";
import DifficultyDots from "@/components/nya/DifficultyDots";

export type GameBadge = "trend" | "hot" | null;

interface GameCardProps {
  game: GameMeta;
  index?: number;
  highScore?: number;
  badge?: GameBadge;
  onPlay?: (game: GameMeta) => void;
}

type IconComp = ComponentType<{ className?: string; style?: CSSProperties }>;

const GAME_SLUG_ICONS: Record<string, IconComp> = {
  snake: Droplet,
  "water-sort": PaintBucket,
  meowdoku: LayoutGrid,
  "angry-birds": Feather,
  "quiz-sword": Sword,
  "block-blast": LayoutGrid,
  "candy-crush": Gem,
  coloring: Palette,
};

/** Pastel gradient per category */
const categoryGradients: Record<string, string> = {
  arcade: "from-pink-400 to-rose-500",
  puzzle: "from-violet-400 to-purple-500",
  action: "from-orange-400 to-pink-500",
  adventure: "from-emerald-400 to-teal-500",
  strategy: "from-cyan-400 to-blue-500",
  idle: "from-amber-400 to-orange-500",
};

function GameIcon({ game }: { game: GameMeta }) {
  const [imgError, setImgError] = useState(false);
  const { iconPath, primaryColor } = game;

  // Lucide icon — lookup by game slug (reliable) with iconPath fallback
  const SlugIcon = GAME_SLUG_ICONS[game.slug];
  if (SlugIcon) {
    return (
      <div className="w-16 h-16 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center">
        <SlugIcon className="w-12 h-12" style={{ color: primaryColor ?? "#ffffff" }} />
      </div>
    );
  }
  if (iconPath?.startsWith("lucide:")) {
    const name = iconPath.slice(6);
    const Icon = GAME_SLUG_ICONS[name];
    if (Icon) {
      return (
        <div className="w-16 h-16 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center">
          <Icon className="w-12 h-12" style={{ color: primaryColor ?? "#ffffff" }} />
        </div>
      );
    }
  }

  // Image file (SVG/PNG) — with fallback on load error
  if (iconPath?.startsWith("/") && !imgError) {
    return (
      <img
        src={iconPath}
        alt={game.name.en}
        className="w-16 h-16 rounded-2xl object-cover bg-white/10"
        onError={() => setImgError(true)}
      />
    );
  }

  // Fallback: PawPrint icon in game's primary color
  return (
    <div className="w-16 h-16 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center">
      <PawPrint className="w-12 h-12" style={{ color: primaryColor ?? "#ffffff" }} />
    </div>
  );
}

/**
 * Hub game card — displays a game's icon, name, description, difficulty,
 * featured badge, and a Play button. Shows a "Coming Soon" lock state when
 * isComingSoon is true, and star ratings for played games.
 */
export default function GameCard({ game, index = 0, highScore, badge, onPlay }: GameCardProps) {
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
        className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${gradient} p-4 aspect-[4/5] flex flex-col justify-between shadow-lg ${
          locked ? "opacity-60" : ""
        }`}
      >
        {/* decorative blobs */}
        <div className="absolute -top-8 -right-8 w-28 h-28 rounded-full bg-white/10 blur-xl" />
        <div className="absolute -bottom-10 -left-6 w-32 h-32 rounded-full bg-black/10 blur-xl" />

        {/* category badge + featured + coming soon + hot/trend */}
        <div className="relative flex items-start justify-between">
          <span className="text-[10px] font-heading uppercase tracking-wider bg-black/25 backdrop-blur-sm text-white px-2.5 py-1 rounded-full">
            {game.category}
          </span>
          <div className="flex items-center gap-1.5">
            {badge === "trend" && (
              <span className="flex items-center gap-0.5 text-[9px] font-bold bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white px-2 py-1 rounded-full shadow-md">
                <TrendingUp className="w-2.5 h-2.5" /> Trend
              </span>
            )}
            {badge === "hot" && (
              <span className="flex items-center gap-0.5 text-[9px] font-bold bg-gradient-to-r from-orange-500 to-red-500 text-white px-2 py-1 rounded-full shadow-md">
                <Flame className="w-2.5 h-2.5" /> Hot
              </span>
            )}
            {game.isFeatured && !locked && badge === null && (
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
          <GameIcon game={game} />
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
              <DifficultyDots difficulty={game.difficulty} variant="light" />
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
              className={`flex items-center gap-1.5 text-xs font-bold px-4 py-2.5 rounded-full transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 ${
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