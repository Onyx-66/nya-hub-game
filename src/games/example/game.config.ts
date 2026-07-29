import type { GameConfig } from "@/types";

export const exampleGameConfig: Omit<GameConfig, "component"> = {
  id: "nya-bounce",
  title: "Nya Bounce",
  description: "Tap the bouncing kitty before time runs out!",
  category: "arcade",
  icon: "🐱",
  accentColor: "#a855f7",
  gradient: "from-violet-500 to-purple-700",
  difficulty: "easy",
  unlockLevel: 1,
};

export const GAME_DURATION = 30; // seconds
export const TARGET_SPAWN_INTERVAL = 900; // ms