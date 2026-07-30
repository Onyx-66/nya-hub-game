import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Flame, Clock, CheckCheck } from "lucide-react";
import NyaLayout from "@/components/nya/NyaLayout";
import ChallengeCard from "@/components/nya/ChallengeCard";
import { useChallengeStore } from "@/store/challengeStore";

function formatCountdown(ms: number): string {
  if (ms <= 0) return "Reset!";
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  return `${h}h ${m}m ${s}s`;
}

export default function ChallengesScreen() {
  const { challenges, streak, ensureDaily, claimAll } = useChallengeStore();
  const [countdown, setCountdown] = useState("");

  useEffect(() => {
    ensureDaily();
  }, [ensureDaily]);

  // Update countdown every second
  useEffect(() => {
    const tick = () => setCountdown(formatCountdown(useChallengeStore.getState().getMsUntilReset()));
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, []);

  const completed = challenges.filter((c) => c.completed).length;
  const total = challenges.length;
  const claimable = challenges.filter((c) => c.completed && !c.claimed).length;
  const allClaimed = challenges.length > 0 && challenges.every((c) => c.claimed);

  return (
    <NyaLayout title="Challenges">
      <div className="space-y-5">
        {/* Streak + Reset banner */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl bg-gradient-to-br from-violet-500/15 to-pink-500/10 border border-primary/30 p-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-orange-500/20 flex items-center justify-center">
                <Flame className="w-6 h-6 text-orange-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Daily Streak</p>
                <p className="font-heading font-bold text-2xl text-foreground">{streak} days</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Resets in</p>
              <p className="font-heading font-semibold text-sm text-foreground tabular-nums flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> {countdown}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Progress summary */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Completed Today</p>
            <p className="font-heading font-bold text-3xl text-foreground">
              {completed}
              <span className="text-lg text-muted-foreground">/{total}</span>
            </p>
          </div>
          {claimable > 0 && (
            <button
              onClick={() => claimAll()}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-pink-400 to-violet-400 text-white text-sm font-heading font-semibold shadow-lg shadow-pink-500/20 active:scale-95 transition-transform"
            >
              <CheckCheck className="w-4 h-4" /> Claim All ({claimable})
            </button>
          )}
        </div>

        {/* Progress bar */}
        <div className="h-3 rounded-full bg-muted overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-pink-400 to-violet-400"
            initial={{ width: 0 }}
            animate={{ width: `${total > 0 ? (completed / total) * 100 : 0}%` }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
          />
        </div>

        {/* Challenge cards */}
        <div className="space-y-3">
          {challenges.map((ch, i) => (
            <motion.div
              key={ch.templateId}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <ChallengeCard challenge={ch} />
            </motion.div>
          ))}
        </div>

        {allClaimed && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-6"
          >
            <p className="font-heading font-bold text-lg text-emerald-400">
              All Challenges Claimed!
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Come back tomorrow for new challenges.
            </p>
          </motion.div>
        )}
      </div>
    </NyaLayout>
  );
}