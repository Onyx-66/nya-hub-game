import { motion } from "framer-motion";
import { Gem } from "lucide-react";
import { useEconomyStore } from "@/store/economyStore";
import { formatNumber } from "@/utils/formatting";

interface GemCounterProps {
  className?: string;
}

/**
 * Displays the current Gem balance from the economy store.
 * Pops on change so the user sees the reward land.
 */
export default function GemCounter({ className = "" }: GemCounterProps) {
  const gems = useEconomyStore((s) => s.gems);

  return (
    <div
      aria-label={`${gems} Gems`}
      className={`flex items-center gap-1.5 bg-cyan-400/15 px-3 py-1.5 rounded-full ${className}`}
    >
      <Gem className="w-4 h-4 text-cyan-300 fill-cyan-300/20" />
      <motion.span
        key={gems}
        initial={{ scale: 1.35 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 500, damping: 18 }}
        className="text-sm font-bold text-foreground tabular-nums"
      >
        {formatNumber(gems)}
      </motion.span>
    </div>
  );
}