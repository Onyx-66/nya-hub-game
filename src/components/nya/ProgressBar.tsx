import { motion } from "framer-motion";

type ProgressBarColor = "primary" | "gold" | "gem" | "xp" | "destructive";
type ProgressBarHeight = "sm" | "md" | "lg";

interface ProgressBarProps {
  value: number; // 0-100
  color?: ProgressBarColor;
  height?: ProgressBarHeight;
  label?: string;
  showValue?: boolean;
  className?: string;
}

const colorClasses: Record<ProgressBarColor, string> = {
  primary: "from-pink-400 to-violet-400",
  gold: "from-amber-300 to-yellow-500",
  gem: "from-cyan-400 to-teal-500",
  xp: "from-emerald-400 to-green-500",
  destructive: "from-rose-500 to-red-600",
};

const heightClasses: Record<ProgressBarHeight, string> = {
  sm: "h-1.5",
  md: "h-2.5",
  lg: "h-4",
};

/**
 * Animated progress bar with customizable color, height, and optional label.
 */
export default function ProgressBar({
  value,
  color = "primary",
  height = "md",
  label,
  showValue = false,
  className = "",
}: ProgressBarProps) {
  const pct = Math.max(0, Math.min(100, value));

  return (
    <div className={className}>
      {(label || showValue) && (
        <div className="flex items-center justify-between mb-1">
          {label && (
            <span className="text-[11px] font-medium text-muted-foreground">
              {label}
            </span>
          )}
          {showValue && (
            <span className="text-[11px] font-bold text-foreground tabular-nums">
              {Math.round(pct)}%
            </span>
          )}
        </div>
      )}
      <div
        className={`w-full ${heightClasses[height]} rounded-full bg-muted overflow-hidden`}
      >
        <motion.div
          className={`h-full rounded-full bg-gradient-to-r ${colorClasses[color]}`}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}