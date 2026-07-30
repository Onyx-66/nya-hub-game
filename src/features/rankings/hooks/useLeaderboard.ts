import { useState, useEffect, useRef, useCallback } from "react";
import { useAuthStore } from "@/store/authStore";
import {
  generateLeaderboard,
  getCountry,
  type RankEntry,
  type RankedResult,
} from "@/services/leaderboardData";

export type LeaderboardScope = "global" | "national" | "friends";

const REFRESH_INTERVAL = 60; // seconds

interface CacheEntry {
  data: RankedResult;
  ts: number;
}

const CACHE_TTL = 30_000; // 30 seconds

/**
 * Builds the ranked leaderboard for a game + scope.
 * Scores are perturbed by `tick` to simulate live rank changes.
 */
function buildRanked(
  gameSlug: string,
  scope: LeaderboardScope,
  user: ReturnType<typeof useAuthStore.getState>["user"],
  tick: number,
): RankedResult {
  if (scope === "friends") {
    return { entries: [], currentUserRank: null };
  }

  const userCountryCode = user?.country || "TN";
  const userCountry =
    getCountry(userCountryCode) ?? getCountry("TN")!;

  const base = generateLeaderboard(gameSlug).map((e) => ({ ...e }));

  // Perturb scores based on tick so ranks shift between refreshes
  const perturbed = base.map((e, i) => {
    const seed = e.id.charCodeAt(0) + tick * 37 + i * 13;
    const offset = (seed % 4000) - 2000;
    return { ...e, score: Math.max(100, e.score + offset) };
  });

  const userEntry: RankEntry = {
    id: user?.id ?? "current_user",
    pseudonym: user?.pseudonym ?? "You",
    avatarId: 7,
    country: userCountry,
    score: 8200 + (tick % 5) * 250,
    isYou: true,
  };

  let pool = [...perturbed, userEntry];
  if (scope === "national") {
    pool = pool.filter((e) => e.country.code === userCountry.code);
  }

  pool.sort((a, b) => b.score - a.score);

  let currentUserRank: number | null = null;
  const entries: RankEntry[] = pool.map((entry) => ({ ...entry }));
  for (let i = 0; i < entries.length; i++) {
    if (i > 0 && entries[i].score === entries[i - 1].score) {
      entries[i].rank = entries[i - 1].rank;
    } else {
      entries[i].rank = i + 1;
    }
    if (entries[i].isYou) currentUserRank = entries[i].rank ?? null;
  }

  void gameSlug;
  return { entries, currentUserRank };
}

interface UseLeaderboardReturn {
  entries: RankEntry[];
  currentUserRank: number | null;
  isLoading: boolean;
  isRefreshing: boolean;
  refresh: () => void;
  rankChanges: Record<string, number>;
  nextRefreshIn: number;
}

export function useLeaderboard(
  gameSlug: string,
  scope: LeaderboardScope,
): UseLeaderboardReturn {
  const user = useAuthStore((s) => s.user);
  const [entries, setEntries] = useState<RankEntry[]>([]);
  const [currentUserRank, setCurrentUserRank] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [rankChanges, setRankChanges] = useState<Record<string, number>>({});
  const [nextRefreshIn, setNextRefreshIn] = useState(REFRESH_INTERVAL);
  const prevRanksRef = useRef<Map<string, number>>(new Map());
  const tickRef = useRef(0);

  const buildAndSet = useCallback(
    (currentTick: number) => {
      if (scope === "friends") {
        setEntries([]);
        setCurrentUserRank(null);
        setIsLoading(false);
        setIsRefreshing(false);
        return;
      }

      const data = buildRanked(gameSlug, scope, user, currentTick);

      // Compute rank changes from previous snapshot
      const changes: Record<string, number> = {};
      const newRanks = new Map<string, number>();
      for (const entry of data.entries) {
        if (entry.rank !== undefined) {
          const prevRank = prevRanksRef.current.get(entry.id);
          if (prevRank !== undefined) {
            const delta = prevRank - entry.rank;
            if (delta !== 0) changes[entry.id] = delta;
          }
          newRanks.set(entry.id, entry.rank);
        }
      }
      prevRanksRef.current = newRanks;

      setEntries(data.entries);
      setCurrentUserRank(data.currentUserRank);
      setRankChanges(changes);
      setIsLoading(false);
      setIsRefreshing(false);
    },
    [gameSlug, scope, user],
  );

  // Initial fetch + reset on game/scope change
  useEffect(() => {
    prevRanksRef.current = new Map();
    setRankChanges({});
    tickRef.current = 0;
    setNextRefreshIn(REFRESH_INTERVAL);
    setIsLoading(true);

    const timer = setTimeout(() => {
      buildAndSet(0);
    }, 300);
    return () => clearTimeout(timer);
  }, [buildAndSet]);

  const refresh = useCallback(() => {
    if (scope === "friends") return;
    setIsRefreshing(true);
    tickRef.current += 1;
    setNextRefreshIn(REFRESH_INTERVAL);
    setTimeout(() => {
      buildAndSet(tickRef.current);
    }, 150);
  }, [buildAndSet, scope]);

  // 60s auto-refresh
  useEffect(() => {
    if (scope === "friends") return;
    const interval = setInterval(refresh, REFRESH_INTERVAL * 1000);
    return () => clearInterval(interval);
  }, [refresh, scope]);

  // Countdown timer (1s tick)
  useEffect(() => {
    if (scope === "friends") return;
    const timer = setInterval(() => {
      setNextRefreshIn((prev) => (prev > 1 ? prev - 1 : REFRESH_INTERVAL));
    }, 1000);
    return () => clearInterval(timer);
  }, [scope]);

  return {
    entries,
    currentUserRank,
    isLoading,
    isRefreshing,
    refresh,
    rankChanges,
    nextRefreshIn,
  };
}