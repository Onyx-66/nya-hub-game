import { motion } from "framer-motion";
import GameCard from "@/components/GameCard";
import { useGames } from "@/hooks/useGames";
import { usePlayerStore } from "@/store/usePlayerStore";

export default function HubPage() {
  const { games } = useGames();
  const { name } = usePlayerStore();
  const featured = games[0];

  return (
    <div className="px-4 py-5 space-y-6">
      {/* greeting */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <p className="text-muted-foreground text-sm">Welcome back,</p>
        <h1 className="font-display font-bold text-2xl text-foreground">
          {name}! 🐾
        </h1>
      </motion.div>

      {/* featured banner */}
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1, duration: 0.4 }}
        className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${featured.gradient} p-5 shadow-xl`}
      >
        <div className="absolute -top-6 -right-6 w-32 h-32 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -bottom-8 -left-4 w-28 h-28 rounded-full bg-black/10 blur-xl" />
        <div className="relative flex items-center gap-4">
          <span className="text-5xl drop-shadow-2xl">{featured.icon}</span>
          <div className="flex-1">
            <p className="text-[10px] uppercase tracking-wider text-white/70 font-bold">
              Featured Game
            </p>
            <h2 className="font-heading font-bold text-white text-xl">
              {featured.title}
            </h2>
            <p className="text-white/80 text-xs mt-0.5 line-clamp-2">
              {featured.description}
            </p>
          </div>
        </div>
      </motion.div>

      {/* game grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-heading font-bold text-lg text-foreground">
            All Games
          </h2>
          <span className="text-xs text-muted-foreground">
            {games.length} games
          </span>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {games.map((game, i) => (
            <GameCard key={game.id} game={game} index={i} />
          ))}
        </div>
      </div>
    </div>
  );
}