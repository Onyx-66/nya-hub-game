import type { GameConfig } from "@/types";
import ExampleGame from "@/games/example";

export const games: GameConfig[] = [
  {
    id: "nya-bounce",
    title: "Nya Bounce",
    description: "Tap the bouncing kitty before time runs out!",
    category: "arcade",
    icon: "🐱",
    accentColor: "#a855f7",
    gradient: "from-violet-500 to-purple-700",
    difficulty: "easy",
    component: ExampleGame,
    unlockLevel: 1,
  },
  {
    id: "fish-catch",
    title: "Fish Catch",
    description: "Help Nya catch falling fish from the sky.",
    category: "action",
    icon: "🐟",
    accentColor: "#3b82f6",
    gradient: "from-blue-500 to-cyan-600",
    difficulty: "medium",
    unlockLevel: 2,
    component: ExampleGame, // placeholder — swap with real game
  },
  {
    id: "yarn-tangle",
    title: "Yarn Tangle",
    description: "Untangle the yarn puzzle to free the kitten.",
    category: "puzzle",
    icon: "🧶",
    accentColor: "#ec4899",
    gradient: "from-pink-500 to-rose-700",
    difficulty: "hard",
    unlockLevel: 3,
    component: ExampleGame, // placeholder — swap with real game
  },
  {
    id: "nya-run",
    title: "Nya Run",
    description: "Endless rooftop chase — dodge, jump, collect!",
    category: "adventure",
    icon: "🏃",
    accentColor: "#f59e0b",
    gradient: "from-amber-500 to-orange-700",
    difficulty: "medium",
    unlockLevel: 5,
    component: ExampleGame, // placeholder — swap with real game
  },
];