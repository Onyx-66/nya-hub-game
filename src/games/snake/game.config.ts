import type { GameMeta } from "@/types";

export const SNAKE_META: GameMeta = {
  id: "snake",
  slug: "snake",
  name: { en: "Snake Game", ar: "لعبة الثعبان" },
  description: {
    en: "Guide the hungry snake, gobble up treats, and grow as long as you can without crashing!",
    ar: "وجّه الثعبان الجائع، التهم المكافآت، وانمُ بأطول ما يمكن دون أن تصطدم!",
  },
  icon: "🐍",
  difficulty: "easy",
  category: "arcade",
  isComingSoon: false,
};