import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronRight, Flame, Target } from "lucide-react";
import { useChallengeStore } from "@/store/challengeStore";

/**
 * Compact daily-challenge banner for the hub.
 * Shows streak, progress, and a CTA to the full Challenges screen.
 */
export default function HubChallengeBanner() {
  const navigate = useNavigate();
  const { challenges, streak, ensureDaily } = useChallengeStore();

  useEffect(() => {
    ensureDaily();
  }, [ensureDaily]);

  if (challenges.length === 0) return null;

  const completed = challenges.filter((c) => c.completed).length;
  const total = challenges.length;
  const pct = Math.round((completed / total) * 100);
  const allDone = completed === total;

  return (
    <motion.button
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      whileTap={{ scale: 0.97 }}
      onClick={() => navigate("/challenges")}
      className="w-full text-left rounded-2xl bg-gradient-to-br from-violet-500/20 to-pink-500/15 border border-primary/30 p-4 active:scale-[0.98] transition-transform"
    >
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-primary/20 flex items-center justify-center">
            <Target className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="font-heading font-bold text-sm text-foreground">
              Daily Challenges
            </p>
            <div className="flex items-center gap-1.5">
              {streak > 0 && (
                <span className="flex items-center gap-0.5 text-xs text-orange-400 font-semibold">
                  <Flame className="w-3 h-3" /> {streak} day streak
                </span>
              )}
              {streak === 0 && (
                <span className="text-xs text-muted-foreground">
                  {allDone ? "All done!" : "Complete for rewards"}
                </span>
              )}
            </div>
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-muted-foreground" />
      </div>

      {/* Progress bar */}
      <div className="flex items-center gap-2.5">
        <div className="flex-1 h-2.5 rounded-full bg-muted overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-pink-400 to-violet-400"
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
          />
        </div>
        <span className="text-sm font-heading font-bold text-foreground tabular-nums">
          {completed}/{total}
        </span>
      </div>
    </motion.button>
  );
}