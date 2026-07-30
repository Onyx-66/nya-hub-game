import { useMemo } from "react";
import { motion } from "framer-motion";
import { Users, ArrowUp, ArrowDown, Minus, UserPlus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useFriendsStore, type Friend } from "@/store/friendsStore";
import { useAuthStore } from "@/store/authStore";
import CatAvatar from "@/components/nya/CatAvatar";
import { getAvatar } from "@/services/leaderboardData";

interface FriendsLeaderboardProps {
  /** The game currently selected in the ranking screen */
  gameSlug: string;
}

interface RankedFriend extends Friend {
  rank: number;
  movement: "up" | "down" | "same";
}

/**
 * Builds a ranked list of friends + the current user for a given game.
 * Uses deterministic mock scores per (friend, game) combination so the
 * ranking is stable but varies across games.
 */
function scoreForFriend(friend: Friend, gameSlug: string): number {
  // Deterministic pseudo-score from the friend's base score + game seed
  const seed = gameSlug.split("").reduce((s, c) => s + c.charCodeAt(0), 0);
  const offset = (friend.avatarId * 137 + seed * 31) % 5000;
  return Math.max(0, friend.score + offset - 2500);
}

function scoreForUser(gameSlug: string): number {
  // Use the user's actual high score if available, else a mid-range value
  const gameStore = JSON.parse(localStorage.getItem("nya-hub-games") || '{"state":{}}');
  const hs = gameStore?.state?.highScores?.[gameSlug] ?? 0;
  return hs > 0 ? hs : 8200;
}

export default function FriendsLeaderboard({ gameSlug }: FriendsLeaderboardProps) {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { friends } = useFriendsStore();

  const ranked = useMemo<RankedFriend[]>(() => {
    if (!user) return [];

    const userScore = scoreForUser(gameSlug);
    const userEntry = {
      id: user.id,
      pseudonym: user.pseudonym,
      avatarId: parseInt(user.avatar) || 1,
      country: { code: user.country, flag: "🌍", name: "You" },
      score: userScore,
      isYou: true,
      addedDate: user.joinedDate,
      isOnline: true,
      rank: 0,
      movement: "same" as const,
    };

    const friendEntries = friends.map((f) => ({
      ...f,
      isYou: false,
      rank: 0,
      movement: ((f.avatarId % 3) - 1) as "up" | "down" | "same",
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

    return all as RankedFriend[];
  }, [friends, user, gameSlug]);

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
        const avatarEmoji = isYou
          ? null
          : getAvatar(entry.avatarId);

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
            <div className={`w-8 text-center shrink-0 ${entry.rank <= 3 ? "" : ""}`}>
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

            {/* Movement indicator */}
            {!isYou && (
              <div className="shrink-0">
                {entry.movement === "up" ? (
                  <ArrowUp className="w-3.5 h-3.5 text-emerald-400" />
                ) : entry.movement === "down" ? (
                  <ArrowDown className="w-3.5 h-3.5 text-red-400" />
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
    </div>
  );
}