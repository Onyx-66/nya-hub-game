import type { ComponentType } from "react";
import {
  Heart,
  Star,
  PauseCircle,
  Bomb,
  Ban,
  UserCircle,
  Zap,
  PawPrint,
  Gem,
  Gift,
  Sparkles,
  Rocket,
} from "lucide-react";

export type CurrencyType = "paws" | "gems" | "real";
export type StoreTab = "powerups" | "currency" | "special";

export interface StoreItem {
  id: string;
  name: string;
  description: string;
  icon: ComponentType<{ className?: string }>;
  cost: number;
  currency: CurrencyType;
  tab: StoreTab;
  /** Tailwind gradient classes, e.g. "from-violet-500 to-purple-700" */
  gradient: string;
  badge?: string;
  /** Bonus percentage displayed as "+X% More" */
  bonusPercent?: number;
  /** For currency packs purchased with real money: what they grant */
  grant?: { currency: "paws" | "gems"; amount: number };
  /** Section label when grouped inside the currency tab */
  section?: "paws" | "gems";
  /** Shimmer overlay flag (remove-ads card) */
  sparkle?: boolean;
  /** One-time starter pack for new players */
  isStarterPack?: boolean;
  /** Limited-time deal */
  isLimitedTime?: boolean;
}

export const POWERUP_ITEMS: StoreItem[] = [
  {
    id: "extra-life",
    name: "Extra Life",
    description: "Continue playing after game over",
    icon: Heart,
    cost: 100,
    currency: "paws",
    tab: "powerups",
    gradient: "from-violet-500 to-purple-700",
  },
  {
    id: "score-doubler",
    name: "Score Doubler",
    description: "Double your score for 30 seconds",
    icon: Star,
    cost: 5,
    currency: "gems",
    tab: "powerups",
    gradient: "from-amber-400 to-yellow-600",
  },
  {
    id: "time-freeze",
    name: "Time Freeze",
    description: "Freeze the timer for 15 seconds",
    icon: PauseCircle,
    cost: 8,
    currency: "gems",
    tab: "powerups",
    gradient: "from-blue-500 to-cyan-600",
  },
  {
    id: "bomb-boost",
    name: "Bomb Boost",
    description: "Clear surrounding blocks",
    icon: Bomb,
    cost: 200,
    currency: "paws",
    tab: "powerups",
    gradient: "from-rose-500 to-red-700",
  },
];

export const CURRENCY_ITEMS: StoreItem[] = [
  // ── Paws tiers (cheapest → most premium) ──
  {
    id: "paw-pack-starter",
    name: "Paw Starter",
    description: "300 Paws",
    icon: PawPrint,
    cost: 0.99,
    currency: "real",
    tab: "currency",
    gradient: "from-pink-400 to-rose-500",
    grant: { currency: "paws", amount: 300 },
    section: "paws",
  },
  {
    id: "paw-pack-small",
    name: "Paw Pack",
    description: "700 Paws",
    icon: PawPrint,
    cost: 1.99,
    currency: "real",
    tab: "currency",
    gradient: "from-pink-400 to-rose-500",
    bonusPercent: 17,
    grant: { currency: "paws", amount: 700 },
    section: "paws",
  },
  {
    id: "paw-pack-medium",
    name: "Paw Bundle",
    description: "1,500 Paws",
    icon: PawPrint,
    cost: 3.99,
    currency: "real",
    tab: "currency",
    gradient: "from-pink-400 to-rose-600",
    bonusPercent: 25,
    grant: { currency: "paws", amount: 1500 },
    section: "paws",
  },
  {
    id: "paw-pack-large",
    name: "Paw Vault",
    description: "3,500 Paws",
    icon: PawPrint,
    cost: 6.99,
    currency: "real",
    tab: "currency",
    gradient: "from-pink-500 to-rose-600",
    badge: "Best Value",
    bonusPercent: 40,
    grant: { currency: "paws", amount: 3500 },
    section: "paws",
  },

  // ── Gem tiers (cheapest → most premium) ──
  {
    id: "gem-pack-starter",
    name: "Gem Starter",
    description: "30 Gems",
    icon: Gem,
    cost: 0.99,
    currency: "real",
    tab: "currency",
    gradient: "from-cyan-400 to-teal-500",
    grant: { currency: "gems", amount: 30 },
    section: "gems",
  },
  {
    id: "gem-pack-small",
    name: "Gem Pack",
    description: "80 Gems",
    icon: Gem,
    cost: 1.99,
    currency: "real",
    tab: "currency",
    gradient: "from-cyan-400 to-teal-500",
    bonusPercent: 14,
    grant: { currency: "gems", amount: 80 },
    section: "gems",
  },
  {
    id: "gem-pack-medium",
    name: "Gem Bundle",
    description: "170 Gems",
    icon: Gem,
    cost: 3.99,
    currency: "real",
    tab: "currency",
    gradient: "from-cyan-400 to-teal-600",
    bonusPercent: 21,
    grant: { currency: "gems", amount: 170 },
    section: "gems",
  },
  {
    id: "gem-pack-large",
    name: "Gem Vault",
    description: "400 Gems",
    icon: Gem,
    cost: 6.99,
    currency: "real",
    tab: "currency",
    gradient: "from-cyan-500 to-teal-600",
    badge: "Best Value",
    bonusPercent: 43,
    grant: { currency: "gems", amount: 400 },
    section: "gems",
  },
];

/** Limited-time daily deal */
export const LIMITED_TIME_ITEM: StoreItem = {
  id: "daily-mega-bundle",
  name: "Mega Daily Bundle",
  description: "2,000 Paws + 60 Gems",
  icon: Sparkles,
  cost: 2.99,
  currency: "real",
  tab: "currency",
  gradient: "from-violet-500 via-fuchsia-500 to-pink-500",
  badge: "70% OFF",
  isLimitedTime: true,
};

/** One-time starter pack for new players */
export const STARTER_PACK_ITEM: StoreItem = {
  id: "starter-pack",
  name: "Starter Pack",
  description: "1,000 Paws + 25 Gems + Extra Life",
  icon: Gift,
  cost: 1.99,
  currency: "real",
  tab: "special",
  gradient: "from-emerald-400 to-teal-600",
  badge: "One-Time",
  isStarterPack: true,
  sparkle: true,
};

export const SPECIAL_ITEMS: StoreItem[] = [
  STARTER_PACK_ITEM,
  {
    id: "remove-ads",
    name: "Remove Ads Forever",
    description: "One-time purchase — enjoy an ad-free experience forever.",
    icon: Ban,
    cost: 3.99,
    currency: "real",
    tab: "special",
    gradient: "from-amber-400 to-yellow-600",
    sparkle: true,
  },
  {
    id: "premium-avatar-pack",
    name: "Premium Avatar Pack",
    description: "Unlock 10 exclusive cat avatars.",
    icon: UserCircle,
    cost: 300,
    currency: "gems",
    tab: "special",
    gradient: "from-fuchsia-500 to-pink-700",
  },
  {
    id: "daily-bonus-boost",
    name: "Daily Bonus Boost",
    description: "Double your daily bonus for 7 days.",
    icon: Zap,
    cost: 150,
    currency: "gems",
    tab: "special",
    gradient: "from-indigo-500 to-blue-700",
  },
  {
    id: "xp-booster",
    name: "XP Booster",
    description: "Earn 2x XP for 24 hours.",
    icon: Rocket,
    cost: 200,
    currency: "gems",
    tab: "special",
    gradient: "from-violet-500 to-purple-700",
  },
];