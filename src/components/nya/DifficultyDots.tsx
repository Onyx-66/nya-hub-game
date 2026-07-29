import { cn } from "@/lib/utils";

type Difficulty = "easy" | "medium" | "hard";

const DOT_COLORS: Record<Difficulty, string[]> = {
  easy: ["bg-emerald-400", "bg-slate-600", "bg-slate-600"],
  medium: ["bg-amber-400", "bg-amber-400", "bg-slate-600"],
  hard: ["bg-rose-400", "bg-rose-400", "bg-rose-400"],
};

interface DifficultyDotsProps {
  difficulty: Difficulty;
  variant?: "dark" | "light";
  className?: string;
}

const DOT_COLORS_LIGHT: Record<Difficulty, string[]> = {
  easy: ["bg-emerald-400", "bg-white/20", "bg-white/20"],
  medium: ["bg-amber-400", "bg-amber-400", "bg-white/20"],
  hard: ["bg-rose-400", "bg-rose-400", "bg-rose-400"],
};

/**
 * Reusable difficulty indicator — 3 small colored circles.
 * Easy: 1 green · Medium: 2 yellow · Hard: 3 red
 * Use variant="light" on dark/colored backgrounds.
 */
export default function DifficultyDots({
  difficulty,
  variant = "dark",
  className,
}: DifficultyDotsProps) {
  const palette = variant === "light" ? DOT_COLORS_LIGHT : DOT_COLORS;
  const colors = palette[difficulty] ?? palette.medium;

  return (
    <div className={cn("flex items-center gap-1", className)}>
      {colors.map((color, i) => (
        <span
          key={i}
          className={cn("w-2 h-2 rounded-full", color)}
          aria-hidden="true"
        />
      ))}
    </div>
  );
}