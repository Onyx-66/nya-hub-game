import { useState, useEffect, useRef, useMemo } from "react";
import { motion } from "framer-motion";
import { Users, ArrowUp, ArrowDown, Minus, UserPlus, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useFriendsStore, type Friend } from "@/store/friendsStore";
import { useAuthStore } from "@/store/authStore";
import CatAvatar from "@/components/nya/CatAvatar";
import { getAvatar } from "@/services/leaderboardData";

interface FriendsLeaderboardProps {
  gameSlug: string;
}

interface RankedFriend extends Friend {
  rank: number;
  movement: "up" | "down" | "same";
  changeAmount: number;
}

const REFRESH_INTERVAL = 60;

function scoreForFriend(friend: Friend, gameSlug: string, tick: number): number {
  const seed = gameSlug.split("").reduce((s, c) => s + c.charCodeAt(0), 0);
  const offset = (friend.avatarId * 137 + seed * 31) % 5000;
  const perturbation = ((friend.avatarId + tick * 37) % 3000) - 1500;
  return Math.max(0, friend.score + offset - 2500 + perturbation);
}

function scoreForUser(gameSlug: string, tick: number): number {
  const gameStore = JSON.parse(localStorage.getItem("nya-hub-games") || '{"state":{}}');
  const hs = gameStore?.state?.highScores?.[gameSlug] ?? 0;
  return Math.max(0, (hs > 0 ? hs : 8200) + (tick % 5) * 200);
}

