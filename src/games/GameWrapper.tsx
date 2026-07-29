import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { PawPrint } from "lucide-react";
import NyaButton from "@/components/nya/NyaButton";
import NyaLayout from "@/components/nya/NyaLayout";
import SnakeGameWrapper from "@/games/snake";
import { SNAKE_GAME_META } from "@/games/snake/game.config";
import BlockBlastGameWrapper from "@/games/block-blast";
import { BLOCK_BLAST_META } from "@/games/block-blast/game.config";
import WaterSortGameWrapper from "@/games/water-sort";
import { WATER_SORT_META } from "@/games/water-sort/game.config";
import MeowdokuGameWrapper from "@/games/meowdoku";
import { MEOWDOKU_META } from "@/games/meowdoku/game.config";

interface GameEntry {
  name: string;
  Component: React.ComponentType;
}

const GAME_ENTRIES: Record<string, GameEntry> = {
  snake: { name: SNAKE_GAME_META.displayName ?? "Snake", Component: SnakeGameWrapper },
  "block-blast": { name: BLOCK_BLAST_META.displayName ?? "Block Blast", Component: BlockBlastGameWrapper },
  "water-sort": { name: WATER_SORT_META.displayName ?? "Water Sort", Component: WaterSortGameWrapper },
  meowdoku: { name: MEOWDOKU_META.displayName ?? "Meowdoku", Component: MeowdokuGameWrapper },
};

function GameLoadingScreen({ name }: { name: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16">
      <motion.div
        animate={{ scale: [1, 1.15, 1], rotate: [0, 8, -8, 0] }}
        transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
        className="w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-400 to-violet-500 flex items-center justify-center shadow-lg"
      >
        <PawPrint className="w-8 h-8 text-white" />
      </motion.div>
      <p className="font-heading text-sm text-muted-foreground">Loading {name}...</p>
    </div>
  );
}

export default function GameWrapper() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  const entry = slug ? GAME_ENTRIES[slug] : null;

  // Brief loading transition on every game entry (min ~500ms feel).
  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(t);
  }, [slug]);

  if (entry) {
    const { Component, name } = entry;
    return (
      <NyaLayout title={name}>
        <div className="relative min-h-[60vh]">
          <Component />
          <AnimatePresence>
            {loading && (
              <motion.div
                initial={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="absolute inset-0 z-10 flex items-center justify-center bg-background/95 backdrop-blur-sm rounded-2xl"
              >
                <GameLoadingScreen name={name} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
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
            This game is being crafted with love. Check back soon!
          </p>
        </div>
        <NyaButton onClick={() => navigate("/")}>Back to Hub</NyaButton>
      </motion.div>
    </div>
  );
}