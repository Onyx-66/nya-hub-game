import type { GameMeta } from "@/types";

export const BLOCK_BLAST_META: GameMeta = {
  id: "block-blast",
  slug: "block-blast",
  name: { en: "Block Blast", ar: "انفجار المكعبات" },
  description: {
    en: "Drag blocks onto the 8x8 grid. Fill rows and columns to blast them away!",
    ar: "اسحب المكعبات إلى الشبكة. املأ الصفوف والأعمدة لتفجيرها!",
  },
  icon: "",
  iconPath: "lucide:LayoutGrid",
  primaryColor: "#60A5FA",
  difficulty: "easy",
  category: "puzzle",
  isComingSoon: false,
  displayName: "Block Blast",
  arabicName: "انفجار المكعبات",
  shortDescription: "Strategic block puzzle",
  bannerPath: "/assets/images/games/block-blast/banner.png",
  isFeatured: true,
  maxLevels: 1,
  tutorialRequired: false,
  tags: ["puzzle", "block", "grid", "casual"],
  releaseDate: "2026-07-29",
  version: "1.0.0",
};