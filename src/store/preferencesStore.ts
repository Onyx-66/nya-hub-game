import { create } from "zustand";
import { persist } from "zustand/middleware";

export type GameViewMode = "grid" | "list" | "compact";

export interface NotificationSettings {
  /** Achievement unlock popups */
  achievements: boolean;
  /** Daily challenge reminders + completions */
  challenges: boolean;
  /** Currency earned/spent, level-ups, daily bonus — always on by default */
  economy: boolean;
}

interface PreferencesState {
  gameViewMode: GameViewMode;
  notifications: NotificationSettings;
  setGameViewMode: (mode: GameViewMode) => void;
  toggleNotification: (key: keyof NotificationSettings) => void;
  setNotification: (key: keyof NotificationSettings, value: boolean) => void;
  reset: () => void;
}

const DEFAULT_NOTIFICATIONS: NotificationSettings = {
  achievements: true,
  challenges: true,
  economy: true,
};

export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set) => ({
      gameViewMode: "compact",
      notifications: { ...DEFAULT_NOTIFICATIONS },

      setGameViewMode: (mode) => set({ gameViewMode: mode }),

      toggleNotification: (key) =>
        set((s) => ({
          notifications: { ...s.notifications, [key]: !s.notifications[key] },
        })),

      setNotification: (key, value) =>
        set((s) => ({
          notifications: { ...s.notifications, [key]: value },
        })),

      reset: () =>
        set({ gameViewMode: "compact", notifications: { ...DEFAULT_NOTIFICATIONS } }),
    }),
    { name: "nya-hub-preferences" }
  )
);