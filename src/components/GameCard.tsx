import { motion } from "framer-motion";
import { Lock, Play, Star } from "lucide-react";
import { Link } from "react-router-dom";
import type { GameConfig } from "@/types";

interface GameCardProps {
  game: GameConfig & { highScore: number; locked: boolean };
  index: number;
}

export default function GameCard({ game, index }: GameCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07, duration: 0.4, ease: "easeOut" }}
      className="relative"
    >
      <Link
        to={game.locked ? "#" : `/games/${game.id}`}
        onClick={(e) => game.locked && e.preventDefault()}
        className="block"
      >
        <div
          className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${game.gradient} p-4 aspect-[4/5] flex flex-col justify-between shadow-lg`}
        >
          {/* decorative blobs */}
          <div className="absolute -top-8 -right-8 w-28 h-28 rounded-full bg-white/10 blur-xl" />
          <div className="absolute -bottom-10 -left-6 w-32 h-32 rounded-full bg-black/10 blur-xl" />

          {/* category badge */}
          <div className="relative flex items-start justify-between">
            <span className="text-[10px] font-heading uppercase tracking-wider bg-black/25 backdrop-blur-sm text-white px-2.5 py-1 rounded-full">
              {game.category}
            </span>
            {game.highScore > 0 && (
              <span className="flex items-center gap-1 text-[10px] font-bold bg-black/25 backdrop-blur-sm text-yellow-300 px-2 py-1 rounded-full">
                <Star className="w-3 h-3 fill-yellow-300" />
                {game.highScore}
              </span>
            )}
          </div>

          {/* icon */}
          <div className="relative flex justify-center items-center flex-1 my-2">
            <span className="text-6xl drop-shadow-2xl">{game.icon}</span>
          </div>

          {/* title + play */}
          <div className="relative">
            <h3 className="font-heading font-bold text-white text-lg leading-tight">
              {game.title}
            </h3>
            <div className="flex items-center justify-between mt-2">
              <span className="text-[11px] text-white/80 capitalize">
                {game.difficulty}
              </span>
              <span
                className={`flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-full transition-colors ${
                  game.locked
                    ? "bg-black/30 text-white/60"
                    : "bg-white text-black"
                }`}
              >
                {game.locked ? (
                  <>
                    <Lock className="w-3 h-3" /> Lv {game.unlockLevel}
                  </>
                ) : (
                  <>
                    <Play className="w-3 h-3 fill-black" /> Play
                  </>
                )}
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}