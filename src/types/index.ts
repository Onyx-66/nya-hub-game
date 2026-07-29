import type { ComponentType } from "react";

export type GameCategory = "arcade" | "puzzle" | "action" | "adventure";
export type GameDifficulty = "easy" | "medium" | "hard";

export interface GameConfig {
  id: string;
  title: string;
  description: string;
  category: GameCategory;
  icon: string;
  accentColor: string;
  gradient: string;
  difficulty: GameDifficulty;
  component: ComponentType;
  unlockLevel: number;
}

export interface Player {
  id: string;
  name: string;
  avatar: string;
  level: number;
  xp: number;
  coins: number;
  gems: number;
}

export interface StoreItem {
  id: string;
  name: string;
  description: string;
  icon: string;
  price: number;
  currency: "coins" | "gems";
  type: "consumable" | "cosmetic" | "currency";
}

export interface LeaderboardEntry {
  rank: number;
  playerName: string;
  avatar: string;
  score: number;
  isYou?: boolean;
}