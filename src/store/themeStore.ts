import { create } from "zustand";
import { persist } from "zustand/middleware";

export type AppTheme = "dark" | "light" | "system" | "ocean";

function getSystemTheme(): "dark" | "light" {
  if (typeof window === "undefined") return "dark";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

/** Applies the theme class to <html>. Call on app init and whenever theme changes. */
export function applyThemeClass(theme: AppTheme) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.classList.remove("dark", "theme-ocean");

  let effective = theme;
  if (theme === "system") {
    effective = getSystemTheme();
  }
  if (effective === "dark") {
    root.classList.add("dark");
  } else if (effective === "ocean") {
    root.classList.add("theme-ocean");
  }
  // "light" = no class needed (falls back to :root)
}

interface ThemeState {
  theme: AppTheme;
  setTheme: (theme: AppTheme) => void;
  applyTheme: () => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: "dark",
      setTheme: (theme) => {
        set({ theme });
        applyThemeClass(theme);
      },
      applyTheme: () => {
        applyThemeClass(get().theme);
      },
    }),
    {
      name: "nya-hub-theme",
      onRehydrateStorage: () => (state) => {
        if (state) applyThemeClass(state.theme);
      },
    },
  ),
);