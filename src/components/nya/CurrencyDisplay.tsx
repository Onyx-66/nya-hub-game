import { motion, AnimatePresence } from "framer-motion";
import { PawPrint, Gem } from "lucide-react";
import { useEconomyStore } from "@/store/economyStore";

type CurrencyVariant = "paws" | "gems";

interface CurrencyDisplayProps {
  variant: CurrencyVariant;
  className?: string;
}

const config = {
  paws: {
    icon: PawPrint,
    iconClass: "text-pink-400 fill-pink-400/20",
    bg: "bg-pink-400/15",
  },
  gems: {
    icon: Gem,
    iconClass: "text-cyan-300 fill-cyan-300/20",
    bg: "bg-cyan-400/15",
  },
};

/**
 * Unified currency display for Paws or Gems.
 * Subscribes live to the economy store and pulses when the balance changes.
 */
export default function CurrencyDisplay({
  variant,
  className = "",
}: CurrencyDisplayProps) {
  const value = useEconomyStore((s) => (variant === "paws" ? s.paws : s.gems));
  const { icon: Icon, iconClass, bg } = config[variant];

  return (
    <div className={`flex items-center gap-1.5 ${bg} px-3 py-1.5 rounded-full ${className}`}>
      <Icon className={`w-4 h-4 ${iconClass}`} />
      <AnimatePresence mode="popLayout">
        <motion.span
          key={value}
          initial={{ scale: 1.4, opacity: 0.6 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 500, damping: 15 }}
          className="text-sm font-bold text-foreground tabular-nums"
        >
          {value.toLocaleString()}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}