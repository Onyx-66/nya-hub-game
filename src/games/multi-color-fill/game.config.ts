import type { GameMeta } from "@/types";

export const MULTI_COLOR_FILL_META: GameMeta = {
  id: "multi-color-fill",
  slug: "multi-color-fill",
  name: { en: "Multi-Color Fill", ar: "تعبئة الألوان" },
  description: {
    en: "Draw colorful paths across the grid to connect matching nodes. Fill every tile and complete all connections to win!",
    ar: "ارسم مسارات ملونة عبر الشبكة لتوصيل العقد المتطابقة!",
  },
  icon: "",
  iconPath: "/assets/images/games/multi-color-fill/icon.svg",
  primaryColor: "#A78BFA",
  difficulty: "medium",
  category: "puzzle",
  isComingSoon: false,
  isFeatured: true,
  displayName: "Multi-Color Fill",
  arabicName: "تعبئة الألوان المتعددة",
  shortDescription: "Satisfying path-drawing puzzle",
  tags: ["puzzle", "paths", "colors", "logic"],
  releaseDate: "2026-07-30",
  version: "1.0.0",
};