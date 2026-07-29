import { create } from "zustand";
import { persist } from "zustand/middleware";

interface GameState {
  currentGameId: string | null;
  highScores: Record<string, number>;
  gamesPlayed: number;
  setCurrentGame: (gameId: string | null) => void;
  recordScore: (gameId: string, score: number) => void;
}

export const useGameStore = create<GameState>()(
  persist(
    (set) => ({
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
    }),
    { name: "nya-hub-games" }
  )
);