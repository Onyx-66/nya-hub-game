import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import NyaLayout from "@/components/nya/NyaLayout";
import GameGrid from "@/components/nya/GameGrid";
import FeaturedBanner from "@/components/nya/FeaturedBanner";
import { useAuthStore } from "@/store/authStore";
import { useGameStore } from "@/store/useGameStore";
import { SNAKE_GAME_META } from "@/games/snake/game.config";
import { BLOCK_BLAST_META } from "@/games/block-blast/game.config";
import type { GameMeta } from "@/types";

/** Placeholder games for the hub — uses the GameMeta type */
const games: GameMeta[] = [
  SNAKE_GAME_META,
  {
    id: "water-sort",
    slug: "water-sort",
    name: { en: "Water Sort", ar: "فرز الماء" },
    description: {
      en: "Sort colors, solve the puzzle!",
      ar: "افرق الألوان، حل اللغز!",
    },
    icon: "",
    iconPath: "lucide:PaintBucket",
    primaryColor: "#60A5FA",
    difficulty: "medium",
    category: "puzzle",
    isComingSoon: false,
    isFeatured: true,
  },
  {
    id: "meowdoku",
    slug: "meowdoku",
    name: { en: "Meowdoku", ar: "مياودوكو" },
    description: {
      en: "Sudoku with a feline twist!",
      ar: "سودوكو بنكهة قطط!",
    },
    icon: "",
    iconPath: "lucide:LayoutGrid",
    primaryColor: "#C084FC",
    difficulty: "hard",
    category: "puzzle",
    isComingSoon: false,
  },
  {
    id: "angry-birds",
    slug: "angry-birds",
    name: { en: "Furious Felines", ar: "القطط الغاضبة" },
    description: {
      en: "Launch adorable angry cats at the dog fortresses! Drag to aim, release to unleash feline fury. Destroy all enemies to win!",
      ar: "أطلق القطط الغاضبة على حصون الكلاب!",
    },
    icon: "",
    iconPath: "lucide:Feather",
    primaryColor: "#F97316",
    difficulty: "medium",
    category: "arcade",
    isComingSoon: false,
    isFeatured: true,
    displayName: "Furious Felines",
  },
  {
    id: "quiz-sword",
    slug: "quiz-sword",
    name: { en: "Sword of Knowledge", ar: "سيف المعرفة" },
    description: {
      en: "Test your knowledge across multiple categories. Answer correctly to charge your sword and defeat the boss!",
      ar: "اختبر معرفتك عبر فئات متعددة!",
    },
    icon: "",
    iconPath: "lucide:Sword",
    primaryColor: "#FBBF24",
    difficulty: "medium",
    category: "quiz",
    isComingSoon: false,
    isFeatured: true,
    displayName: "Sword of Knowledge",
  },
  { ...BLOCK_BLAST_META, isComingSoon: true },
  {
    id: "nya-crush",
    slug: "nya-crush",
    name: { en: "Nya Crush", ar: "نيّا كراش" },
    description: {
      en: "Match three candies, win big!",
      ar: "طابق ثلاث حلويات، اربح كبيراً!",
    },
    icon: "",
    iconPath: "lucide:Gem",
    primaryColor: "#F472B6",
    difficulty: "easy",
    category: "puzzle",
    isComingSoon: true,
  },
  {
    id: "coloring-book",
    slug: "coloring-book",
    name: { en: "Coloring Book", ar: "كتاب التلوين" },
    description: {
      en: "Unleash your inner artist!",
      ar: "أطلق الفنان بداخلك!",
    },
    icon: "",
    iconPath: "lucide:Palette",
    primaryColor: "#34D399",
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
    <NyaLayout showBack={false} title="Nya Hub">
      <div className="space-y-5">
        {/* greeting */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <p className="text-muted-foreground text-sm">Welcome back,</p>
          <h2 className="font-heading font-bold text-xl text-foreground">
            {user?.pseudonym ?? "Nya Player"}!
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