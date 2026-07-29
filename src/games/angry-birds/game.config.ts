import type { GameMeta } from "@/types";

export const ANGRY_BIRDS_META: GameMeta = {
  id: "angry-birds",
  slug: "angry-birds",
  name: { en: "Furious Felines", ar: "القطط الغاضبة" },
  description: {
    en: "Launch adorable angry cats at the dog fortresses! Drag to aim, release to unleash feline fury. Destroy all enemies to win!",
    ar: "أطلق القطط الغاضبة على حصون الكلاب! اسحب للتصويب، أطلق للهجوم. دمر جميع الأعداء للفوز!",
  },
  icon: "",
  iconPath: "/assets/images/games/angry-birds/icon.svg",
  primaryColor: "#F97316",
  difficulty: "medium",
  category: "arcade",
  isComingSoon: false,
  isFeatured: true,
  displayName: "Furious Felines",
  arabicName: "القطط الغاضبة",
  shortDescription: "Physics-based cat-apult action",
  tags: ["arcade", "physics", "slingshot", "action"],
  releaseDate: "2026-07-29",
  version: "1.0.0",
};