import { create } from "zustand";
import { persist } from "zustand/middleware";
import { ACHIEVEMENTS, ACHIEVEMENT_MAP, type AchievementCategory } from "@/data/achievementCatalog";
import { useAuthStore } from "@/store/authStore";
import { useEconomyStore } from "@/store/economyStore";
import { useFriendsStore } from "@/store/friendsStore";
import { audioService } from "@/services/audioService";

// =============================================
// Types
// =============================================

interface AchievementState {
  unlocked: string[];
  progress: Record<string, number>;
  notificationQueue: string[];

  setProgress: (metric: string, value: number) => void;
  addProgress: (metric: string, amount: number) => void;
  checkAll: () => void;
  dismissNotification: () => void;
  isUnlocked: (id: string) => boolean;
  getProgress: (metric: string) => number;
  getUnlockedCount: () => number;
  getCountByCategory: (cat: AchievementCategory) => { unlocked: number; total: number };
  syncFromStores: () => void;
  reset: () => void;
}

// =============================================
// Store
// =============================================

export const useAchievementStore = create<AchievementState>()(
  persist(
    (set, get) => ({
      unlocked: [],
      progress: {},
      notificationQueue: [],

      setProgress: (metric, value) => {
        let didUpdate = false;
        set((s) => {
          const current = s.progress[metric] ?? 0;
          if (value <= current) return s;
          didUpdate = true;
          return { progress: { ...s.progress, [metric]: value } };
        });
        if (didUpdate) get().checkAll();
      },

      addProgress: (metric, amount) => {
        let didUpdate = false;
        set((s) => {
          const current = s.progress[metric] ?? 0;
          didUpdate = true;
          return { progress: { ...s.progress, [metric]: current + amount } };
        });
        if (didUpdate) get().checkAll();
      },

      checkAll: () => {
        const s = get();
        const newlyUnlocked: string[] = [];

        for (const ach of ACHIEVEMENTS) {
          if (s.unlocked.includes(ach.id)) continue;
          const value = s.progress[ach.metric] ?? 0;
          if (value >= ach.threshold) {
            newlyUnlocked.push(ach.id);
          }
        }

        if (newlyUnlocked.length === 0) return;

        const totalUnlocked = s.unlocked.length + newlyUnlocked.length;

        set({
          unlocked: [...s.unlocked, ...newlyUnlocked],
          notificationQueue: [...s.notificationQueue, ...newlyUnlocked],
          progress: { ...s.progress, achievementsUnlocked: totalUnlocked },
        });

        // Award rewards
        let totalXP = 0;
        let totalPaws = 0;
        let totalGems = 0;
        for (const id of newlyUnlocked) {
          const ach = ACHIEVEMENT_MAP[id];
          if (ach) {
            totalXP += ach.xpReward;
            totalPaws += ach.pawsReward;
            totalGems += ach.gemsReward ?? 0;
          }
        }
        if (totalXP > 0) useAuthStore.getState().addXP(totalXP);
        if (totalPaws > 0) useEconomyStore.getState().addPaws(totalPaws, "Achievement rewards");
        if (totalGems > 0) useEconomyStore.getState().addGems(totalGems);

        audioService.playSFX("achievement-unlock");
      },

      dismissNotification: () =>
        set((s) => ({ notificationQueue: s.notificationQueue.slice(1) })),

      isUnlocked: (id) => get().unlocked.includes(id),

      getProgress: (metric) => get().progress[metric] ?? 0,

      getUnlockedCount: () => get().unlocked.length,

      getCountByCategory: (cat) => {
        const s = get();
        const total = ACHIEVEMENTS.filter((a) => a.category === cat).length;
        const unlockedCount = s.unlocked.filter(
          (id) => ACHIEVEMENT_MAP[id]?.category === cat
        ).length;
        return { unlocked: unlockedCount, total };
      },

      syncFromStores: () => {
        const auth = useAuthStore.getState().user;
        const economy = useEconomyStore.getState();
        const friends = useFriendsStore.getState();
        if (!auth) return;

        const updates: Record<string, number> = {
          level: auth.level ?? 1,
          xp: auth.xp ?? 0,
          titlesEarned: (auth.titles ?? []).length,
          pawsBalance: economy.paws ?? 0,
          gemsBalance: economy.gems ?? 0,
          friendsCount: (friends.friends ?? []).length,
          bannersOwned: auth.bannerId ? 1 : 0,
          achievementsUnlocked: get().unlocked.length,
        };

        // Compute total earned from transactions
        const pawsEarned = economy.transactions
          .filter((t) => t.type === "earn" && t.currency === "paws")
          .reduce((sum, t) => sum + t.amount, 0);
        const gemsEarned = economy.transactions
          .filter((t) => t.type === "earn" && t.currency === "gems")
          .reduce((sum, t) => sum + t.amount, 0);
        const totalSpent = economy.transactions
          .filter((t) => t.type === "spend")
          .reduce((sum, t) => sum + t.amount, 0);

        updates.pawsEarned = Math.max(get().getProgress("pawsEarned"), pawsEarned);
        updates.gemsEarned = Math.max(get().getProgress("gemsEarned"), gemsEarned);
        updates.totalSpent = Math.max(get().getProgress("totalSpent"), totalSpent);

        // Batch update progress
        set((s) => {
          const newProgress = { ...s.progress };
          for (const [metric, value] of Object.entries(updates)) {
            newProgress[metric] = Math.max(newProgress[metric] ?? 0, value);
          }
          return { progress: newProgress };
        });
        get().checkAll();
      },

      reset: () => set({ unlocked: [], progress: {}, notificationQueue: [] }),
    }),
    { name: "nya-hub-achievements" }
  )
);