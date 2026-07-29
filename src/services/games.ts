import type { StoreItem, LeaderboardEntry } from "@/types";
import { games } from "@/games/registry";

export { games };

export const storeItems: StoreItem[] = [
  { id: "coins-100", name: "100 Coins", description: "A small pouch of gold.", icon: "🪙", price: 99, currency: "gems", type: "currency" },
  { id: "coins-500", name: "500 Coins", description: "A hefty bag of gold.", icon: "💰", price: 399, currency: "gems", type: "currency" },
  { id: "energy", name: "Energy Refill", description: "Refill all your energy instantly.", icon: "⚡", price: 50, currency: "coins", type: "consumable" },
  { id: "skin-tuxedo", name: "Tuxedo Cat Skin", description: "Look dapper in black & white.", icon: "🐈‍⬛", price: 300, currency: "coins", type: "cosmetic" },
  { id: "skin-space", name: "Space Cat Skin", description: "To infinity and beyond!", icon: "🚀", price: 15, currency: "gems", type: "cosmetic" },
];

export const leaderboard: LeaderboardEntry[] = [
  { rank: 1, playerName: "WhiskerQueen", avatar: "👑", score: 9840 },
  { rank: 2, playerName: "Pawdric", avatar: "😺", score: 8720 },
  { rank: 3, playerName: "Meowington", avatar: "😸", score: 7650 },
  { rank: 4, playerName: "Nya Player", avatar: "🐱", score: 5430, isYou: true },
  { rank: 5, playerName: "TabbyTornado", avatar: "😻", score: 4980 },
  { rank: 6, playerName: "FelixFury", avatar: "😼", score: 4120 },
  { rank: 7, playerName: "Purrlock", avatar: "🐱", score: 3870 },
];

export function getGameById(id: string) {
  return games.find((g) => g.id === id);
}