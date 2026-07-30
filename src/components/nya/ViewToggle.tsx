import { motion } from "framer-motion";
import { LayoutGrid, List, Grid3x3 } from "lucide-react";
import { usePreferencesStore, type GameViewMode } from "@/store/preferencesStore";
import { audioService } from "@/services/audioService";

const MODES: { id: GameViewMode; icon: typeof LayoutGrid; label: string }[] = [
  { id: "grid", icon: LayoutGrid, label: "Grid" },
  { id: "list", icon: List, label: "List" },
  { id: "compact", icon: Grid3x3, label: "Compact" },
];

export default function ViewToggle() {
  const viewMode = usePreferencesStore((s) => s.gameViewMode);
  const setViewMode = usePreferencesStore((s) => s.setGameViewMode);

  return (
    <div className="flex items-center gap-1 bg-muted/50 rounded-xl p-1">
      {MODES.map(({ id, icon: Icon, label }) => {
        const active = viewMode === id;
        return (
          <button
            key={id}
            onClick={() => {
              audioService.playSFX("button-click");
              setViewMode(id);
            }}
            className="relative flex items-center justify-center w-9 h-9 rounded-lg transition-colors"
            aria-label={label}
            aria-pressed={active}
          >
            {active && (
              <motion.div
                layoutId="view-toggle-active"
                className="absolute inset-0 bg-primary/20 rounded-lg"
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
              />
            )}
            <Icon
              className={`relative w-4 h-4 ${active ? "text-primary" : "text-muted-foreground"}`}
            />
          </button>
        );
      })}
    </div>
  );
}