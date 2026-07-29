import type { GameMeta } from "@/types";

export const NYA_CRUSH_META: GameMeta = {
  id: "candy-crush",
  slug: "candy-crush",
  name: { en: "Nya Crush", ar: "سحق الحلوى" },
  description: {
    en: "Match three candies, trigger cascades, and crush your way to victory!",
    ar: "طابق ثلاث حلويات، فجر التتابعات، واهزم طريقك للنصر!",
  },
  icon: "",
  iconPath: "/assets/images/games/candy-crush/icon.svg",
  primaryColor: "#F472B6",
  difficulty: "medium",
  category: "puzzle",
  isComingSoon: false,
  displayName: "Nya Crush",
  arabicName: "سحق الحلوى",
  shortDescription: "Match-3 candy puzzle",
  bannerPath: "/assets/images/games/candy-crush/banner.png",
  isFeatured: false,
  maxLevels: 5,
  tutorialRequired: false,
  tags: ["puzzle", "match3", "candy", "casual"],
  releaseDate: "2026-07-29",
  version: "1.0.0",
};