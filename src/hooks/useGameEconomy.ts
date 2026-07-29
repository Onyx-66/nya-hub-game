import { useCallback, useRef } from "react";
import { useEconomyStore } from "@/store/economyStore";

/**
 * Integrates a game session with the global economy.
 * Awards Paws based on points scored (1 Paw per 5 points).
 */
export function useGameEconomy(gameName: string) {
  const addPaws = useEconomyStore((s) => s.addPaws);
  const pendingPaws = useRef(0);

  /**
   * Called when the player scores points in-game.
   * Accumulates points and awards 1 Paw for every 5 points.
   */
  const awardPoints = useCallback(
    (points: number) => {
      pendingPaws.current += points;
      while (pendingPaws.current >= 5) {
        pendingPaws.current -= 5;
        addPaws(1, gameName);
      }
    },
    [addPaws, gameName]
  );

  /**
   * Called when a game starts. Checks for an active powerup.
   * (Powerup system will be built later — logs for now.)
   */
  const checkPowerup = useCallback(() => {
    // TODO: implement powerup detection once the powerup system exists
    console.log(`[${gameName}] Checking for active powerup… (not implemented)`);
  }, [gameName]);

  return { awardPoints, checkPowerup };
}