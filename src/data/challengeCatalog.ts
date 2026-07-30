import type { ComponentType } from "react";

// =============================================
// Types
// =============================================

export type ChallengeCategory =
  | "score"
  | "plays"
  | "stars"
  | "economy"
  | "social"
  | "collection"
  | "misc";

export type ChallengeDifficulty = "easy" | "medium" | "hard";

export type ChallengeTrackMode = "add" | "set";

export interface ChallengeTemplate {
  id: string;
  title: string;
  description: string;
  category: ChallengeCategory;
  difficulty: ChallengeDifficulty;
  /** Metric key — same namespace as achievement metrics. */
  metric: string;
  /** Target value to complete the challenge. */
  target: number;
  /** "add" = cumulative (sum increments), "set" = max-value (highest seen). */
  trackMode: ChallengeTrackMode;
  xpReward: number;
  pawsReward: number;
  gemsReward?: number;
  /** Lucide icon name from ICON_MAP. */
  icon: string;
  /** Tailwind text-color class for the icon. */
  color: string;
}

export interface DailyChallenge {
  templateId: string;
  progress: number;
  completed: boolean;
  claimed: boolean;
}

// =============================================
// Helpers
// =============================================

let _idCounter = 0;
function t(
  title: string,
  description: string,
  category: ChallengeCategory,
  difficulty: ChallengeDifficulty,
  metric: string,
  target: number,
  trackMode: ChallengeTrackMode,
  xpReward: number,
  pawsReward: number,
  gemsReward: number | undefined,
  icon: string,
  color: string,
): ChallengeTemplate {
  return {
    id: `ch_${++_idCounter}`,
    title,
    description,
    category,
    difficulty,
    metric,
    target,
    trackMode,
    xpReward,
    pawsReward,
    gemsReward,
    icon,
    color,
  };
}

// =============================================
// Challenge Templates (~30)
// =============================================

