import type { GameMeta } from "@/types";

export const SNAKE_GAME_META: GameMeta = {
  id: "snake",
  slug: "snake",
  name: { en: "Nya Snake", ar: "الثعبان القط" },
  description: {
    en: "Guide your feline snake through an enchanted garden. Collect treats, grow longer, and avoid obstacles. Features adorable cat-themed graphics and smooth controls.",
    ar: "وجّه ثعبانك القططي عبر حديقة مسحورة. اجمع المكافآت، انمُ أطول، وتجنّب العوائق. رسومات قطط لطيفة وتحكّم سلس.",
  },
  icon: "🐍",
  difficulty: "easy",
  category: "arcade",
  isComingSoon: false,
  displayName: "Nya Snake",
  arabicName: "الثعبان القط",
  shortDescription: "Classic snake with a feline twist",
  iconPath: "/assets/images/games/snake/icon.png",
  bannerPath: "/assets/images/games/snake/banner.png",
  isFeatured: true,
  maxLevels: 999,
  tutorialRequired: false,
  tags: ["arcade", "retro", "casual", "snake"],
  releaseDate: "2026-07-01",
  version: "1.0.0",
};