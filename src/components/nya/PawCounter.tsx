import { motion } from "framer-motion";
import { PawPrint } from "lucide-react";
import { useEconomyStore } from "@/store/economyStore";
import { formatNumber } from "@/utils/formatting";

interface PawCounterProps {
  className?: string;
}

/**
 * Displays the current Paw balance from the economy store.
 * Pops on change so the user sees the reward land.
 */
export default function PawCounter({ className = "" }: PawCounterProps) {
  const paws = useEconomyStore((s) => s.paws);

  return (
    <div
      aria-label={`${paws} Paws`}
      className={`flex items-center gap-1.5 bg-pink-400/15 px-3 py-1.5 rounded-full ${className}`}
    >
      <PawPrint className="w-4 h-4 text-pink-400 fill-pink-400/20" />
      <motion.span
        key={paws}
        initial={{ scale: 1.35 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 500, damping: 18 }}
        className="text-sm font-bold text-foreground tabular-nums"
      >
        {formatNumber(paws)}
      </motion.span>
    </div>
  );
}