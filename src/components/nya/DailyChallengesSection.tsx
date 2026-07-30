import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronRight, Flame } from "lucide-react";
import { useChallengeStore } from "@/store/challengeStore";
import ChallengeCard from "@/components/nya/ChallengeCard";

export default function DailyChallengesSection() {
  const navigate = useNavigate();
  const { challenges, streak, ensureDaily } = useChallengeStore();

  useEffect(() => {
    ensureDaily();
  }, [ensureDaily]);

  if (challenges.length === 0) return null;

  const completed = challenges.filter((c) => c.completed).length;
  const total = challenges.length;
  const allDone = completed === total;

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h3 className="font-heading font-bold text-lg text-foreground">Daily Challenges</h3>
          {streak > 0 && (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-orange-500/15 text-orange-400 text-xs font-semibold">
              <Flame className="w-3.5 h-3.5" /> {streak}
            </span>
          )}
        </div>
        <button
          onClick={() => navigate("/challenges")}
          className="flex items-center gap-0.5 text-sm text-primary hover:text-primary/80 transition-colors"
        >
          View All <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Summary bar */}
      <div className="flex items-center gap-3 mb-3">
        <div className="flex-1 h-2.5 rounded-full bg-muted overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-pink-400 to-violet-400"
            initial={{ width: 0 }}
            animate={{ width: `${(completed / total) * 100}%` }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
          />
        </div>
        <span className="text-sm font-heading font-semibold text-foreground tabular-nums">
          {completed}/{total}
        </span>
      </div>

      {/* Challenge cards — show first 3 */}
      <div className="space-y-2.5">
        {challenges.slice(0, 3).map((ch) => (
          <ChallengeCard key={ch.templateId} challenge={ch} compact />
        ))}
      </div>

      {allDone && (
        <p className="text-center text-sm text-emerald-400 font-heading font-semibold mt-3">
          🎉 All challenges complete! Come back tomorrow!
        </p>
      )}
    </motion.section>
  );
}