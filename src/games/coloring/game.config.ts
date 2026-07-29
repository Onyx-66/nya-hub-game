import type { GameMeta } from "@/types";

export const COLORING_META: GameMeta = {
  id: "coloring",
  slug: "coloring",
  name: { en: "Cat Coloring Book", ar: "كتاب تلوين القطط" },
  description: {
    en: "Unleash your inner artist! Color adorable cat-themed pages with a vibrant palette.",
    ar: "أطلق الفنان بداخلك! لوّن صفحات قطط لطيفة بألوان زاهية.",
  },
  icon: "",
  iconPath: "lucide:Palette",
  primaryColor: "#34D399",
  difficulty: "easy",
  category: "idle",
  isComingSoon: false,
  displayName: "Cat Coloring Book",
  arabicName: "كتاب تلوين القطط",
  shortDescription: "Creative cat coloring",
  bannerPath: "/assets/images/games/coloring/banner.png",
  isFeatured: false,
  maxLevels: 6,
  tutorialRequired: false,
  tags: ["creative", "coloring", "cats", "relaxing"],
  releaseDate: "2026-07-30",
  version: "1.0.0",
};