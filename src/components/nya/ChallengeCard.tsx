import { motion } from "framer-motion";
import { Check, Gift } from "lucide-react";
import { CHALLENGE_MAP } from "@/data/challengeCatalog";
import { ICON_MAP } from "@/features/achievements/iconMap";
import type { DailyChallenge } from "@/data/challengeCatalog";
import { useChallengeStore } from "@/store/challengeStore";
import { audioService } from "@/services/audioService";

interface ChallengeCardProps {
  challenge: DailyChallenge;
  compact?: boolean;
}

export default function ChallengeCard({ challenge, compact = false }: ChallengeCardProps) {
  const tmpl = CHALLENGE_MAP[challenge.templateId];
  const claim = useChallengeStore((s) => s.claim);
  if (!tmpl) return null;

  const Icon = ICON_MAP[tmpl.icon] ?? ICON_MAP.Target;
  const pct = Math.min(100, (challenge.progress / tmpl.target) * 100);
  const canClaim = challenge.completed && !challenge.claimed;

  const handleClaim = () => {
    audioService.playSFX("button-click");
    claim(challenge.templateId);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative rounded-2xl border p-3 transition-colors ${
        challenge.claimed
          ? "border-emerald-500/30 bg-emerald-500/5"
          : canClaim
            ? "border-primary/60 bg-primary/10 shadow-lg shadow-primary/10"
            : "border-border bg-card"
      } ${compact ? "min-h-[88px]" : "min-h-[110px]"}`}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div
          className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center bg-muted/60 ${
            challenge.claimed ? "opacity-40" : ""
          }`}
        >
          <Icon className={`w-5 h-5 ${tmpl.color}`} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h4 className="font-heading font-semibold text-sm text-foreground truncate">
              {tmpl.title}
            </h4>
            {challenge.claimed && (
              <span className="shrink-0 flex items-center gap-0.5 text-xs text-emerald-400 font-semibold">
                <Check className="w-3.5 h-3.5" /> Done
              </span>
            )}
          </div>
          {!compact && (
            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
              {tmpl.description}
            </p>
          )}

          {/* Progress bar */}
          <div className="mt-2 flex items-center gap-2">
            <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
              <motion.div
                className={`h-full rounded-full ${
                  challenge.claimed
                    ? "bg-emerald-500"
                    : "bg-gradient-to-r from-pink-400 to-violet-400"
                }`}
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
              />
            </div>
            <span className="text-[10px] font-heading font-medium text-muted-foreground shrink-0 tabular-nums">
              {Math.min(challenge.progress, tmpl.target)}/{tmpl.target}
            </span>
          </div>

          {/* Rewards + Claim */}
          <div className="mt-2 flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-semibold text-yellow-400">+{tmpl.xpReward} XP</span>
              <span className="text-[10px] font-semibold text-amber-400">+{tmpl.pawsReward} Paws</span>
              {tmpl.gemsReward && (
                <span className="text-[10px] font-semibold text-cyan-400">+{tmpl.gemsReward} Gems</span>
              )}
            </div>
            {canClaim && (
              <button
                onClick={handleClaim}
                className="flex items-center gap-1 px-3 py-1 rounded-xl bg-gradient-to-r from-pink-400 to-violet-400 text-white text-xs font-heading font-semibold shadow-md shadow-pink-500/20 active:scale-95 transition-transform"
              >
                <Gift className="w-3.5 h-3.5" /> Claim
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}