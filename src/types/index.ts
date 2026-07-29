import type { ComponentType } from "react";

// =============================================
// Common / Shared
// =============================================

/** Bilingual string support (English / Arabic) */
export interface LocalizedString {
  en: string;
  ar: string;
}

/** In-game currency types */
export type Currency = "paws" | "gems";

// =============================================
// Game Metadata
// =============================================

export type GameCategory =
  | "arcade"
  | "puzzle"
  | "action"
  | "adventure"
  | "strategy"
  | "idle";

export type GameDifficulty = "easy" | "medium" | "hard" | "expert";

/**
 * Pure metadata for a game — serializable, stored in DB, sent over API.
 * Contains no runtime references (components, functions, etc.).
 */
export interface GameMeta {
  id: string;
  slug: string;
  name: LocalizedString;
  description: LocalizedString;
  icon: string;
  difficulty: GameDifficulty;
  category: GameCategory;
  isComingSoon: boolean;
}

/**
 * Runtime game configuration — pairs metadata with its React component
 * and display-only fields (gradient, accent color, unlock level).
 */
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

// =============================================
// User Profile
// =============================================

export interface GameStats {
  gamesPlayed: number;
  highScores: Record<string, number>;
  totalPlayTime: number; // seconds
  achievements: string[];
}

export interface UserPreferences {
  language: "en" | "ar";
  soundEnabled: boolean;
  hapticsEnabled: boolean;
  darkMode: boolean;
}

export interface UserProfile {
  id: string;
  pseudonym: string;
  country: string;
  avatar: string;
  level: number;
  xp: number;
  totalPaws: number;
  totalGems: number;
  gameStats: GameStats;
  preferences: UserPreferences;
}

// =============================================
// Economy — Powerups
// =============================================

export type PowerupType =
  | "scoreMultiplier"
  | "timeExtension"
  | "extraLife"
  | "shield"
  | "slowMotion";

export interface PowerupEffect {
  type: PowerupType;
  value: number;
  /** Duration in seconds, if the effect is time-based. */
  duration?: number;
}

export interface PowerupDefinition {
  id: string;
  name: LocalizedString;
  description: LocalizedString;
  icon: string;
  effect: PowerupEffect;
  cost: number;
  currency: Currency;
}

// =============================================
// Economy — Offers
// =============================================

export type OfferType = "discount" | "bundle" | "bonus" | "limited";

export interface OfferDefinition {
  id: string;
  name: LocalizedString;
  description: LocalizedString;
  icon: string;
  type: OfferType;
  originalPrice: number;
  discountedPrice: number;
  currency: Currency;
  /** IDs of powerups or items included in this offer. */
  items: string[];
  startsAt?: string;
  endsAt?: string;
}

// =============================================
// Economy — Transactions
// =============================================

export type TransactionType =
  | "earn"
  | "spend"
  | "purchase"
  | "reward"
  | "refund";

export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  currency: Currency;
  amount: number;
  description: string;
  itemId?: string;
  gameId?: string;
  timestamp: string;
}

// =============================================
// Store (legacy, kept for current store UI)
// =============================================

export type StoreItemType = "consumable" | "cosmetic" | "currency" | "powerup";

export interface StoreItem {
  id: string;
  name: string;
  description: string;
  icon: string;
  price: number;
  currency: Currency;
  type: StoreItemType;
}

// =============================================
// Leaderboard
// =============================================

export type LeaderboardScope = "global" | "national";

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  pseudonym: string;
  avatar: string;
  score: number;
  scope: LeaderboardScope;
  country?: string;
  isYou?: boolean;
}

// =============================================
// Legacy (backwards compat — will be migrated)
// =============================================

/** @deprecated Use UserProfile instead. */
export interface Player {
  id: string;
  name: string;
  avatar: string;
  level: number;
  xp: number;
  coins: number;
  gems: number;
}