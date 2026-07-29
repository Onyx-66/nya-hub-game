import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { PawPrint } from "lucide-react";
import NyaButton from "@/components/nya/NyaButton";
import NyaLayout from "@/components/nya/NyaLayout";
import SnakeGame from "@/games/snake";

/**
 * Generic game wrapper — reads the :slug param and renders the matching game.
 */
const GAME_COMPONENTS: Record<string, React.ComponentType> = {
  snake: SnakeGame,
};

export default function GameWrapper() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const GameComponent = slug ? GAME_COMPONENTS[slug] : null;

  if (GameComponent) {
    return (
      <NyaLayout title={slug === "snake" ? "Snake" : "Game"}>
        <GameComponent />
      </NyaLayout>
    );
  }

  const displayName =
    slug
      ?.split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ") ?? "Game";

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="text-center space-y-5"
      >
        <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-pink-400 to-violet-400 flex items-center justify-center mx-auto shadow-xl">
          <PawPrint className="w-12 h-12 text-white" />
        </div>
        <div>
          <h1 className="font-heading font-bold text-2xl text-foreground">
            {displayName}
          </h1>
          <p className="text-muted-foreground text-sm mt-2 max-w-xs mx-auto">
            This game is being crafted with love. Check back soon! 🐾
          </p>
        </div>
        <NyaButton onClick={() => navigate("/")}>Back to Hub</NyaButton>
      </motion.div>
    </div>
  );
}