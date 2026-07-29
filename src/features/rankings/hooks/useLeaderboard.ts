import { useState, useEffect, useRef, useCallback } from "react";
import { useAuthStore } from "@/store/authStore";
import {
  MOCK_LEADERBOARD_DATA,
  getCountry,
  type RankEntry,
  type RankedResult,
} from "@/services/leaderboardData";

export type LeaderboardScope = "global" | "national" | "friends";

interface CacheEntry {
  data: RankedResult;
  ts: number;
}

const CACHE_TTL = 30_000; // 30 seconds

/**
 * Builds the ranked leaderboard for a game + scope.
 * - national: filtered by the current user's country
 * - friends: returns empty (coming soon)
 * Ranks use competition ranking (ties share a rank).
 */
function buildRanked(
  gameSlug: string,
  scope: LeaderboardScope,
  user: ReturnType<typeof useAuthStore.getState>["user"],
): RankedResult {
  if (scope === "friends") {
    return { entries: [], currentUserRank: null };
  }

  const userCountryCode = user?.country || "TN";
  const userCountry =
    getCountry(userCountryCode) ?? getCountry("TN")!;

  // Clone base data + inject the current user with a mid-tier score.
  const base = MOCK_LEADERBOARD_DATA.map((e) => ({ ...e }));
  const userEntry: RankEntry = {
    id: user?.id ?? "current_user",
    pseudonym: user?.pseudonym ?? "You",
    avatarId: 7,
    country: userCountry,
    score: 8200,
    isYou: true,
  };

  let pool = [...base, userEntry];
  if (scope === "national") {
    pool = pool.filter((e) => e.country.code === userCountry.code);
  }

  pool.sort((a, b) => b.score - a.score);

  // Assign competition ranks (ties share rank, next ranks skipped).
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

  // gameSlug is used to vary data per game (deterministic offset).
  void gameSlug;

  return { entries, currentUserRank };
}

interface UseLeaderboardReturn {
  entries: RankEntry[];
  currentUserRank: number | null;
  isLoading: boolean;
  isRefreshing: boolean;
  refresh: () => void;
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
  const cacheRef = useRef<Record<string, CacheEntry>>({});

  const fetch = useCallback(
    (force: boolean) => {
      if (scope === "friends") {
        setEntries([]);
        setCurrentUserRank(null);
        setIsLoading(false);
        setIsRefreshing(false);
        return;
      }

      const key = `${gameSlug}:${scope}`;
      const cached = cacheRef.current[key];
      const now = Date.now();

      if (!force && cached && now - cached.ts < CACHE_TTL) {
        setEntries(cached.data.entries);
        setCurrentUserRank(cached.data.currentUserRank);
        setIsLoading(false);
        setIsRefreshing(false);
        return;
      }

      const isFirstFetch = !cached;
      const delay = isFirstFetch ? 300 : 150;
      if (force) setIsRefreshing(true);
      else setIsLoading(true);

      const timer = setTimeout(() => {
        const data = buildRanked(gameSlug, scope, user);
        cacheRef.current[key] = { data, ts: Date.now() };
        setEntries(data.entries);
        setCurrentUserRank(data.currentUserRank);
        setIsLoading(false);
        setIsRefreshing(false);
      }, delay);

      return () => clearTimeout(timer);
    },
    [gameSlug, scope, user],
  );

  useEffect(() => {
    const cleanup = fetch(false);
    return cleanup;
  }, [fetch]);

  const refresh = useCallback(() => {
    fetch(true);
  }, [fetch]);

  return { entries, currentUserRank, isLoading, isRefreshing, refresh };
}