import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PawPrint, Gift, Play, X } from "lucide-react";
import { adService } from "@/services/adService";
import { useEconomyStore } from "@/store/economyStore";
import { useAchievementStore } from "@/store/achievementStore";
import { useChallengeStore } from "@/store/challengeStore";
import {
  DAILY_BASE_REWARD,
  DAILY_AD_REWARD,
  getDailyStatus,
  markDailyClaimed,
} from "@/utils/dailyReward";

const BASE_REWARD = DAILY_BASE_REWARD;
const AD_REWARD = DAILY_AD_REWARD;

/**
 * Daily bonus popup — shows on first app open each day.
 * Offers "Claim 50 Paws" or "Watch Ad for 150 Paws".
 */
export default function DailyBonus() {
  const { addPaws } = useEconomyStore();
  const [visible, setVisible] = useState(false);
  const [watching, setWatching] = useState(false);

  useEffect(() => {
    // Show after a brief delay so it doesn't jank on initial load
    const timer = setTimeout(() => {
      if (getDailyStatus().canClaim) setVisible(true);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const handleClaim = (amount: number) => {
    addPaws(amount, `Daily bonus: ${amount} paws`);
    markDailyClaimed();
    const ach = useAchievementStore.getState();
    ach.addProgress("pawsEarned", amount);
    ach.addProgress("dailyBonuses", 1);
    useChallengeStore.getState().addProgress("pawsEarned", amount);
    setVisible(false);
  };

  const handleWatchAd = async () => {
    if (watching) return;
    setWatching(true);
    const result = await adService.showRewarded();
    setWatching(false);
    if (result.success) {
      handleClaim(AD_REWARD);
    }
  };

  const handleClose = () => {
    // Don't mark as claimed — user can see it again until they claim
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-6"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.85, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.85, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 24 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-sm bg-card rounded-3xl p-6 shadow-2xl border border-border/50"
          >
            <button
              onClick={handleClose}
              className="absolute top-3 right-3 w-9 h-9 rounded-full bg-muted/60 flex items-center justify-center hover:bg-muted transition-colors"
              aria-label="Close"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>

            {/* icon */}
            <div className="flex justify-center mb-4">
              <motion.div
                animate={{ rotate: [0, -10, 10, 0], scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-400 to-violet-500 flex items-center justify-center shadow-lg"
              >
                <Gift className="w-8 h-8 text-white" />
              </motion.div>
            </div>

            <h2 className="font-heading font-bold text-xl text-center text-foreground mb-1">
              Daily Bonus!
            </h2>
            <p className="text-sm text-muted-foreground text-center mb-5">
              Claim your free daily paws or watch an ad for more!
            </p>

            {/* reward buttons */}
            <div className="space-y-3">
              <button
                onClick={() => handleClaim(BASE_REWARD)}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-pink-400 to-rose-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-transform min-h-[48px]"
              >
                <PawPrint className="w-4 h-4" />
                Claim {BASE_REWARD} Paws
              </button>

              <button
                onClick={handleWatchAd}
                disabled={watching || adService.isAdRemoved()}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-violet-500 to-purple-600 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-transform min-h-[48px] disabled:opacity-60"
              >
                {watching ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Play className="w-4 h-4 fill-white" />
                )}
                Watch Ad for {AD_REWARD} Paws
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}