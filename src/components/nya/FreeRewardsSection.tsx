import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { PawPrint, Gem, Play, Clock, Check } from "lucide-react";
import { adService } from "@/services/adService";
import { useEconomyStore } from "@/store/economyStore";

interface RewardButton {
  id: string;
  label: string;
  rewardType: "paws" | "gems";
  amount: number;
  cooldownMs: number;
  icon: typeof PawPrint;
  gradient: string;
}

const REWARDS: RewardButton[] = [
  {
    id: "ad-paws-25",
    label: "Watch Ad for 25 Paws",
    rewardType: "paws",
    amount: 25,
    cooldownMs: 30 * 60 * 1000, // 30 minutes
    icon: PawPrint,
    gradient: "from-pink-400 to-rose-500",
  },
  {
    id: "ad-gems-3",
    label: "Watch Ad for 3 Gems",
    rewardType: "gems",
    amount: 3,
    cooldownMs: 60 * 60 * 1000, // 60 minutes
    icon: Gem,
    gradient: "from-cyan-400 to-teal-500",
  },
];

function getCooldownEnd(id: string): number {
  try {
    const val = localStorage.getItem(`nya-cooldown-${id}`);
    return val ? parseInt(val, 10) : 0;
  } catch {
    return 0;
  }
}

function setCooldownEnd(id: string, ms: number): void {
  try {
    localStorage.setItem(`nya-cooldown-${id}`, String(ms));
  } catch {
    /* ignore */
  }
}

function formatRemaining(ms: number): string {
  const mins = Math.ceil(ms / 60000);
  if (mins >= 60) return `${Math.floor(mins / 60)}h ${mins % 60}m`;
  return `${mins}m`;
}

/**
 * "Free Rewards" section for the Store — rewarded ad buttons with cooldowns.
 */
export default function FreeRewardsSection() {
  const { addPaws, addGems } = useEconomyStore();
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [cooldowns, setCooldowns] = useState<Record<string, number>>({});
  const [rewardedId, setRewardedId] = useState<string | null>(null);

  // Tick every second to update cooldowns
  useEffect(() => {
    const update = () => {
      const now = Date.now();
      const next: Record<string, number> = {};
      for (const r of REWARDS) {
        const end = getCooldownEnd(r.id);
        if (end > now) next[r.id] = end - now;
      }
      setCooldowns(next);
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleWatch = async (reward: RewardButton) => {
    if (cooldowns[reward.id] || loadingId) return;
    if (adService.isAdRemoved()) return;

    setLoadingId(reward.id);
    const result = await adService.showRewarded();
    setLoadingId(null);

    if (result.success) {
      if (reward.rewardType === "paws") {
        addPaws(reward.amount, `Rewarded ad: ${reward.amount} paws`);
      } else {
        addGems(reward.amount);
      }
      setCooldownEnd(reward.id, Date.now() + reward.cooldownMs);
      setCooldowns((prev) => ({ ...prev, [reward.id]: reward.cooldownMs }));
      setRewardedId(reward.id);
      setTimeout(() => setRewardedId(null), 1500);
    }
  };

  if (adService.isAdRemoved()) return null;

  return (
    <section>
      <div className="flex items-center gap-2 mb-3">
        <Play className="w-4 h-4 text-primary" />
        <h3 className="font-heading font-bold text-sm text-foreground uppercase tracking-wide">
          Free Rewards
        </h3>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {REWARDS.map((reward) => {
          const remaining = cooldowns[reward.id] ?? 0;
          const isReady = !remaining && loadingId !== reward.id;
          const isLoading = loadingId === reward.id;
          const justRewarded = rewardedId === reward.id;
          const Icon = reward.icon;

          return (
            <motion.button
              key={reward.id}
              whileTap={isReady ? { scale: 0.95 } : undefined}
              onClick={() => handleWatch(reward)}
              disabled={!isReady || isLoading}
              className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${reward.gradient} p-4 flex flex-col items-center gap-2 shadow-lg min-h-[110px] ${
                !isReady ? "opacity-60" : ""
              }`}
            >
              <Icon className="w-7 h-7 text-white" />
              <span className="text-xs font-bold text-white text-center leading-tight">
                {justRewarded ? "Reward Claimed!" : reward.label}
              </span>
              {justRewarded && (
                <Check className="w-4 h-4 text-white" />
              )}
              {isLoading && !justRewarded && (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              )}
              {remaining > 0 && !justRewarded && (
                <span className="flex items-center gap-1 text-[10px] text-white/80">
                  <Clock className="w-3 h-3" />
                  {formatRemaining(remaining)}
                </span>
              )}
            </motion.button>
          );
        })}
      </div>
    </section>
  );
}