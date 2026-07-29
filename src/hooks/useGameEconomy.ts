import { useCallback } from "react";
import { useEconomyStore } from "@/store/economyStore";
import { useGameStore } from "@/store/useGameStore";
import { useAuthStore } from "@/store/authStore";
import {
  PAWS_PER_GAME_MAX,
  PAWS_PER_SCORE_DIVISOR,
  HIGH_SCORE_BONUS_PAWS,
  HIGH_SCORE_BONUS_GEMS,
} from "@/utils/constants";

/**
 * Maps a game score to a 0–3 star rating based on performance thresholds.
 */
export function scoreToStars(score: number): number {
  if (score >= 150) return 3;
  if (score >= 50) return 2;
  if (score > 0) return 1;
  return 0;
}

/**
 * Economy + session integration for any game.
 * Wires game start/end into the global economy and game stores.
 */
export function useGameEconomy(gameSlug: string) {
  const addPaws = useEconomyStore((s) => s.addPaws);
  const addGems = useEconomyStore((s) => s.addGems);
  const startSession = useGameStore((s) => s.startGameSession);
  const endSession = useGameStore((s) => s.endGameSession);
  const getHighScore = useGameStore((s) => s.getHighScore);
  const highScore = useGameStore((s) => s.highScores[gameSlug] ?? 0);
  const updateProfile = useAuthStore((s) => s.updateProfile);

  const onGameStart = useCallback(() => {
    startSession(gameSlug);
  }, [gameSlug, startSession]);

  const onGameEnd = useCallback(
    (score: number, level: number, stars: number) => {
      // Calculate paws earned: 1 per divisor points, clamped [1, max].
      const pawsEarned = Math.max(1, Math.min(PAWS_PER_GAME_MAX, Math.floor(score / PAWS_PER_SCORE_DIVISOR)));
      addPaws(pawsEarned, `${gameSlug} game reward`);

      // High score bonus (only when beating a non-zero previous best).
      const previousBest = getHighScore(gameSlug);
      if (score > previousBest && previousBest > 0) {
        addPaws(HIGH_SCORE_BONUS_PAWS, "New high score bonus");
        addGems(HIGH_SCORE_BONUS_GEMS);
      }

      // End session in game store (records high score + gamesPlayed).
      endSession(gameSlug, score, level, stars);

      // Sync gamesPlayed + high score into the auth profile (cross-store).
      const currentUser = useAuthStore.getState().user;
      if (currentUser) {
        const prevStats = currentUser.gameStats;
        updateProfile({
          gameStats: {
            ...prevStats,
            gamesPlayed: (prevStats.gamesPlayed ?? 0) + 1,
            highScores: {
              ...prevStats.highScores,
              [gameSlug]: Math.max(prevStats.highScores[gameSlug] ?? 0, score),
            },
          },
        });
      }
    },
    [gameSlug, addPaws, addGems, getHighScore, endSession, updateProfile],
  );

  return {
    onGameStart,
    onGameEnd,
    highScore,
  };
}