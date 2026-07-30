import { useCallback } from "react";
import { useEconomyStore } from "@/store/economyStore";
import { useGameStore } from "@/store/useGameStore";
import { useAuthStore } from "@/store/authStore";
import { audioService } from "@/services/audioService";
import { useAchievementStore } from "@/store/achievementStore";
import { useChallengeStore } from "@/store/challengeStore";
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
    audioService.playSFX("game-start");
  }, [gameSlug, startSession]);

  const onGameEnd = useCallback(
    (score: number, level: number, stars: number) => {
      // Calculate paws earned: 1 per divisor points, clamped [1, max].
      const pawsEarned = Math.max(1, Math.min(PAWS_PER_GAME_MAX, Math.floor(score / PAWS_PER_SCORE_DIVISOR)));
      addPaws(pawsEarned, `${gameSlug} game reward`);
      audioService.playSFX("paw-earn");

      // High score bonus (only when beating a non-zero previous best).
      const previousBest = getHighScore(gameSlug);
      if (score > previousBest && previousBest > 0) {
        addPaws(HIGH_SCORE_BONUS_PAWS, "New high score bonus");
        addGems(HIGH_SCORE_BONUS_GEMS);
        audioService.playSFX("gem-earn");
      }

      // End session in game store (records high score + gamesPlayed).
      endSession(gameSlug, score, level, stars);

      // Track achievement progress
      const ach = useAchievementStore.getState();
      ach.addProgress("gamesPlayed", 1);
      ach.addProgress("totalScore", score);
      ach.addProgress("totalStars", stars);
      ach.setProgress(`highScore:${gameSlug}`, score);
      ach.addProgress(`plays:${gameSlug}`, 1);
      ach.setProgress(`stars:${gameSlug}`, stars);
      ach.setProgress("anyHighScore", score);
      // Star milestones (first time achieving each tier)
      if (stars >= 1) ach.setProgress("first1Star", 1);
      if (stars >= 2) ach.setProgress("first2Star", 1);
      if (stars >= 3) {
        ach.setProgress("first3Star", 1);
        ach.addProgress("count3Star", 1);
      }
      // Unique games played
      const uniqueCount = Object.keys(ach.progress)
        .filter((k) => k.startsWith("plays:") && ach.progress[k] > 0)
        .length;
      ach.setProgress("uniqueGames", uniqueCount);

      // Track daily challenge progress (same metrics)
      const ch = useChallengeStore.getState();
      ch.addProgress("gamesPlayed", 1);
      ch.addProgress("totalScore", score);
      ch.addProgress("totalStars", stars);
      ch.addProgress("pawsEarned", pawsEarned);
      ch.addProgress(`plays:${gameSlug}`, 1);
      ch.setProgress("anyHighScore", score);

      // Sync gamesPlayed + high score into the auth profile (cross-store).
      const currentUser = useAuthStore.getState().user;
      if (currentUser) {
        const prevStats = currentUser.gameStats ?? { gamesPlayed: 0, highScores: {}, totalPlayTime: 0, achievements: [] };
        updateProfile({
          gameStats: {
            ...prevStats,
            gamesPlayed: (prevStats.gamesPlayed ?? 0) + 1,
            highScores: {
              ...(prevStats.highScores ?? {}),
              [gameSlug]: Math.max(prevStats.highScores?.[gameSlug] ?? 0, score),
            },
          },
        });
      }
      // Track global play count per game for Hot/Trend badges
      useGameStore.getState().addPlay(gameSlug);
    },
    [gameSlug, addPaws, addGems, getHighScore, endSession, updateProfile],
  );

  return {
    onGameStart,
    onGameEnd,
    highScore,
  };
}