import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Currency, Transaction, TransactionType } from "@/types";
import { MAX_TRANSACTIONS_HISTORY } from "@/utils/constants";

// =============================================
// Helpers
// =============================================

const STARTING_PAWS = 500;
const STARTING_GEMS = 10;

function createTransaction(
  userId: string,
  type: TransactionType,
  currency: Currency,
  amount: number,
  description: string,
  itemId?: string,
  gameId?: string,
): Transaction {
  return {
    id: `tx_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    userId,
    type,
    currency,
    amount,
    description,
    itemId,
    gameId,
    timestamp: new Date().toISOString(),
  };
}

// =============================================
// Economy Store
// =============================================

interface EconomyState {
  userId: string | null;
  paws: number;
  gems: number;
  transactions: Transaction[];

  addPaws: (amount: number, source: string) => void;
  spendPaws: (amount: number, item: string) => boolean;
  addGems: (amount: number) => void;
  spendGems: (amount: number) => boolean;
  getBalance: () => { paws: number; gems: number };
  initializeForUser: (userId: string) => void;
  reset: () => void;
}

export const useEconomyStore = create<EconomyState>()(
  persist(
    (set, get) => ({
      userId: null,
      paws: 0,
      gems: 0,
      transactions: [],

      addPaws: (amount, source) =>
        set((s) => {
          if (!s.userId) return s;
          return {
            paws: s.paws + amount,
            transactions: [
              createTransaction(s.userId, "earn", "paws", amount, source),
              ...s.transactions,
            ].slice(0, MAX_TRANSACTIONS_HISTORY),
          };
        }),

      spendPaws: (amount, item) => {
        const s = get();
        if (!s.userId || s.paws < amount) return false;
        set({
          paws: s.paws - amount,
          transactions: [
            createTransaction(s.userId, "spend", "paws", amount, `Purchased ${item}`, item),
            ...s.transactions,
          ].slice(0, MAX_TRANSACTIONS_HISTORY),
        });
        return true;
      },

      addGems: (amount) =>
        set((s) => {
          if (!s.userId) return s;
          return {
            gems: s.gems + amount,
            transactions: [
              createTransaction(s.userId, "earn", "gems", amount, "Premium currency added"),
              ...s.transactions,
            ].slice(0, MAX_TRANSACTIONS_HISTORY),
          };
        }),

      spendGems: (amount) => {
        const s = get();
        if (!s.userId || s.gems < amount) return false;
        set({
          gems: s.gems - amount,
          transactions: [
            createTransaction(s.userId, "spend", "gems", amount, "Premium purchase"),
            ...s.transactions,
          ].slice(0, MAX_TRANSACTIONS_HISTORY),
        });
        return true;
      },

      getBalance: () => {
        const s = get();
        return { paws: s.paws, gems: s.gems };
      },

      initializeForUser: (userId) =>
        set({
          userId,
          paws: STARTING_PAWS,
          gems: STARTING_GEMS,
          transactions: [],
        }),

      reset: () =>
        set({
          userId: null,
          paws: 0,
          gems: 0,
          transactions: [],
        }),
    }),
    { name: "nya-hub-economy" }
  )
);