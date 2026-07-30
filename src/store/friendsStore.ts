import { create } from "zustand";
import { persist } from "zustand/middleware";
import { MOCK_LEADERBOARD_DATA, type RankEntry } from "@/services/leaderboardData";

// =============================================
// Types
// =============================================

export interface Friend extends RankEntry {
  addedDate: string;
  isOnline: boolean;
}

export interface FriendRequest {
  id: string;
  pseudonym: string;
  avatarId: number;
  country: string;
  level: number;
  timestamp: string;
}

// =============================================
// Store
// =============================================

interface FriendsState {
  friends: Friend[];
  requests: FriendRequest[];
  searchQuery: string;
  searchResults: RankEntry[];

  setSearchQuery: (query: string) => void;
  searchPlayers: (query: string, excludePseudonym?: string) => void;
  addFriend: (player: RankEntry) => void;
  removeFriend: (id: string) => void;
  acceptRequest: (id: string) => void;
  declineRequest: (id: string) => void;
  generateMockRequests: (count: number) => void;
}

function randomLevel(): number {
  return Math.floor(Math.random() * 15) + 1;
}

export const useFriendsStore = create<FriendsState>()(
  persist(
    (set, get) => ({
      friends: [],
      requests: [],
      searchQuery: "",
      searchResults: [],

      setSearchQuery: (query) => set({ searchQuery: query }),

      searchPlayers: (query, excludePseudonym) => {
        const trimmed = query.trim().toLowerCase();
        if (!trimmed) {
          set({ searchResults: [], searchQuery: query });
          return;
        }
        const existingIds = new Set(get().friends.map((f) => f.id));
        const results = MOCK_LEADERBOARD_DATA.filter((p) => {
          if (p.pseudonym === excludePseudonym) return false;
          if (existingIds.has(p.id)) return false;
          return p.pseudonym.toLowerCase().includes(trimmed);
        }).slice(0, 20);
        set({ searchQuery: query, searchResults: results });
      },

      addFriend: (player) =>
        set((s) => {
          if (s.friends.some((f) => f.id === player.id)) return s;
          const newFriend: Friend = {
            ...player,
            addedDate: new Date().toISOString(),
            isOnline: Math.random() > 0.5,
          };
          // Remove from requests if present
          const requests = s.requests.filter((r) => r.pseudonym !== player.pseudonym);
          return { friends: [...s.friends, newFriend], requests, searchResults: [] };
        }),

      removeFriend: (id) =>
        set((s) => ({ friends: s.friends.filter((f) => f.id !== id) })),

      acceptRequest: (id) =>
        set((s) => {
          const req = s.requests.find((r) => r.id === id);
          if (!req) return s;
          const player = MOCK_LEADERBOARD_DATA.find((p) => p.pseudonym === req.pseudonym);
          const newFriend: Friend = player
            ? {
                ...player,
                addedDate: new Date().toISOString(),
                isOnline: Math.random() > 0.5,
              }
            : {
                id: req.id,
                pseudonym: req.pseudonym,
                avatarId: req.avatarId,
                country: { code: req.country, flag: "🌍", name: "Worldwide" },
                score: 0,
                addedDate: new Date().toISOString(),
                isOnline: false,
              };
          return {
            friends: [...s.friends, newFriend],
            requests: s.requests.filter((r) => r.id !== id),
          };
        }),

      declineRequest: (id) =>
        set((s) => ({ requests: s.requests.filter((r) => r.id !== id) })),

      generateMockRequests: (count) =>
        set((s) => {
          if (s.requests.length > 0) return s;
          const existingNames = new Set([
            ...s.friends.map((f) => f.pseudonym),
          ]);
          const candidates = MOCK_LEADERBOARD_DATA.filter(
            (p) => !existingNames.has(p.pseudonym)
          );
          const shuffled = [...candidates].sort(() => Math.random() - 0.5);
          const picked = shuffled.slice(0, count);
          const newRequests: FriendRequest[] = picked.map((p) => ({
            id: p.id,
            pseudonym: p.pseudonym,
            avatarId: p.avatarId,
            country: p.country.code,
            level: randomLevel(),
            timestamp: new Date(Date.now() - Math.random() * 86400000).toISOString(),
          }));
          return { requests: newRequests };
        }),
    }),
    { name: "nya-hub-friends" }
  )
);