import {
  Droplet,
  PaintBucket,
  LayoutGrid,
  Feather,
  Sword,
  Gem,
  Palette,
  PawPrint,
  Cat,
} from "lucide-react";
import type { ComponentType, CSSProperties } from "react";

export type GameIconComp = ComponentType<{
  className?: string;
  style?: CSSProperties;
}>;

/**
 * Maps game slugs to their Lucide icon component.
 * Shared across GameCard, FeaturedBanner, and GameWrapper.
 */
export const GAME_SLUG_ICONS: Record<string, GameIconComp> = {
  snake: Droplet,
  "water-sort": PaintBucket,
  meowdoku: LayoutGrid,
  "angry-birds": Feather,
  "quiz-sword": Sword,
  "block-blast": LayoutGrid,
  "candy-crush": Gem,
  coloring: Palette,
  "multi-color-fill": Palette,
  "paws-merge": PawPrint,
  "whiskers-runner": Cat,
  "sword-of-knowledge": Sword,
  "drawing-coloring": Palette,
};

/** Returns the icon for a game slug, or null if none is defined. */
export function getGameIcon(slug: string): GameIconComp | null {
  return GAME_SLUG_ICONS[slug] ?? null;
}