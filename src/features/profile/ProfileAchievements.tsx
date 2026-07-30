import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Lock, ChevronRight, Trophy } from "lucide-react";
import { ACHIEVEMENTS, ACHIEVEMENT_MAP, CATEGORIES, CATEGORY_META } from "@/data/achievementCatalog";
import { useAchievementStore } from "@/store/achievementStore";
import { ICON_MAP } from "@/features/achievements/iconMap";

export default function ProfileAchievements() {
  const navigate = useNavigate();
  const unlocked = useAchievementStore((s) => s.unlocked);
  const getCountByCategory = useAchievementStore((s) => s.getCountByCategory);

  const totalUnlocked = unlocked.length;
  const totalAchievements = ACHIEVEMENTS.length;
  const overallPct = Math.round((totalUnlocked / totalAchievements) * 100);

  // Show last 4 unlocked achievements
  const recentUnlocks = unlocked.slice(-4).reverse();

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-heading font-bold text-lg text-foreground">Achievements</h3>
        <button
          onClick={() => navigate("/achievements")}
          className="flex items-center gap-0.5 text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
        >
          View All
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Overall progress bar */}
      <div className="rounded-2xl bg-muted/30 border border-border/30 p-3">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-semibold text-muted-foreground">
            {totalUnlocked} / {totalAchievements} Unlocked
          </span>
          <span className="text-xs font-bold text-primary">{overallPct}%</span>
        </div>
        <div className="h-2 rounded-full bg-muted/50 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${overallPct}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="h-full rounded-full bg-gradient-to-r from-violet-400 to-fuchsia-400"
          />
        </div>
      </div>

      {/* Category breakdown */}
      <div className="grid grid-cols-4 gap-2">
        {CATEGORIES.map((cat) => {
          const meta = CATEGORY_META[cat];
          const Icon = ICON_MAP[meta.icon] ?? Trophy;
          const { unlocked: u, total: t } = getCountByCategory(cat);
          return (
            <div
              key={cat}
              className="rounded-xl bg-muted/20 border border-border/20 p-2 flex flex-col items-center gap-1"
            >
              <Icon className={`w-4 h-4 ${meta.color}`} />
              <span className="text-[9px] font-bold text-foreground tabular-nums">
                {u}/{t}
              </span>
              <span className="text-[8px] text-muted-foreground text-center leading-tight">
                {meta.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Recent unlocks */}
      {recentUnlocks.length > 0 ? (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-muted-foreground">Recent Unlocks</p>
          <div className="grid grid-cols-2 gap-2">
            {recentUnlocks.map((id, i) => {
              const ach = ACHIEVEMENT_MAP[id];
              if (!ach) return null;
              const Icon = ICON_MAP[ach.icon] ?? Trophy;
              return (
                <motion.div
                  key={id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="rounded-xl bg-card border border-border/40 p-2.5 flex items-center gap-2"
                >
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Icon className={`w-4 h-4 ${ach.color}`} />
                  </div>
                  <p className="text-[10px] font-bold text-foreground truncate">
                    {ach.name}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="text-center py-4">
          <Lock className="w-6 h-6 text-muted-foreground/30 mx-auto mb-1" />
          <p className="text-xs text-muted-foreground">
            Play games to unlock achievements!
          </p>
        </div>
      )}
    </div>
  );
}