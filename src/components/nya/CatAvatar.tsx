import { cn } from "@/lib/utils";

interface CatAvatarProps {
  avatarId: number;
  size?: number;
  className?: string;
}

/** 20 unique color combos mapped by avatarId (1-20). */
const AVATAR_COLORS: { bg: string; cat: string; accent: string }[] = [
  { bg: "#f472b6", cat: "#fef3c7", accent: "#fbbf24" }, // 1 pink
  { bg: "#a855f7", cat: "#fde68a", accent: "#f59e0b" }, // 2 purple
  { bg: "#22d3ee", cat: "#fef9c3", accent: "#facc15" }, // 3 cyan
  { bg: "#34d399", cat: "#fef3c7", accent: "#fbbf24" }, // 4 green
  { bg: "#f87171", cat: "#fef9c3", accent: "#facc15" }, // 5 red
  { bg: "#fb923c", cat: "#fef3c7", accent: "#f59e0b" }, // 6 orange
  { bg: "#818cf8", cat: "#fef9c3", accent: "#fbbf24" }, // 7 indigo
  { bg: "#2dd4bf", cat: "#fef3c7", accent: "#f59e0b" }, // 8 teal
  { bg: "#e879f9", cat: "#fef9c3", accent: "#facc15" }, // 9 fuchsia
  { bg: "#fbbf24", cat: "#7c2d12", accent: "#f97316" }, // 10 gold
  { bg: "#60a5fa", cat: "#fef3c7", accent: "#fbbf24" }, // 11 blue
  { bg: "#c084fc", cat: "#fef9c3", accent: "#facc15" }, // 12 violet
  { bg: "#4ade80", cat: "#fef3c7", accent: "#f59e0b" }, // 13 light green
  { bg: "#f9a8d4", cat: "#fef9c3", accent: "#facc15" }, // 14 light pink
  { bg: "#67e8f9", cat: "#fef3c7", accent: "#fbbf24" }, // 15 sky
  { bg: "#fde047", cat: "#7c2d12", accent: "#f97316" }, // 16 yellow
  { bg: "#a3e635", cat: "#fef9c3", accent: "#facc15" }, // 17 lime
  { bg: "#fb7185", cat: "#fef3c7", accent: "#fbbf24" }, // 18 rose
  { bg: "#8b5cf6", cat: "#fef9c3", accent: "#facc15" }, // 19 violet-dark
  { bg: "#06b6d4", cat: "#fef3c7", accent: "#f59e0b" }, // 20 dark cyan
];

/**
 * SVG cat avatar — renders a simple cat face silhouette.
 * 20 unique color combinations, no emojis.
 */
export default function CatAvatar({
  avatarId,
  size = 32,
  className,
}: CatAvatarProps) {
  const idx = ((avatarId - 1) % AVATAR_COLORS.length + AVATAR_COLORS.length) % AVATAR_COLORS.length;
  const { bg, cat, accent } = AVATAR_COLORS[idx];

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      className={cn("rounded-full shrink-0", className)}
      aria-hidden="true"
    >
      {/* background circle */}
      <circle cx="32" cy="32" r="32" fill={bg} />

      {/* cat ears */}
      <path d="M16 18 L12 8 L24 14 Z" fill={cat} />
      <path d="M48 18 L52 8 L40 14 Z" fill={cat} />
      {/* inner ears */}
      <path d="M17 16 L15 11 L21 14 Z" fill={accent} opacity="0.5" />
      <path d="M47 16 L49 11 L43 14 Z" fill={accent} opacity="0.5" />

      {/* cat face */}
      <ellipse cx="32" cy="36" rx="20" ry="18" fill={cat} />

      {/* eyes */}
      <ellipse cx="24" cy="32" rx="2.5" ry="4" fill="#1a1a2e" />
      <ellipse cx="40" cy="32" rx="2.5" ry="4" fill="#1a1a2e" />
      {/* eye highlights */}
      <circle cx="25" cy="31" r="0.8" fill="#ffffff" />
      <circle cx="41" cy="31" r="0.8" fill="#ffffff" />

      {/* nose */}
      <path d="M30 40 L32 42 L34 40 Z" fill={accent} />

      {/* whiskers */}
      <line x1="10" y1="36" x2="20" y2="38" stroke={cat} strokeWidth="0.8" opacity="0.6" />
      <line x1="10" y1="40" x2="20" y2="40" stroke={cat} strokeWidth="0.8" opacity="0.6" />
      <line x1="44" y1="38" x2="54" y2="36" stroke={cat} strokeWidth="0.8" opacity="0.6" />
      <line x1="44" y1="40" x2="54" y2="40" stroke={cat} strokeWidth="0.8" opacity="0.6" />

      {/* mouth */}
      <path d="M28 43 Q32 46 36 43" stroke="#1a1a2e" strokeWidth="1" fill="none" />
    </svg>
  );
}