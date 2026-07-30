import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Play, Sparkles, PawPrint } from "lucide-react";
import type { GameMeta } from "@/types";
import { GAME_SLUG_ICONS } from "@/data/gameIcons";

interface FeaturedBannerProps {
  games: GameMeta[];
  onPlay: (game: GameMeta) => void;
  autoAdvanceMs?: number;
}

/**
 * Auto-advancing carousel banner for featured games.
 * Shows one game at a time with a gradient backdrop, icon, name, and CTA.
 */
export default function FeaturedBanner({
  games,
  onPlay,
  autoAdvanceMs = 5000,
}: FeaturedBannerProps) {
  const [index, setIndex] = useState(0);

  const next = useCallback(
    () => setIndex((i) => (i + 1) % games.length),
    [games.length],
  );
  const prev = () => setIndex((i) => (i - 1 + games.length) % games.length);

  useEffect(() => {
    if (games.length <= 1) return;
    const timer = setInterval(next, autoAdvanceMs);
    return () => clearInterval(timer);
  }, [next, games.length, autoAdvanceMs]);

  if (games.length === 0) return null;

  const game = games[index];

  return (
    <div className="relative w-full overflow-hidden rounded-2xl shadow-xl">
      <AnimatePresence mode="wait">
        <motion.div
          key={game.id}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -40 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="relative bg-gradient-to-br from-violet-500 via-fuchsia-500 to-pink-500 p-6 flex items-center gap-5 min-h-[140px]"
        >
          {/* decorative glow */}
          <div className="absolute -top-10 -right-6 w-40 h-40 rounded-full bg-white/15 blur-2xl" />

          {/* icon */}
          <motion.div
            initial={{ scale: 0.5, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 18 }}
            className="relative shrink-0 w-20 h-20 rounded-3xl bg-white/20 backdrop-blur-sm flex items-center justify-center"
          >
            {(() => {
              const Icon = GAME_SLUG_ICONS[game.slug] ?? PawPrint;
              return <Icon className="w-10 h-10 text-white" />;
            })()}
          </motion.div>

          {/* text + CTA */}
          <div className="relative flex-1 min-w-0">
            <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-white/25 text-white px-2 py-0.5 rounded-full mb-1.5">
              <Sparkles className="w-3 h-3" /> Featured
            </span>
            <h3 className="font-heading font-bold text-white text-xl leading-tight truncate">
              {game.name.en}
            </h3>
            <p className="text-xs text-white/80 line-clamp-1 mt-0.5">
              {game.description?.en}
            </p>
            <button
              onClick={() => onPlay(game)}
              className="mt-3 inline-flex items-center gap-1.5 bg-white text-gray-900 text-xs font-bold px-4 py-2.5 rounded-full active:scale-95 transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2"
            >
              <Play className="w-3 h-3 fill-gray-900" /> Play Now
            </button>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* arrows (only if more than 1 game) */}
      {games.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            aria-label="Previous"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={next}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            aria-label="Next"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          {/* dots */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
            {games.map((_, i) => (
              <button
                key={i}
                onClick={() => setIndex(i)}
                className={`h-1.5 rounded-full transition-all ${
                  i === index ? "w-5 bg-white" : "w-1.5 bg-white/40"
                }`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}