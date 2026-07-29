import { Gem } from "lucide-react";
import { useEconomyStore } from "@/store/economyStore";

interface GemCounterProps {
  className?: string;
}

/**
 * Displays the current Gem balance from the economy store.
 * Automatically re-renders when the balance changes.
 */
export default function GemCounter({ className = "" }: GemCounterProps) {
  const gems = useEconomyStore((s) => s.gems);

  return (
    <div
      className={`flex items-center gap-1.5 bg-cyan-400/15 px-3 py-1.5 rounded-full ${className}`}
    >
      <Gem className="w-4 h-4 text-cyan-300 fill-cyan-300/20" />
      <span className="text-sm font-bold text-foreground tabular-nums">
        {gems.toLocaleString()}
      </span>
    </div>
  );
}