export const CHALLENGE_TEMPLATES: ChallengeTemplate[] = [
  // ── Easy Score ──
  t("Score 50", "Earn 50 points in any game", "score", "easy", "totalScore", 50, "add", 10, 20, undefined, "Target", "text-cyan-400"),
  t("Score 100", "Earn 100 points in any game", "score", "easy", "totalScore", 100, "add", 15, 30, undefined, "Target", "text-cyan-400"),
  t("Score 200", "Earn 200 points in any game", "score", "easy", "totalScore", 200, "add", 20, 40, undefined, "Target", "text-cyan-400"),
  t("High Scorer", "Score 150+ in a single game", "score", "easy", "anyHighScore", 150, "set", 15, 30, undefined, "TrendingUp", "text-green-400"),
  t("Big Score", "Score 300+ in a single game", "score", "easy", "anyHighScore", 300, "set", 20, 40, 1, "TrendingUp", "text-green-400"),

  // ── Medium Score ──
  t("Score 500", "Earn 500 points in any game", "score", "medium", "totalScore", 500, "add", 30, 60, 1, "Target", "text-cyan-400"),
  t("Score 1000", "Earn 1,000 points in any game", "score", "medium", "totalScore", 1000, "add", 40, 80, 1, "Target", "text-cyan-400"),
  t("Mega Score", "Score 500+ in a single game", "score", "medium", "anyHighScore", 500, "set", 30, 60, 1, "TrendingUp", "text-green-400"),

  // ── Hard Score ──
  t("Score 2000", "Earn 2,000 points in any game", "score", "hard", "totalScore", 2000, "add", 60, 120, 2, "Target", "text-cyan-400"),
  t("Legendary Score", "Score 1000+ in a single game", "score", "hard", "anyHighScore", 1000, "set", 60, 120, 2, "TrendingUp", "text-green-400"),

  // ── Plays ──
  t("First Game", "Play 1 game today", "plays", "easy", "gamesPlayed", 1, "add", 10, 20, undefined, "Gamepad2", "text-violet-400"),
  t("Double Up", "Play 2 games today", "plays", "easy", "gamesPlayed", 2, "add", 15, 30, undefined, "Gamepad2", "text-violet-400"),
  t("Triple Threat", "Play 3 games today", "plays", "medium", "gamesPlayed", 3, "add", 25, 50, 1, "Gamepad2", "text-violet-400"),
  t("Gamer", "Play 5 games today", "plays", "hard", "gamesPlayed", 5, "add", 50, 100, 2, "Gamepad2", "text-violet-400"),

  // ── Per-game plays ──
  t("Snake Charmer", "Play Nya Snake today", "plays", "easy", "plays:snake", 1, "add", 15, 25, undefined, "Worm", "text-green-400"),
  t("Block Master", "Play Block Blast today", "plays", "easy", "plays:block-blast", 1, "add", 15, 25, undefined, "Grid3x3", "text-blue-400"),
  t("Candy Crusher", "Play Nya Crush today", "plays", "easy", "plays:candy-crush", 1, "add", 15, 25, undefined, "Candy", "text-pink-400"),
  t("Feline Fury", "Play Furious Felines today", "plays", "medium", "plays:angry-birds", 1, "add", 20, 40, 1, "Feather", "text-orange-400"),
  t("Quiz Master", "Play Sword of Knowledge today", "plays", "medium", "plays:quiz-sword", 1, "add", 20, 40, 1, "Sword", "text-amber-400"),
  t("Sort It Out", "Play Water Sort today", "plays", "medium", "plays:water-sort", 1, "add", 20, 40, 1, "Droplets", "text-cyan-400"),
  t("Puzzle Paws", "Play Meowdoku today", "plays", "medium", "plays:meowdoku", 1, "add", 20, 40, 1, "LayoutGrid", "text-purple-400"),
  t("Colorful Cat", "Play Cat Coloring today", "plays", "easy", "plays:coloring", 1, "add", 15, 25, undefined, "Brush", "text-rose-400"),

  // ── Stars ──
  t("Rising Star", "Earn 1 star today", "stars", "easy", "totalStars", 1, "add", 10, 20, undefined, "Star", "text-yellow-400"),
  t("Star Power", "Earn 3 stars today", "stars", "medium", "totalStars", 3, "add", 25, 50, 1, "Star", "text-yellow-400"),
  t("Starstruck", "Earn 5 stars today", "stars", "hard", "totalStars", 5, "add", 50, 100, 2, "Star", "text-yellow-400"),

  // ── Economy ──
  t("Paw Saver", "Earn 50 paws today", "economy", "easy", "pawsEarned", 50, "add", 10, 15, undefined, "Coins", "text-amber-400"),
  t("Paw Hunter", "Earn 100 paws today", "economy", "medium", "pawsEarned", 100, "add", 20, 30, 1, "Coins", "text-amber-400"),
  t("Paw Tycoon", "Earn 200 paws today", "economy", "hard", "pawsEarned", 200, "add", 40, 60, 2, "Coins", "text-amber-400"),

  // ── Social ──
  t("Friendly", "Send 1 gift to a friend today", "social", "easy", "giftsSent", 1, "add", 15, 30, 1, "Gift", "text-pink-400"),
  t("Generous", "Send 2 gifts today", "social", "medium", "giftsSent", 2, "add", 30, 50, 1, "Gift", "text-pink-400"),

  // ── Collection / Misc ──
  t("Explorer", "Visit the Store today", "misc", "easy", "storeVisited", 1, "add", 10, 15, undefined, "ShoppingBag", "text-violet-400"),
  t("Social Butterfly", "Visit Friends today", "misc", "easy", "friendsVisited", 1, "add", 10, 15, undefined, "Users", "text-pink-400"),
  t("Self Care", "Visit your Profile today", "misc", "easy", "profileVisited", 1, "add", 10, 15, undefined, "User", "text-blue-400"),
  t("Competitive", "Check the Rankings today", "misc", "easy", "rankingsVisited", 1, "add", 10, 15, undefined, "Trophy", "text-amber-400"),
];

// Lookup map
export const CHALLENGE_MAP: Record<string, ChallengeTemplate> = Object.fromEntries(
  CHALLENGE_TEMPLATES.map((c) => [c.id, c]),
);

// Per-difficulty pools for daily generation
export const EASY_POOL = CHALLENGE_TEMPLATES.filter((c) => c.difficulty === "easy");
export const MEDIUM_POOL = CHALLENGE_TEMPLATES.filter((c) => c.difficulty === "medium");
export const HARD_POOL = CHALLENGE_TEMPLATES.filter((c) => c.difficulty === "hard");