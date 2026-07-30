import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, Gift, Check } from "lucide-react";
import { useEconomyStore } from "@/store/economyStore";
import {
  DAILY_BASE_REWARD,
  getDailyStatus,
  markDailyClaimed,
  formatCountdown,
} from "@/utils/dailyReward";

/**
 * Profile reward card — shows countdown timer until the next daily reward,
 * or a claim button when it's ready.
 */
export default function DailyRewardCard() {
  const { addPaws } = useEconomyStore();
  const [status, setStatus] = useState(getDailyStatus());

  // Tick every second to update the countdown
  useEffect(() => {
    const interval = setInterval(() => {
      setStatus(getDailyStatus());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleClaim = useCallback(() => {
    addPaws(DAILY_BASE_REWARD, `Daily bonus: ${DAILY_BASE_REWARD} paws`);
    markDailyClaimed();
    setStatus(getDailyStatus());
  }, [addPaws]);

  return (
    <div className="bg-card rounded-2xl p-4 border border-border/50 overflow-hidden relative">
      {/* glow accent */}
      <div className="absolute -right-8 -top-8 w-28 h-28 rounded-full bg-pink-400/10 blur-2xl pointer-events-none" />

      <div className="relative flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-pink-400/20 to-violet-400/20 flex items-center justify-center shrink-0">
          <Gift className="w-5 h-5 text-pink-400" />
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-heading font-semibold text-sm text-foreground">
            Daily Reward
          </p>
          <AnimatePresence mode="wait">
            {status.canClaim ? (
              <motion.p
                key="ready"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-xs text-pink-400 font-medium"
              >
                +{DAILY_BASE_REWARD} paws ready to claim!
              </motion.p>
            ) : (
              <motion.p
                key="waiting"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-xs text-muted-foreground flex items-center gap-1"
              >
                <Clock className="w-3 h-3" />
                {formatCountdown(status.msUntilNext)}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        <button
          onClick={handleClaim}
          disabled={!status.canClaim}
          className={`px-4 py-2 rounded-xl text-xs font-heading font-bold transition-all min-h-[44px] flex items-center gap-1.5 ${
            status.canClaim
              ? "bg-gradient-to-r from-pink-400 to-violet-400 text-white active:scale-95 shadow-lg"
              : "bg-muted/60 text-muted-foreground cursor-not-allowed"
          }`}
        >
          {status.canClaim ? (
            <>
              <Gift className="w-3.5 h-3.5" /> Claim
            </>
          ) : (
            <>
              <Check className="w-3.5 h-3.5" /> Claimed
            </>
          )}
        </button>
      </div>
    </div>
  );
}