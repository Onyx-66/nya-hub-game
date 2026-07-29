import { create } from "zustand";
import { persist } from "zustand/middleware";

interface PlayerState {
  name: string;
  avatar: string;
  level: number;
  xp: number;
  coins: number;
  gems: number;
  addCoins: (amount: number) => void;
  addGems: (amount: number) => void;
  addXp: (amount: number) => void;
  spendCoins: (amount: number) => boolean;
  spendGems: (amount: number) => boolean;
  setName: (name: string) => void;
  reset: () => void;
}

const xpToNext = (level: number) => level * 100;

export const usePlayerStore = create<PlayerState>()(
  persist(
    (set, get) => ({
      name: "Nya Player",
      avatar: "🐱",
      level: 1,
      xp: 0,
      coins: 500,
      gems: 10,

      addCoins: (amount) => set((s) => ({ coins: s.coins + amount })),
      addGems: (amount) => set((s) => ({ gems: s.gems + amount })),

      addXp: (amount) =>
        set((s) => {
          let xp = s.xp + amount;
          let level = s.level;
          while (xp >= xpToNext(level)) {
            xp -= xpToNext(level);
            level += 1;
          }
          return { xp, level };
        }),

      spendCoins: (amount) => {
        if (get().coins < amount) return false;
        set((s) => ({ coins: s.coins - amount }));
        return true;
      },

      spendGems: (amount) => {
        if (get().gems < amount) return false;
        set((s) => ({ gems: s.gems - amount }));
        return true;
      },

      setName: (name) => set({ name }),
      reset: () =>
        set({ name: "Nya Player", avatar: "🐱", level: 1, xp: 0, coins: 500, gems: 10 }),
    }),
    { name: "nya-hub-player" }
  )
);