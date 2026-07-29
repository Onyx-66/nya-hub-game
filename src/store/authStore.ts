import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { UserProfile } from "@/types";
import { useEconomyStore } from "./economyStore";

// =============================================
// Mock data generators
// =============================================

const ADJECTIVES = [
  "Nya", "Fuzzy", "Swift", "Lucky", "Shadow",
  "Pixel", "Turbo", "Mystic", "Cosmo", "Neon",
];
const NOUNS = [
  "Cat", "Whiskers", "Paws", "Pounce", "Striker",
  "Hunter", "Leaper", "Scout", "Dash", "Spark",
];
const AVATARS = ["🐱", "😺", "😸", "😻", "😼", "🐈‍⬛", "👑", "🚀"];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generatePseudonym(): string {
  return `${pick(ADJECTIVES)}${pick(NOUNS)}${Math.floor(Math.random() * 1000)}`;
}

function generateUserId(): string {
  return `u_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

export function generateRandomProfile(pseudonym?: string): UserProfile {
  return {
    id: generateUserId(),
    pseudonym: pseudonym?.trim() || generatePseudonym(),
    country: "",
    avatar: pick(AVATARS),
    level: 1,
    xp: 0,
    totalPaws: 0,
    totalGems: 0,
    gameStats: {
      gamesPlayed: 0,
      highScores: {},
      totalPlayTime: 0,
      achievements: [],
    },
    preferences: {
      language: "en",
      soundEnabled: true,
      hapticsEnabled: true,
      darkMode: true,
    },
  };
}

// =============================================
// Auth Store
// =============================================

interface AuthState {
  user: UserProfile | null;
  login: (pseudonym?: string) => void;
  logout: () => void;
  updateProfile: (data: Partial<UserProfile>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,

      login: (pseudonym) => {
        const existing = get().user;
        if (existing) return; // session already active — restore

        const user = generateRandomProfile(pseudonym);
        set({ user });
        useEconomyStore.getState().initializeForUser(user.id);
      },

      logout: () => {
        useEconomyStore.getState().reset();
        set({ user: null });
      },

      updateProfile: (data) =>
        set((s) => (s.user ? { user: { ...s.user, ...data } } : s)),
    }),
    { name: "nya-hub-auth" }
  )
);