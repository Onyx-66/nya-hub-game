import { Coins, Gem } from "lucide-react";
import { usePlayerStore } from "@/store/usePlayerStore";

export default function TopBar() {
  const { name, avatar, level, xp, coins, gems } = usePlayerStore();
  const xpPct = Math.min(100, (xp / (level * 100)) * 100);

  return (
    <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/50">
      <div className="max-w-md mx-auto px-4 py-3 flex items-center gap-3">
        {/* avatar + level */}
        <div className="relative shrink-0">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center text-2xl shadow-lg">
            {avatar}
          </div>
          <span className="absolute -bottom-1.5 -right-1.5 bg-primary text-primary-foreground text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-background">
            {level}
          </span>
        </div>

        {/* name + xp bar */}
        <div className="flex-1 min-w-0">
          <p className="font-heading font-semibold text-sm text-foreground truncate">
            {name}
          </p>
          <div className="h-1.5 rounded-full bg-muted overflow-hidden mt-1">
            <div
              className="h-full rounded-full bg-gradient-to-r from-violet-500 to-pink-500 transition-all duration-500"
              style={{ width: `${xpPct}%` }}
            />
          </div>
        </div>

        {/* currencies */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-1 bg-muted/60 px-2.5 py-1.5 rounded-xl">
            <Coins className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
            <span className="text-xs font-bold text-foreground">{coins}</span>
          </div>
          <div className="flex items-center gap-1 bg-muted/60 px-2.5 py-1.5 rounded-xl">
            <Gem className="w-3.5 h-3.5 text-cyan-400 fill-cyan-400" />
            <span className="text-xs font-bold text-foreground">{gems}</span>
          </div>
        </div>
      </div>
    </header>
  );
}