import { motion, AnimatePresence } from "framer-motion";
import {
  Trophy,
  Loader2,
  ArrowUp,
  ArrowDown,
  Minus,
} from "lucide-react";
import { type RankEntry } from "@/services/leaderboardData";
import CatAvatar from "@/components/nya/CatAvatar";

interface LeaderboardTableProps {
  entries: RankEntry[]; // already ranked, top 3 excluded by parent
  currentUserRank: number | null;
  isLoading: boolean;
  isRefreshing: boolean;
  rankChanges: Record<string, number>;
}

function RankChangeBadge({ change }: { change: number | undefined }) {
  if (change === undefined || change === 0) {
    return <Minus className="w-3 h-3 text-muted-foreground/30" />;
  }
  const isUp = change > 0;
  return (
    <span
      className={`flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
        isUp
          ? "bg-emerald-500/15 text-emerald-400"
          : "bg-red-500/15 text-red-400"
      }`}
    >
      {isUp ? (
        <ArrowUp className="w-2.5 h-2.5" />
      ) : (
        <ArrowDown className="w-2.5 h-2.5" />
      )}
      {Math.abs(change)}
    </span>
  );
}

export default function LeaderboardTable({
  entries,
  currentUserRank,
  isLoading,
  isRefreshing,
  rankChanges,
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

  const renderRow = (entry: RankEntry, i: number, rank: number) => (
    <motion.div
      key={entry.id}
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: Math.min(i * 0.02, 0.5) }}
      className={`flex items-center gap-2 p-2.5 rounded-2xl border ${
        entry.isYou
          ? "bg-primary/10 border-primary/40 border-l-4 border-l-primary"
          : "bg-card border-border/40"
      }`}
    >
      <span className="w-7 text-center font-bold text-muted-foreground text-sm shrink-0">
        #{rank}
      </span>
      <span className="w-9 flex justify-center shrink-0">
        <RankChangeBadge change={rankChanges[entry.id]} />
      </span>
      <span className="shrink-0">
        <CatAvatar avatarId={entry.avatarId} size={32} />
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
          <span className="text-[9px] font-bold bg-muted px-1.5 py-0.5 rounded text-muted-foreground mr-1">
            {entry.country.code}
          </span>
          {entry.country.name}
        </span>
      </div>
      <span className="flex items-center gap-1 text-sm font-bold text-foreground shrink-0">
        <Trophy className="w-3 h-3 text-yellow-400 fill-yellow-400" />
        {entry.score.toLocaleString()}
      </span>
    </motion.div>
  );

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
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md flex items-center gap-2 px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground border-b border-border/50">
        <span className="w-7 text-center">Rank</span>
        <span className="w-9 text-center">Trend</span>
        <span className="flex-1">Player</span>
        <span className="text-right">Score</span>
      </div>

      <div className="space-y-1.5 max-h-[44vh] overflow-y-auto pr-1 -mr-1">
        {list.map((entry, i) => {
          const rank = entry.rank ?? i + 4;
          return renderRow(entry, i, rank);
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
            {renderRow(userEntry, 0, userEntry.rank ?? 0)}
          </>
        )}
      </div>
    </div>
  );
}