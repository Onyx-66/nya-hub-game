import type { GameMeta } from "@/types";

export const QUIZ_SWORD_META: GameMeta = {
  id: "quiz-sword",
  slug: "quiz-sword",
  name: { en: "Sword of Knowledge", ar: "سيف المعرفة" },
  description: {
    en: "Test your knowledge across multiple categories. Answer correctly to charge your sword and defeat the boss!",
    ar: "اختبر معرفتك عبر فئات متعددة. أجب بشكل صحيح لشحن سيفك وهزيمة الزعيم!",
  },
  icon: "",
  iconPath: "/assets/images/games/quiz-sword/icon.svg",
  primaryColor: "#FBBF24",
  difficulty: "medium",
  category: "quiz",
  isComingSoon: false,
  isFeatured: true,
  displayName: "Sword of Knowledge",
  arabicName: "سيف المعرفة",
  shortDescription: "Educational quiz battles",
  tags: ["quiz", "trivia", "knowledge", "educational"],
  releaseDate: "2026-07-29",
  version: "1.0.0",
};