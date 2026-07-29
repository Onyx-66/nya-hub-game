import { motion } from "framer-motion";
import { Trophy } from "lucide-react";
import { leaderboard } from "@/services/games";

export default function RankingPage() {
  const top3 = leaderboard.slice(0, 3);
  const rest = leaderboard.slice(3);

  return (
    <div className="px-4 py-5 space-y-5">
      <div>
        <h1 className="font-display font-bold text-2xl text-foreground">
          Leaderboard
        </h1>
        <p className="text-muted-foreground text-sm mt-0.5">
          Climb the ranks, earn glory.
        </p>
      </div>

      {/* podium */}
      <div className="flex items-end justify-center gap-2 pt-4">
        {top3.map((p, i) => {
          const heights = ["h-24", "h-32", "h-20"];
          const order = [1, 0, 2];
          const entry = top3[order[i]];
          return (
            <motion.div
              key={entry.rank}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="flex-1 flex flex-col items-center"
            >
              <span className="text-3xl mb-1">{entry.avatar}</span>
              <span className="text-xs font-bold text-foreground truncate max-w-full">
                {entry.pseudonym}
              </span>
              <span className="text-xs text-muted-foreground mb-1">
                {entry.score.toLocaleString()}
              </span>
              <div
                className={`w-full ${heights[i]} rounded-t-2xl flex items-start justify-center pt-2 ${
                  order[i] === 0
                    ? "bg-gradient-to-b from-yellow-400 to-amber-600"
                    : order[i] === 1
                    ? "bg-gradient-to-b from-gray-300 to-gray-500"
                    : "bg-gradient-to-b from-orange-400 to-orange-700"
                }`}
              >
                <span className="font-display font-bold text-white text-lg">
                  {entry.rank}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* rest of leaderboard */}
      <div className="space-y-2">
        {rest.map((entry, i) => (
          <motion.div
            key={entry.rank}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + i * 0.05 }}
            className={`flex items-center gap-3 p-3 rounded-2xl border ${
              entry.isYou
                ? "bg-primary/10 border-primary/50"
                : "bg-card border-border/50"
            }`}
          >
            <span className="w-6 text-center font-bold text-muted-foreground text-sm">
              {entry.rank}
            </span>
            <span className="text-2xl">{entry.avatar}</span>
            <div className="flex-1">
              <span className="text-sm font-semibold text-foreground">
                {entry.pseudonym}
                {entry.isYou && (
                  <span className="ml-1 text-xs text-primary">(You)</span>
                )}
              </span>
            </div>
            <span className="flex items-center gap-1 text-sm font-bold text-foreground">
              <Trophy className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
              {entry.score.toLocaleString()}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}