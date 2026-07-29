import type { GameMeta } from "@/types";

export const MEOWDOKU_META: GameMeta = {
  id: "meowdoku",
  slug: "meowdoku",
  name: { en: "Meowdoku", ar: "مياودوكو" },
  description: {
    en: "Sudoku with a feline twist!",
    ar: "سودوكو بنكهة قطط!",
  },
  icon: "",
  iconPath: "/assets/images/games/meowdoku/icon.svg",
  primaryColor: "#C084FC",
  difficulty: "hard",
  category: "puzzle",
  isComingSoon: false,
  displayName: "Meowdoku",
  arabicName: "مياودوكو",
  shortDescription: "Feline Sudoku",
  tags: ["puzzle", "sudoku", "logic", "numbers"],
  releaseDate: "2026-07-29",
  version: "1.0.0",
};