import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import NyaLayout from "@/components/nya/NyaLayout";
import GameGrid from "@/components/nya/GameGrid";
import FeaturedBanner from "@/components/nya/FeaturedBanner";
import { useAuthStore } from "@/store/authStore";
import { useGameStore } from "@/store/useGameStore";
import { SNAKE_GAME_META } from "@/games/snake/game.config";
import type { GameMeta } from "@/types";

/** Placeholder games for the hub — uses the GameMeta type */
const games: GameMeta[] = [
  SNAKE_GAME_META,
  {
    id: "angry-birds",
    slug: "angry-birds",
    name: { en: "Angry Birds", ar: "الطيور الغاضبة" },
    description: {
      en: "Launch birds, topple towers!",
      ar: "أطلق الطيور، اهدم الأبراج!",
    },
    icon: "🐦",
    difficulty: "medium",
    category: "action",
    isComingSoon: true,
  },
  {
    id: "sword-of-knowledge",
    slug: "sword-of-knowledge",
    name: { en: "سيف المعرفة", ar: "سيف المعرفة" },
    description: {
      en: "Sharpen your mind with trivia quests!",
      ar: "اشحذ عقلك بأسئلة المعرفة!",
    },
    icon: "⚔️",
    difficulty: "hard",
    category: "adventure",
    isComingSoon: true,
  },
  {
    id: "block-blast",
    slug: "block-blast",
    name: { en: "Block Blast", ar: "تفجير المربعات" },
    description: {
      en: "Match and blast colorful blocks!",
      ar: "طابق وفجّر المربعات الملونة!",
    },
    icon: "🧱",
    difficulty: "medium",
    category: "puzzle",
    isComingSoon: true,
  },
  {
    id: "water-sort",
    slug: "water-sort",
    name: { en: "Water Sort", ar: "فرز الماء" },
    description: {
      en: "Sort colors, solve the puzzle!",
      ar: "افرق الألوان، حل اللغز!",
    },
    icon: "💧",
    difficulty: "easy",
    category: "puzzle",
    isComingSoon: true,
  },
  {
    id: "meowdoku",
    slug: "meowdoku",
    name: { en: "Meowdoku", ar: "مياودوكو" },
    description: {
      en: "Sudoku with a feline twist!",
      ar: "سودوكو بنكهة قطط!",
    },
    icon: "🐱",
    difficulty: "hard",
    category: "puzzle",
    isComingSoon: true,
  },
  {
    id: "candy-crush",
    slug: "candy-crush",
    name: { en: "Candy Crush", ar: "سحق الحلوى" },
    description: {
      en: "Match three candies, win big!",
      ar: "طابق ثلاث حلويات، اربح كبيراً!",
    },
    icon: "🍬",
    difficulty: "easy",
    category: "puzzle",
    isComingSoon: true,
  },
  {
    id: "drawing-coloring",
    slug: "drawing-coloring",
    name: { en: "Drawing Coloring", ar: "الرسم والتلوين" },
    description: {
      en: "Unleash your inner artist!",
      ar: "أطلق الفنان بداخلك!",
    },
    icon: "🎨",
    difficulty: "easy",
    category: "idle",
    isComingSoon: true,
  },
];

export default function HubScreen() {
  const navigate = useNavigate();
  const { user, login } = useAuthStore();
  const highScores = useGameStore((s) => s.highScores);

  // Auto-login on first load — initializes auth + economy stores so game
  // rewards and purchases work even if the user plays directly from the hub.
  useEffect(() => {
    if (!user) login();
  }, [user, login]);

  const featuredGames = games.filter((g) => g.isFeatured && !g.isComingSoon);

  return (
    <NyaLayout showBack={false} title="Nya Hub 🐾">
      <div className="space-y-5">
        {/* greeting */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <p className="text-muted-foreground text-sm">Welcome back,</p>
          <h2 className="font-heading font-bold text-xl text-foreground">
            {user?.pseudonym ?? "Nya Player"}! 🐾
          </h2>
        </motion.div>

        {/* featured banner carousel */}
        {featuredGames.length > 0 && (
          <FeaturedBanner
            games={featuredGames}
            onPlay={(g) => navigate(`/game/${g.slug}`)}
          />
        )}

        {/* game grid */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-heading font-bold text-lg text-foreground">
              All Games
            </h3>
            <span className="text-xs text-muted-foreground">
              {games.length} games
            </span>
          </div>
          <GameGrid
            games={games}
            highScores={highScores}
            onPlay={(g) => navigate(`/game/${g.slug}`)}
          />
        </div>
      </div>
    </NyaLayout>
  );
}