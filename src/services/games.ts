import type { StoreItem, LeaderboardEntry, GameConfig } from "@/types";
import ExampleGame from "@/games/example";

const games: GameConfig[] = [
  {
    id: "nya-bounce",
    title: "Nya Bounce",
    description: "Tap the bouncing kitty before time runs out!",
    category: "arcade",
    icon: "",
    accentColor: "#a855f7",
    gradient: "from-violet-500 to-purple-700",
    difficulty: "easy",
    component: ExampleGame,
    unlockLevel: 1,
  },
  {
    id: "fish-catch",
    title: "Fish Catch",
    description: "Help Nya catch falling fish from the sky.",
    category: "action",
    icon: "",
    accentColor: "#3b82f6",
    gradient: "from-blue-500 to-cyan-600",
    difficulty: "medium",
    unlockLevel: 2,
    component: ExampleGame,
  },
  {
    id: "yarn-tangle",
    title: "Yarn Tangle",
    description: "Untangle the yarn puzzle to free the kitten.",
    category: "puzzle",
    icon: "",
    accentColor: "#ec4899",
    gradient: "from-pink-500 to-rose-700",
    difficulty: "hard",
    unlockLevel: 3,
    component: ExampleGame,
  },
  {
    id: "nya-run",
    title: "Nya Run",
    description: "Endless rooftop chase — dodge, jump, collect!",
    category: "adventure",
    icon: "",
    accentColor: "#f59e0b",
    gradient: "from-amber-500 to-orange-700",
    difficulty: "medium",
    unlockLevel: 5,
    component: ExampleGame,
  },
];

export { games };

export const storeItems: StoreItem[] = [
  { id: "paws-100", name: "100 Paws", description: "A small pouch of paws.", icon: "", price: 99, currency: "gems", type: "currency" },
  { id: "paws-500", name: "500 Paws", description: "A hefty bag of paws.", icon: "", price: 399, currency: "gems", type: "currency" },
  { id: "energy", name: "Energy Refill", description: "Refill all your energy instantly.", icon: "", price: 50, currency: "paws", type: "consumable" },
  { id: "skin-tuxedo", name: "Tuxedo Cat Skin", description: "Look dapper in black & white.", icon: "", price: 300, currency: "paws", type: "cosmetic" },
  { id: "skin-space", name: "Space Cat Skin", description: "To infinity and beyond!", icon: "", price: 15, currency: "gems", type: "cosmetic" },
];

export const leaderboard: LeaderboardEntry[] = [
  { rank: 1, userId: "u_001", pseudonym: "WhiskerQueen", avatar: "", score: 9840, scope: "global" },
  { rank: 2, userId: "u_002", pseudonym: "Pawdric", avatar: "", score: 8720, scope: "global" },
  { rank: 3, userId: "u_003", pseudonym: "Meowington", avatar: "", score: 7650, scope: "global" },
  { rank: 4, userId: "u_004", pseudonym: "Nya Player", avatar: "", score: 5430, scope: "global", isYou: true },
  { rank: 5, userId: "u_005", pseudonym: "TabbyTornado", avatar: "", score: 4980, scope: "global" },
  { rank: 6, userId: "u_006", pseudonym: "FelixFury", avatar: "", score: 4120, scope: "global" },
  { rank: 7, userId: "u_007", pseudonym: "Purrlock", avatar: "", score: 3870, scope: "global" },
];

export function getGameById(id: string) {
  return games.find((g) => g.id === id);
}