export default function FriendsLeaderboard({ gameSlug }: FriendsLeaderboardProps) {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { friends } = useFriendsStore();
  const [tick, setTick] = useState(0);
  const [nextRefreshIn, setNextRefreshIn] = useState(REFRESH_INTERVAL);
  const prevRanksRef = useRef<Map<string, number>>(new Map());

  // Reset on game change
  useEffect(() => {
    prevRanksRef.current = new Map();
    setTick(0);
    setNextRefreshIn(REFRESH_INTERVAL);
  }, [gameSlug]);

  // 60s auto-refresh
  useEffect(() => {
    const interval = setInterval(() => {
      setTick((t) => t + 1);
      setNextRefreshIn(REFRESH_INTERVAL);
    }, REFRESH_INTERVAL * 1000);
    return () => clearInterval(interval);
  }, []);

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setNextRefreshIn((prev) => (prev > 1 ? prev - 1 : REFRESH_INTERVAL));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const ranked = useMemo<RankedFriend[]>(() => {
    if (!user) return [];

    const userScore = scoreForUser(gameSlug, tick);
    const userEntry = {
      id: user.id,
      pseudonym: user.pseudonym,
      avatarId: parseInt(user.avatar) || 1,
      country: { code: user.country ?? "TN", flag: "🌍", name: "You" },
      score: userScore,
      isYou: true,
      addedDate: user.joinedDate,
      isOnline: true,
      rank: 0,
      movement: "same" as const,
      changeAmount: 0,
    };

    const friendEntries = friends.map((f) => ({
      ...f,
      isYou: false,
      score: scoreForFriend(f, gameSlug, tick),
      rank: 0,
      movement: "same" as const,
      changeAmount: 0,
    }));

    const all = [userEntry, ...friendEntries];
    all.sort((a, b) => b.score - a.score);

    // Assign competition ranks
    for (let i = 0; i < all.length; i++) {
      if (i > 0 && all[i].score === all[i - 1].score) {
        all[i].rank = all[i - 1].rank;
      } else {
        all[i].rank = i + 1;
      }
    }

    // Compute movement from previous snapshot
    const newRanks = new Map<string, number>();
    for (const entry of all) {
      const prevRank = prevRanksRef.current.get(entry.id);
      if (prevRank !== undefined) {
        const delta = prevRank - entry.rank;
        if (delta > 0) {
          entry.movement = "up";
          entry.changeAmount = delta;
        } else if (delta < 0) {
          entry.movement = "down";
          entry.changeAmount = Math.abs(delta);
        }
      }
      newRanks.set(entry.id, entry.rank);
    }
    prevRanksRef.current = newRanks;

    return all as RankedFriend[];
  }, [friends, user, gameSlug, tick]);

  if (!user) return null;

  // Empty state
  if (friends.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center py-16 text-center"
      >
        <div className="w-16 h-16 rounded-3xl bg-muted flex items-center justify-center mb-4">
          <Users className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="font-heading font-bold text-lg text-foreground">
          No friends yet
        </h3>
        <p className="text-sm text-muted-foreground mt-1 max-w-xs">
          Add friends to see who's the top cat on the leaderboard!
        </p>
        <button
          onClick={() => navigate("/friends")}
          className="mt-4 flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-pink-400 to-violet-400 text-white font-heading font-semibold text-sm active:scale-95 transition-transform"
        >
          <UserPlus className="w-4 h-4" /> Add Friends
        </button>
      </motion.div>
    );
  }

  return (
    <div className="space-y-2">
      {ranked.map((entry, i) => {
        const isYou = entry.isYou;
        const avatarEmoji = isYou ? null : getAvatar(entry.avatarId);

        return (
          <motion.div
            key={entry.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05, duration: 0.25 }}
            className={`flex items-center gap-3 rounded-2xl p-3 transition-colors ${
              isYou
                ? "bg-primary/15 border border-primary/40"
                : "bg-card border border-border/50"
            }`}
          >
            {/* Rank number */}
            <div className="w-8 text-center shrink-0">
              <span
                className={`font-heading font-bold text-lg ${
                  entry.rank === 1
                    ? "text-gold"
                    : entry.rank === 2
                      ? "text-muted-foreground"
                      : entry.rank === 3
                        ? "text-orange-400"
                        : "text-muted-foreground"
                }`}
              >
                {entry.rank}
              </span>
            </div>

            {/* Avatar */}
            <div className="shrink-0">
              {isYou && user?.customAvatarUrl ? (
                <img
                  src={user.customAvatarUrl}
                  alt={entry.pseudonym}
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-primary/40"
                />
              ) : isYou ? (
                <CatAvatar avatarId={parseInt(user.avatar) || 1} size={40} />
              ) : (
                <span className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-xl">
                  {avatarEmoji}
                </span>
              )}
            </div>

            {/* Name + mutual games */}
            <div className="flex-1 min-w-0">
              <p className={`font-heading font-semibold text-sm truncate ${isYou ? "text-primary" : "text-foreground"}`}>
                {entry.pseudonym} {isYou && "(You)"}
              </p>
              {!isYou && (
                <p className="text-[10px] text-muted-foreground">
                  {entry.country?.flag ?? "🌍"} {entry.country?.name ?? "Worldwide"}
                </p>
              )}
            </div>

            {/* Movement indicator with amount */}
            {!isYou && (
              <div className="shrink-0">
                {entry.movement === "up" ? (
                  <span className="flex items-center gap-0.5 text-[10px] font-bold text-emerald-400 bg-emerald-500/15 px-1.5 py-0.5 rounded-full">
                    <ArrowUp className="w-2.5 h-2.5" />
                    {entry.changeAmount}
                  </span>
                ) : entry.movement === "down" ? (
                  <span className="flex items-center gap-0.5 text-[10px] font-bold text-red-400 bg-red-500/15 px-1.5 py-0.5 rounded-full">
                    <ArrowDown className="w-2.5 h-2.5" />
                    {entry.changeAmount}
                  </span>
                ) : (
                  <Minus className="w-3.5 h-3.5 text-muted-foreground/50" />
                )}
              </div>
            )}

            {/* Score */}
            <div className="shrink-0 text-right">
              <p className="font-heading font-bold text-sm text-foreground tabular-nums">
                {entry.score.toLocaleString()}
              </p>
            </div>
          </motion.div>
        );
      })}

      {/* Auto-refresh indicator */}
      <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground py-2">
        <RefreshCw className="w-3 h-3" />
        Live · updates in {nextRefreshIn}s
      </div>
    </div>
  );
}