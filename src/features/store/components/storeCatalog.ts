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
  /** For currency packs purchased with real money: what they grant */
  grant?: { currency: "paws" | "gems"; amount: number };
  /** Section label when grouped inside the currency tab */
  section?: "paws" | "gems";
  /** Shimmer overlay flag (remove-ads card) */
  sparkle?: boolean;
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
  {
    id: "paw-pack-small",
    name: "Paw Pack Small",
    description: "500 Paws",
    icon: PawPrint,
    cost: 0.99,
    currency: "real",
    tab: "currency",
    gradient: "from-pink-400 to-rose-600",
    grant: { currency: "paws", amount: 500 },
    section: "paws",
  },
  {
    id: "paw-pack-medium",
    name: "Paw Pack Medium",
    description: "1,200 Paws",
    icon: PawPrint,
    cost: 1.99,
    currency: "real",
    tab: "currency",
    gradient: "from-pink-400 to-rose-600",
    badge: "Best Value",
    grant: { currency: "paws", amount: 1200 },
    section: "paws",
  },
  {
    id: "paw-pack-large",
    name: "Paw Pack Large",
    description: "3,000 Paws",
    icon: PawPrint,
    cost: 4.99,
    currency: "real",
    tab: "currency",
    gradient: "from-pink-400 to-rose-600",
    grant: { currency: "paws", amount: 3000 },
    section: "paws",
  },
  {
    id: "gem-pack-small",
    name: "Gem Pack Small",
    description: "50 Gems",
    icon: Gem,
    cost: 0.99,
    currency: "real",
    tab: "currency",
    gradient: "from-cyan-400 to-teal-600",
    grant: { currency: "gems", amount: 50 },
    section: "gems",
  },
  {
    id: "gem-pack-medium",
    name: "Gem Pack Medium",
    description: "120 Gems",
    icon: Gem,
    cost: 1.99,
    currency: "real",
    tab: "currency",
    gradient: "from-cyan-400 to-teal-600",
    badge: "Popular",
    grant: { currency: "gems", amount: 120 },
    section: "gems",
  },
  {
    id: "gem-pack-large",
    name: "Gem Pack Large",
    description: "300 Gems",
    icon: Gem,
    cost: 4.99,
    currency: "real",
    tab: "currency",
    gradient: "from-cyan-400 to-teal-600",
    grant: { currency: "gems", amount: 300 },
    section: "gems",
  },
];

export const SPECIAL_ITEMS: StoreItem[] = [
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
];