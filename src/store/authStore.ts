import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { UserProfile } from "@/types";
import { useEconomyStore } from "./economyStore";
import {
  isPseudonymAvailable,
  reservePseudonym,
  releasePseudonym,
} from "@/utils/pseudonymRegistry";

// =============================================
// Helpers
// =============================================

function generateUserId(): string {
  return `u_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

export function createProfile(pseudonym: string, country = ""): UserProfile {
  return {
    id: generateUserId(),
    pseudonym: pseudonym.trim(),
    country,
    avatar: "1",
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
    bio: "",
    bannerId: null,
    customAvatarUrl: null,
    title: null,
    titles: [],
    joinedDate: new Date().toISOString(),
  };
}

export function levelFromXP(xp: number): number {
  return Math.floor(Math.sqrt(xp / 100)) + 1;
}

// =============================================
// Auth Store
// =============================================

interface AuthState {
  user: UserProfile | null;
  login: (pseudonym: string, country?: string) => void;
  logout: () => void;
  updateProfile: (data: Partial<UserProfile>) => void;
  updateBio: (bio: string) => void;
  updateAvatar: (url: string | null) => void;
  updateBanner: (bannerId: string | null) => void;
  addTitle: (titleId: string) => void;
  setTitle: (titleId: string | null) => void;
  addXP: (amount: number) => void;
  changePseudonym: (newName: string) => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,

      login: (pseudonym, country = "") => {
        const existing = get().user;
        if (existing) return;
        const name = pseudonym.trim();
        if (!isPseudonymAvailable(name)) {
          throw new Error("Pseudonym already taken");
        }
        reservePseudonym(name);
        const user = createProfile(name, country);
        set({ user });
        useEconomyStore.getState().initializeForUser(user.id);
      },

      logout: () => {
        const user = get().user;
        if (user) releasePseudonym(user.pseudonym);
        useEconomyStore.getState().reset();
        set({ user: null });
      },

      updateProfile: (data) =>
        set((s) => (s.user ? { user: { ...s.user, ...data } } : s)),

      updateBio: (bio) =>
        set((s) =>
          s.user ? { user: { ...s.user, bio: bio.slice(0, 80) } } : s
        ),

      updateAvatar: (url) =>
        set((s) =>
          s.user ? { user: { ...s.user, customAvatarUrl: url } } : s
        ),

      updateBanner: (bannerId) =>
        set((s) => (s.user ? { user: { ...s.user, bannerId } } : s)),

      addTitle: (titleId) =>
        set((s) =>
          s.user && !s.user.titles.includes(titleId)
            ? { user: { ...s.user, titles: [...s.user.titles, titleId] } }
            : s
        ),

      setTitle: (titleId) =>
        set((s) => (s.user ? { user: { ...s.user, title: titleId } } : s)),

      addXP: (amount) =>
        set((s) => {
          if (!s.user) return s;
          const xp = s.user.xp + amount;
          const level = levelFromXP(xp);
          return { user: { ...s.user, xp, level } };
        }),

      changePseudonym: (newName) => {
        const user = get().user;
        if (!user) return false;
        const name = newName.trim();
        if (name.toLowerCase() === user.pseudonym.toLowerCase()) return true;
        if (!isPseudonymAvailable(name)) return false;
        releasePseudonym(user.pseudonym);
        reservePseudonym(name);
        set({ user: { ...user, pseudonym: name } });
        return true;
      },
    }),
    { name: "nya-hub-auth" }
  )
);