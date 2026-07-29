import { games as allGames } from "@/services/games";
import { usePlayerStore } from "@/store/usePlayerStore";
import { useGameStore } from "@/store/useGameStore";
import type { GameConfig } from "@/types";

export function useGames() {
  const playerLevel = usePlayerStore((s) => s.level);
  const highScores = useGameStore((s) => s.highScores);

  const gamesWithMeta: (GameConfig & { highScore: number; locked: boolean })[] =
    allGames.map((g) => ({
      ...g,
      highScore: highScores[g.id] ?? 0,
      locked: playerLevel < g.unlockLevel,
    }));

  return { games: gamesWithMeta };
}