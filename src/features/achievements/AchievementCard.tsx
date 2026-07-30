import { motion } from "framer-motion";
import { Lock, CheckCircle2, Sparkles } from "lucide-react";
import type { AchievementDef } from "@/data/achievementCatalog";
import { useAchievementStore } from "@/store/achievementStore";
import { ICON_MAP } from "./iconMap";

interface AchievementCardProps {
  achievement: AchievementDef;
  index?: number;
}

export default function AchievementCard({ achievement, index = 0 }: AchievementCardProps) {
  const isUnlocked = useAchievementStore((s) => s.unlocked.includes(achievement.id));
  const progressValue = useAchievementStore((s) => s.progress[achievement.metric] ?? 0);

  const Icon = achievement.isHidden && !isUnlocked
    ? Sparkles
    : (ICON_MAP[achievement.icon] ?? Award);

  const progressPct = Math.min(100, (progressValue / achievement.threshold) * 100);
  const showProgress = !isUnlocked && progressValue > 0 && !achievement.isHidden;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: Math.min(index * 0.02, 0.4) }}
      className={`rounded-2xl border p-3.5 flex flex-col gap-2 ${
        isUnlocked
          ? "bg-gradient-to-br from-card to-muted/30 border-primary/30 shadow-lg shadow-primary/5"
          : "bg-muted/20 border-border/30"
      }`}
    >
      {/* Top row: icon + name + status */}
      <div className="flex items-start gap-2.5">
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
            isUnlocked
              ? "bg-primary/15"
              : "bg-muted/40"
          }`}
        >
          {isUnlocked ? (
            <Icon className={`w-5 h-5 ${achievement.color}`} />
          ) : achievement.isHidden ? (
            <Lock className="w-4 h-4 text-muted-foreground/40" />
          ) : (
            <Lock className="w-4 h-4 text-muted-foreground/30" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <p
            className={`text-xs font-bold truncate ${
              isUnlocked ? "text-foreground" : "text-muted-foreground/60"
            }`}
          >
            {achievement.isHidden && !isUnlocked ? "???" : achievement.name}
          </p>
          <p className="text-[10px] text-muted-foreground line-clamp-2 leading-tight">
            {achievement.isHidden && !isUnlocked
              ? "Hidden achievement — keep playing to discover!"
              : achievement.description}
          </p>
        </div>

        {isUnlocked && (
          <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
        )}
      </div>

      {/* Progress bar */}
      {showProgress && (
        <div className="flex items-center gap-2">
          <div className="flex-1 h-1.5 rounded-full bg-muted/50 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-violet-400 to-fuchsia-400 transition-all"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <span className="text-[9px] text-muted-foreground font-semibold tabular-nums">
            {progressValue}/{achievement.threshold}
          </span>
        </div>
      )}

      {/* Rewards */}
      <div className="flex items-center gap-2 flex-wrap">
        {achievement.xpReward > 0 && (
          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md ${
            isUnlocked ? "bg-xp/15 text-xp" : "bg-muted/30 text-muted-foreground/50"
          }`}>
            +{achievement.xpReward} XP
          </span>
        )}
        {achievement.pawsReward > 0 && (
          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md ${
            isUnlocked ? "bg-gold/15 text-gold" : "bg-muted/30 text-muted-foreground/50"
          }`}>
            +{achievement.pawsReward} Paws
          </span>
        )}
        {achievement.gemsReward ? (
          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md ${
            isUnlocked ? "bg-gem/15 text-gem" : "bg-muted/30 text-muted-foreground/50"
          }`}>
            +{achievement.gemsReward} Gems
          </span>
        ) : null}
      </div>
    </motion.div>
  );
}