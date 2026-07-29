import { create } from "zustand";
import { persist } from "zustand/middleware";

interface GameState {
  currentGameId: string | null;
  highScores: Record<string, number>;
  gamesPlayed: number;
  setCurrentGame: (gameId: string | null) => void;
  recordScore: (gameId: string, score: number) => void;
  startGameSession: (slug: string) => void;
  endGameSession: (slug: string, score: number, level: number, stars: number) => void;
  getHighScore: (slug: string) => number;
  clearGameData: () => void;
}

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      currentGameId: null,
      highScores: {},
      gamesPlayed: 0,

      setCurrentGame: (gameId) => set({ currentGameId: gameId }),

      recordScore: (gameId, score) =>
        set((s) => ({
          highScores: {
            ...s.highScores,
            [gameId]: Math.max(s.highScores[gameId] ?? 0, score),
          },
          gamesPlayed: s.gamesPlayed + 1,
        })),

      startGameSession: (slug) => set({ currentGameId: slug }),

      endGameSession: (slug, score) =>
        set((s) => ({
          currentGameId: null,
          highScores: {
            ...s.highScores,
            [slug]: Math.max(s.highScores[slug] ?? 0, score),
          },
          gamesPlayed: s.gamesPlayed + 1,
        })),

      getHighScore: (slug) => get().highScores[slug] ?? 0,

      clearGameData: () =>
        set({ currentGameId: null, highScores: {}, gamesPlayed: 0 }),
    }),
    { name: "nya-hub-games" }
  )
);