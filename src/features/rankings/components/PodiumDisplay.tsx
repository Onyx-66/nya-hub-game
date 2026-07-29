import { motion } from "framer-motion";
import { Crown } from "lucide-react";
import { type RankEntry } from "@/services/leaderboardData";
import CatAvatar from "@/components/nya/CatAvatar";

interface PodiumDisplayProps {
  podium: RankEntry[]; // [1st, 2nd, 3rd] in rank order
}

const PLACE_CONFIG = [
  {
    // 1st place
    height: "h-28",
    avatarSize: "w-16 h-16",
    avatarText: "text-4xl",
    border: "border-yellow-400",
    crownColor: "text-yellow-400",
    stepGradient: "from-yellow-400 to-amber-600",
    delay: 0,
  },
  {
    // 2nd place
    height: "h-20",
    avatarSize: "w-12 h-12",
    avatarText: "text-2xl",
    border: "border-gray-300",
    crownColor: "text-gray-300",
    stepGradient: "from-gray-300 to-gray-500",
    delay: 0.2,
  },
  {
    // 3rd place
    height: "h-16",
    avatarSize: "w-12 h-12",
    avatarText: "text-2xl",
    border: "border-orange-400",
    crownColor: "text-orange-400",
    stepGradient: "from-orange-400 to-orange-700",
    delay: 0.4,
  },
];

// Visual order on screen: 2nd, 1st, 3rd
const VISUAL_ORDER = [1, 0, 2];

const CONFETTI_COLORS = [
  "#fbbf24", "#f472b6", "#a855f7", "#22d3ee", "#34d399", "#f87171",
];

function Confetti() {
  return (
    <div className="absolute inset-x-0 -top-2 h-0 pointer-events-none">
      {Array.from({ length: 12 }).map((_, i) => {
        const left = 10 + (i * 8) % 80;
        const delay = (i % 6) * 0.2;
        const duration = 1.4 + (i % 4) * 0.25;
        return (
          <motion.span
            key={i}
            className="absolute block w-2 h-2 rounded-full"
            style={{
              left: `${left}%`,
              backgroundColor: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
            }}
            initial={{ y: 0, opacity: 0 }}
            animate={{ y: [0, 60, 90], opacity: [0, 1, 0], rotate: 180 }}
            transition={{
              duration,
              delay,
              repeat: Infinity,
              repeatDelay: 0.4,
              ease: "easeOut",
            }}
          />
        );
      })}
    </div>
  );
}

export default function PodiumDisplay({ podium }: PodiumDisplayProps) {
  if (podium.length < 3) return null;

  return (
    <div className="flex items-end justify-center gap-2 pt-6 px-2">
      {VISUAL_ORDER.map((placeIdx, visualPos) => {
        const entry = podium[placeIdx];
        if (!entry) return null;
        const cfg = PLACE_CONFIG[placeIdx];

        return (
          <motion.div
            key={entry.id}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: cfg.delay,
              type: "spring",
              stiffness: 260,
              damping: 20,
            }}
            className="flex-1 flex flex-col items-center max-w-[120px]"
          >
            {/* crown */}
            <Crown
              className={`w-5 h-5 mb-1 ${cfg.crownColor}`}
              fill="currentColor"
            />

            {/* avatar */}
            <div className="relative">
              {placeIdx === 0 && <Confetti />}
              <div
                className={`${cfg.avatarSize} rounded-full bg-card flex items-center justify-center border-2 ${cfg.border} ${
                  entry.isYou ? "ring-2 ring-primary ring-offset-2 ring-offset-background" : ""
                }`}
              >
                <CatAvatar avatarId={entry.avatarId} size={placeIdx === 0 ? 56 : 44} />
              </div>
              {entry.isYou && (
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[8px] font-bold px-1.5 py-0.5 rounded-full whitespace-nowrap">
                  You
                </span>
              )}
            </div>

            {/* name + score */}
            <span className="text-[11px] font-bold text-foreground truncate max-w-full mt-2">
              {entry.pseudonym}
            </span>
            <span className="text-[10px] text-muted-foreground mb-1">
              {entry.score.toLocaleString()}
            </span>

            {/* podium step */}
            <div
              className={`w-full ${cfg.height} rounded-t-2xl bg-gradient-to-b ${cfg.stepGradient} flex items-start justify-center pt-2`}
            >
              <span className="font-display font-bold text-white text-lg">
                {placeIdx + 1}
              </span>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}