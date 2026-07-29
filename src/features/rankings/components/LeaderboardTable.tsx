import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Loader2 } from "lucide-react";
import { getAvatar, type RankEntry } from "@/services/leaderboardData";

interface LeaderboardTableProps {
  entries: RankEntry[]; // already ranked, top 3 excluded by parent
  currentUserRank: number | null;
  isLoading: boolean;
  isRefreshing: boolean;
}

export default function LeaderboardTable({
  entries,
  currentUserRank,
  isLoading,
  isRefreshing,
}: LeaderboardTableProps) {
  // Positions 4+ (podium handled separately).
  const list = entries.filter((e) => (e.rank ?? 0) >= 4);
  const userInList = list.some((e) => e.isYou);
  const userEntry = entries.find((e) => e.isYou);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-10 text-muted-foreground">
        <Loader2 className="w-5 h-5 animate-spin mr-2" />
        Loading ranks...
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* pull-to-refresh indicator */}
      <AnimatePresence>
        {isRefreshing && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 28 }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center justify-center text-muted-foreground text-xs"
          >
            <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
            Refreshing...
          </motion.div>
        )}
      </AnimatePresence>

      {/* sticky header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md flex items-center gap-3 px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground border-b border-border/50">
        <span className="w-8 text-center">Rank</span>
        <span className="flex-1">Player</span>
        <span className="text-right">Score</span>
      </div>

      <div className="space-y-1.5 max-h-[44vh] overflow-y-auto pr-1 -mr-1">
        {list.map((entry, i) => {
          const rank = entry.rank ?? i + 4;
          return (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: Math.min(i * 0.02, 0.5) }}
              className={`flex items-center gap-3 p-2.5 rounded-2xl border ${
                entry.isYou
                  ? "bg-primary/10 border-primary/40 border-l-4 border-l-primary"
                  : "bg-card border-border/40"
              }`}
            >
              <span className="w-8 text-center font-bold text-muted-foreground text-sm shrink-0">
                #{rank}
              </span>
              <span className="w-8 h-8 rounded-full bg-muted/60 flex items-center justify-center text-base shrink-0">
                {getAvatar(entry.avatarId)}
              </span>
              <div className="flex-1 min-w-0">
                <span className="text-sm font-semibold text-foreground block truncate">
                  {entry.pseudonym}
                  {entry.isYou && (
                    <span className="ml-1 text-[10px] text-primary font-bold">
                      (You)
                    </span>
                  )}
                </span>
                <span className="text-[10px] text-muted-foreground">
                  {entry.country.flag} {entry.country.name}
                </span>
              </div>
              <span className="flex items-center gap-1 text-sm font-bold text-foreground shrink-0">
                <Trophy className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                {entry.score.toLocaleString()}
              </span>
            </motion.div>
          );
        })}

        {/* Current user pinned at bottom if outside the visible list */}
        {!userInList && userEntry && (userEntry.rank ?? 0) > 100 && (
          <>
            <div className="flex items-center gap-2 py-2">
              <div className="flex-1 h-px bg-border/60" />
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                Your Position
              </span>
              <div className="flex-1 h-px bg-border/60" />
            </div>
            <motion.div
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3 p-2.5 rounded-2xl border bg-primary/10 border-primary/40 border-l-4 border-l-primary"
            >
              <span className="w-8 text-center font-bold text-primary text-sm shrink-0">
                #{userEntry.rank}
              </span>
              <span className="w-8 h-8 rounded-full bg-muted/60 flex items-center justify-center text-base shrink-0">
                {getAvatar(userEntry.avatarId)}
              </span>
              <div className="flex-1 min-w-0">
                <span className="text-sm font-semibold text-foreground block truncate">
                  {userEntry.pseudonym}
                  <span className="ml-1 text-[10px] text-primary font-bold">
                    (You)
                  </span>
                </span>
                <span className="text-[10px] text-muted-foreground">
                  {userEntry.country.flag} {userEntry.country.name}
                </span>
              </div>
              <span className="flex items-center gap-1 text-sm font-bold text-foreground shrink-0">
                <Trophy className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                {userEntry.score.toLocaleString()}
              </span>
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
}