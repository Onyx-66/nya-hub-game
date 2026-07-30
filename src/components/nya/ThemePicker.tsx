import { useThemeStore, type AppTheme } from "@/store/themeStore";
import { Check } from "lucide-react";

interface ThemeOption {
  id: AppTheme;
  label: string;
  /** Two-color preview swatch */
  colors: [string, string];
}

const THEME_OPTIONS: ThemeOption[] = [
  { id: "dark", label: "Dark", colors: ["#1a1626", "#a855f7"] },
  { id: "light", label: "Light", colors: ["#f5f3ff", "#9333ea"] },
  { id: "system", label: "System", colors: ["#1a1626", "#f5f3ff"] },
  { id: "ocean", label: "Ocean", colors: ["#0c1e2e", "#06b6d4"] },
];

export default function ThemePicker() {
  const { theme, setTheme } = useThemeStore();

  return (
    <div className="px-4 py-3">
      <div className="grid grid-cols-4 gap-2.5">
        {THEME_OPTIONS.map((opt) => {
          const active = theme === opt.id;
          return (
            <button
              key={opt.id}
              onClick={() => setTheme(opt.id)}
              className={`flex flex-col items-center gap-1.5 p-2 rounded-2xl transition-all ${
                active
                  ? "bg-primary/15 ring-2 ring-primary"
                  : "bg-muted/40 hover:bg-muted/60"
              }`}
              aria-label={opt.label}
            >
              <div className="w-full aspect-square rounded-xl overflow-hidden flex relative">
                <div
                  className="flex-1"
                  style={{ backgroundColor: opt.colors[0] }}
                />
                <div
                  className="flex-1"
                  style={{ backgroundColor: opt.colors[1] }}
                />
                {active && (
                  <span className="absolute inset-0 flex items-center justify-center">
                    <span className="w-5 h-5 rounded-full bg-white/90 flex items-center justify-center">
                      <Check className="w-3 h-3 text-primary" />
                    </span>
                  </span>
                )}
              </div>
              <span
                className={`text-[10px] font-bold ${
                  active ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {opt.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}