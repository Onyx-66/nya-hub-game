import { PawPrint } from "lucide-react";
import { useEconomyStore } from "@/store/economyStore";

interface PawCounterProps {
  className?: string;
}

/**
 * Displays the current Paw balance from the economy store.
 * Automatically re-renders when the balance changes.
 */
export default function PawCounter({ className = "" }: PawCounterProps) {
  const paws = useEconomyStore((s) => s.paws);

  return (
    <div
      className={`flex items-center gap-1.5 bg-pink-400/15 px-3 py-1.5 rounded-full ${className}`}
    >
      <PawPrint className="w-4 h-4 text-pink-400 fill-pink-400/20" />
      <span className="text-sm font-bold text-foreground tabular-nums">
        {paws.toLocaleString()}
      </span>
    </div>
  );
}