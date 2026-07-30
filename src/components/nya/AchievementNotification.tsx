import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles } from "lucide-react";
import { useAchievementStore } from "@/store/achievementStore";
import { usePreferencesStore } from "@/store/preferencesStore";
import { ACHIEVEMENT_MAP } from "@/data/achievementCatalog";
import { ICON_MAP } from "@/features/achievements/iconMap";

/**
 * Global achievement unlock notification.
 * Shows a sliding popup from the top when achievements are unlocked.
 * Auto-dismisses after 4 seconds. Multiple unlocks queue sequentially.
 */
export default function AchievementNotification() {
  const notificationQueue = useAchievementStore((s) => s.notificationQueue);
  const dismiss = useAchievementStore((s) => s.dismissNotification);
  const achievementsEnabled = usePreferencesStore((s) => s.notifications.achievements);
  const [visible, setVisible] = useState(false);

  const currentId = notificationQueue[0];
  const achievement = currentId ? ACHIEVEMENT_MAP[currentId] : null;

  useEffect(() => {
    if (achievement) {
      // If user disabled achievement notifications, auto-dismiss without showing
      if (!achievementsEnabled) {
        dismiss();
        return;
      }
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        setTimeout(dismiss, 300);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [achievement, dismiss, achievementsEnabled]);

  if (!achievement || !achievementsEnabled) return null;

  const Icon = achievement.isHidden ? Sparkles : (ICON_MAP[achievement.icon] ?? Sparkles);

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] flex justify-center pointer-events-none px-4 pt-4">
      <AnimatePresence>
        {visible && (
          <motion.div
            initial={{ y: -120, opacity: 0, scale: 0.9 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -120, opacity: 0, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="pointer-events-auto w-full max-w-sm"
          >
            <div className="bg-gradient-to-r from-violet-500/95 to-fuchsia-500/95 backdrop-blur-xl rounded-2xl shadow-2xl shadow-violet-500/30 border border-white/20 overflow-hidden">
              <div className="flex items-center gap-3 p-3.5">
                {/* Icon */}
                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                  <Icon className={`w-6 h-6 text-white`} />
                </div>

                {/* Text */}
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-heading font-bold text-white/70 uppercase tracking-wider">
                    Achievement Unlocked!
                  </p>
                  <p className="font-heading font-bold text-sm text-white truncate">
                    {achievement.isHidden ? "???" : achievement.name}
                  </p>
                  <p className="text-[11px] text-white/80 truncate">
                    {achievement.isHidden ? "Hidden achievement" : achievement.description}
                  </p>
                </div>

                {/* Rewards */}
                <div className="flex flex-col items-end gap-0.5 shrink-0">
                  {achievement.xpReward > 0 && (
                    <span className="text-[10px] font-bold text-white/90">
                      +{achievement.xpReward} XP
                    </span>
                  )}
                  {achievement.pawsReward > 0 && (
                    <span className="text-[10px] font-bold text-white/90">
                      +{achievement.pawsReward} Paws
                    </span>
                  )}
                  {achievement.gemsReward ? (
                    <span className="text-[10px] font-bold text-white/90">
                      +{achievement.gemsReward} Gems
                    </span>
                  ) : null}
                </div>

                {/* Close */}
                <button
                  onClick={() => {
                    setVisible(false);
                    setTimeout(dismiss, 300);
                  }}
                  className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center shrink-0 hover:bg-white/20 transition-colors"
                  aria-label="Dismiss"
                >
                  <X className="w-4 h-4 text-white/70" />
                </button>
              </div>

              {/* Progress bar (auto-dismiss timer) */}
              <motion.div
                initial={{ width: "100%" }}
                animate={{ width: "0%" }}
                transition={{ duration: 4, ease: "linear" }}
                className="h-0.5 bg-white/40"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}