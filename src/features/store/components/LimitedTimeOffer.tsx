import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Clock, Zap, Lock } from "lucide-react";
import type { StoreItem } from "./storeCatalog";

interface LimitedTimeOfferProps {
  item: StoreItem;
  /** Duration in hours for the countdown */
  durationHours: number;
  onPurchase: (item: StoreItem) => void;
}

function formatTime(ms: number): string {
  if (ms <= 0) return "Expired";
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export default function LimitedTimeOffer({
  item,
  durationHours,
  onPurchase,
}: LimitedTimeOfferProps) {
  const [timeLeft, setTimeLeft] = useState(durationHours * 3600 * 1000);

  const tick = useCallback(() => {
    setTimeLeft((prev) => {
      if (prev <= 1000) {
        // Reset the cycle when it hits zero
        return durationHours * 3600 * 1000;
      }
      return prev - 1000;
    });
  }, [durationHours]);

  useEffect(() => {
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [tick]);

  const Icon = item.icon;
  const expired = timeLeft <= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative rounded-3xl overflow-hidden border border-accent/40 shadow-xl"
    >
      {/* Animated gradient background */}
      <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient}`} />
      <motion.div
        className="absolute inset-0 opacity-20"
        style={{
          background: "linear-gradient(120deg, transparent 30%, rgba(255,255,255,0.4) 50%, transparent 70%)",
          backgroundSize: "200% 100%",
        }}
        animate={{ backgroundPosition: ["200% 0", "-200% 0"] }}
        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
      />

      <div className="relative z-10 p-4 flex items-center gap-4 text-white">
        {/* Icon */}
        <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shrink-0">
          <Icon className="w-7 h-7" />
        </div>

        {/* Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="bg-white/25 backdrop-blur-sm text-[9px] font-bold uppercase px-2 py-0.5 rounded-full leading-none flex items-center gap-0.5">
              <Zap className="w-2.5 h-2.5" /> Limited
            </span>
            {item.badge && (
              <span className="bg-white text-black text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full leading-none">
                {item.badge}
              </span>
            )}
          </div>
          <h4 className="font-heading font-bold text-sm mt-1 truncate">{item.name}</h4>
          <p className="text-[11px] text-white/80 line-clamp-1">{item.description}</p>

          {/* Countdown */}
          <div className="flex items-center gap-1.5 mt-1.5">
            <Clock className="w-3 h-3 text-white/80" />
            <span className="text-xs font-bold tabular-nums tracking-wider">
              {formatTime(timeLeft)}
            </span>
          </div>
        </div>

        {/* Price button */}
        <button
          onClick={() => !expired && onPurchase(item)}
          disabled={expired}
          className="flex flex-col items-center justify-center gap-0.5 bg-white/25 hover:bg-white/35 backdrop-blur-sm rounded-2xl min-w-[64px] min-h-[56px] px-3 transition-all active:scale-95 disabled:opacity-50"
        >
          <Lock className="w-3.5 h-3.5" />
          <span className="text-xs font-bold">${item.cost.toFixed(2)}</span>
        </button>
      </div>
    </motion.div>
  );
}