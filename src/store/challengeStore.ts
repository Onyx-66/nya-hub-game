import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  EASY_POOL,
  MEDIUM_POOL,
  HARD_POOL,
  CHALLENGE_MAP,
  type DailyChallenge,
} from "@/data/challengeCatalog";
import { useAuthStore } from "@/store/authStore";
import { useEconomyStore } from "@/store/economyStore";
import { useAchievementStore } from "@/store/achievementStore";
import { audioService } from "@/services/audioService";

// =============================================
// Helpers
// =============================================

/** Returns YYYY-MM-DD in local time. */
function getDateString(d = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Milliseconds until midnight (local). */
function msUntilMidnight(): number {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);
  return midnight.getTime() - now.getTime();
}

/** Deterministic seeded pick — same user+date always yields the same set. */
function seededPick<T>(pool: T[], seed: number, count: number): T[] {
  let s = seed;
  const rng = () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
  const copy = [...pool];
  const result: T[] = [];
  for (let i = 0; i < count && copy.length > 0; i++) {
    const idx = Math.floor(rng() * copy.length);
    result.push(copy.splice(idx, 1)[0]);
  }
  return result;
}

function hashString(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) - h + str.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

// =============================================
// Store
// =============================================

interface ChallengeState {
  date: string | null;
  challenges: DailyChallenge[];
  streak: number;
  lastStreakDate: string | null;

  /** Generates today's challenges if not already done. Idempotent. */
  ensureDaily: () => void;
  addProgress: (metric: string, amount: number) => void;
  setProgress: (metric: string, value: number) => void;
  claim: (templateId: string) => void;
  claimAll: () => void;
  getActiveChallenges: () => DailyChallenge[];
  getCompletedCount: () => number;
  getTotalCount: () => number;
  getAllCompleted: () => boolean;
  getMsUntilReset: () => number;
  reset: () => void;
}

export const useChallengeStore = create<ChallengeState>()(
  persist(
    (set, get) => ({
      date: null,
      challenges: [],
      streak: 0,
      lastStreakDate: null,

      ensureDaily: () => {
        const today = getDateString();
        const s = get();
        if (s.date === today && s.challenges.length > 0) return;

        // Check streak: did the user complete all challenges yesterday?
        let newStreak = s.streak;
        const yesterday = getDateString(new Date(Date.now() - 86400000));
        if (s.lastStreakDate === yesterday) {
          // streak continues — keep current value
        } else if (s.lastStreakDate !== today) {
          // streak broken
          newStreak = 0;
        }

        // Generate: 2 easy + 2 medium + 1 hard
        const userId = useAuthStore.getState().user?.id ?? "anon";
        const seed = hashString(today + userId);
        const picked = [
          ...seededPick(EASY_POOL, seed, 2),
          ...seededPick(MEDIUM_POOL, seed + 1, 2),
          ...seededPick(HARD_POOL, seed + 2, 1),
        ];

        set({
          date: today,
          challenges: picked.map((tmpl) => ({
            templateId: tmpl.id,
            progress: 0,
            completed: false,
            claimed: false,
          })),
          streak: newStreak,
        });
      },

      addProgress: (metric, amount) => {
        get().ensureDaily();
        set((s) => {
          let changed = false;
          const challenges = s.challenges.map((ch) => {
            if (ch.completed) return ch;
            const tmpl = CHALLENGE_MAP[ch.templateId];
            if (!tmpl || tmpl.metric !== metric || tmpl.trackMode !== "add") return ch;
            const newProg = Math.min(ch.progress + amount, tmpl.target);
            if (newProg === ch.progress) return ch;
            changed = true;
            const completed = newProg >= tmpl.target;
            if (completed) audioService.playSFX("challenge-complete");
            return { ...ch, progress: newProg, completed };
          });
          return changed ? { challenges } : s;
        });
      },

      setProgress: (metric, value) => {
        get().ensureDaily();
        set((s) => {
          let changed = false;
          const challenges = s.challenges.map((ch) => {
            if (ch.completed) return ch;
            const tmpl = CHALLENGE_MAP[ch.templateId];
            if (!tmpl || tmpl.metric !== metric || tmpl.trackMode !== "set") return ch;
            const newProg = Math.min(Math.max(value, ch.progress), tmpl.target);
            if (newProg === ch.progress) return ch;
            changed = true;
            const completed = newProg >= tmpl.target;
            if (completed) audioService.playSFX("challenge-complete");
            return { ...ch, progress: newProg, completed };
          });
          return changed ? { challenges } : s;
        });
      },

      claim: (templateId) => {
        const s = get();
        const ch = s.challenges.find((c) => c.templateId === templateId);
        if (!ch || !ch.completed || ch.claimed) return;

        const tmpl = CHALLENGE_MAP[templateId];
        if (!tmpl) return;

        set((st) => ({
          challenges: st.challenges.map((c) =>
            c.templateId === templateId ? { ...c, claimed: true } : c,
          ),
        }));

        // Award rewards
        if (tmpl.xpReward > 0) useAuthStore.getState().addXP(tmpl.xpReward);
        if (tmpl.pawsReward > 0) useEconomyStore.getState().addPaws(tmpl.pawsReward, "Daily challenge reward");
        if (tmpl.gemsReward) useEconomyStore.getState().addGems(tmpl.gemsReward);

        // Track achievement: daily challenges claimed
        useAchievementStore.getState().addProgress("dailyChallengesClaimed", 1);

        // Check if ALL challenges are now claimed → update streak
        const updated = get().challenges;
        const allClaimed = updated.length > 0 && updated.every((c) => c.claimed);
        if (allClaimed) {
          const today = getDateString();
          set((st) => ({
            streak: st.lastStreakDate === today ? st.streak : st.streak + 1,
            lastStreakDate: today,
          }));
          useAchievementStore.getState().setProgress("dailyStreak", get().streak);
        }

        audioService.playSFX("paw-earn");
      },

      claimAll: () => {
        const s = get();
        for (const ch of s.challenges) {
          if (ch.completed && !ch.claimed) {
            get().claim(ch.templateId);
          }
        }
      },

      getActiveChallenges: () => {
        get().ensureDaily();
        return get().challenges;
      },

      getCompletedCount: () => {
        const s = get();
        return s.challenges.filter((c) => c.completed).length;
      },

      getTotalCount: () => get().challenges.length,

      getAllCompleted: () => {
        const s = get();
        return s.challenges.length > 0 && s.challenges.every((c) => c.completed);
      },

      getMsUntilReset: () => msUntilMidnight(),

      reset: () => set({ date: null, challenges: [], streak: 0, lastStreakDate: null }),
    }),
    { name: "nya-hub-challenges" },
  ),
);