import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { PawPrint } from "lucide-react";
import { getGameIcon } from "@/data/gameIcons";
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
import FuriousFelinesGameWrapper from "@/games/angry-birds";
import { ANGRY_BIRDS_META } from "@/games/angry-birds/game.config";
import QuizSwordGameWrapper from "@/games/quiz-sword";
import { QUIZ_SWORD_META } from "@/games/quiz-sword/game.config";
import NyaCrushGameWrapper from "@/games/candy-crush";
import { NYA_CRUSH_META } from "@/games/candy-crush/game.config";
import ColoringGameWrapper from "@/games/coloring";
import { COLORING_META } from "@/games/coloring/game.config";
import MultiColorFillGameWrapper from "@/games/multi-color-fill";
import { MULTI_COLOR_FILL_META } from "@/games/multi-color-fill/game.config";
import PawsMergeGameWrapper from "@/games/paws-merge";
import { PAWS_MERGE_META } from "@/games/paws-merge/game.config";
import WhiskersRunnerGameWrapper from "@/games/whiskers-runner";
import { WHISKERS_RUNNER_META } from "@/games/whiskers-runner/game.config";
import SuperCatJumpGameWrapper from "@/games/super-cat-jump";
import { SUPER_CAT_JUMP_META } from "@/games/super-cat-jump/game.config";

interface GameEntry {
  name: string;
  Component: React.ComponentType;
}

const GAME_ENTRIES: Record<string, GameEntry> = {
  snake: { name: SNAKE_GAME_META.displayName ?? "Snake", Component: SnakeGameWrapper },
  "block-blast": { name: BLOCK_BLAST_META.displayName ?? "Block Blast", Component: BlockBlastGameWrapper },
  "water-sort": { name: WATER_SORT_META.displayName ?? "Water Sort", Component: WaterSortGameWrapper },
  meowdoku: { name: MEOWDOKU_META.displayName ?? "Meowdoku", Component: MeowdokuGameWrapper },
  "angry-birds": { name: ANGRY_BIRDS_META.displayName ?? "Furious Felines", Component: FuriousFelinesGameWrapper },
  "quiz-sword": { name: QUIZ_SWORD_META.displayName ?? "Sword of Knowledge", Component: QuizSwordGameWrapper },
  "candy-crush": { name: NYA_CRUSH_META.displayName ?? "Nya Crush", Component: NyaCrushGameWrapper },
  "coloring": { name: COLORING_META.displayName ?? "Cat Coloring Book", Component: ColoringGameWrapper },
  "multi-color-fill": { name: MULTI_COLOR_FILL_META.displayName ?? "Multi-Color Fill", Component: MultiColorFillGameWrapper },
  "paws-merge": { name: PAWS_MERGE_META.displayName ?? "Paws Merge", Component: PawsMergeGameWrapper },
  "whiskers-runner": { name: WHISKERS_RUNNER_META.displayName ?? "Whiskers Runner", Component: WhiskersRunnerGameWrapper },
  "super-cat-jump": { name: SUPER_CAT_JUMP_META.displayName ?? "Super Cat Jump", Component: SuperCatJumpGameWrapper },
};

function GameLoadingScreen({
  name,
  Icon,
}: {
  name: string;
  Icon: React.ComponentType<{ className?: string }> | null;
}) {
  const LoadingIcon = Icon ?? PawPrint;
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16">
      <motion.div
        animate={{ scale: [1, 1.15, 1], rotate: [0, 8, -8, 0] }}
        transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
        className="w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-400 to-violet-500 flex items-center justify-center shadow-lg"
      >
        <LoadingIcon className="w-8 h-8 text-white" />
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
    const GameIcon = slug ? getGameIcon(slug) : null;
    return (
      <NyaLayout
        title={name}
        titleIcon={GameIcon ? <GameIcon className="w-5 h-5 text-primary" /> : undefined}
        hideNav={["snake", "multi-color-fill", "paws-merge", "whiskers-runner", "super-cat-jump"].includes(slug ?? "")}
        compact={["snake", "multi-color-fill", "paws-merge", "whiskers-runner", "super-cat-jump"].includes(slug ?? "")}
      >
        <div className={`relative ${["snake", "multi-color-fill", "paws-merge", "whiskers-runner", "super-cat-jump"].includes(slug ?? "") ? "h-full" : "min-h-[60vh]"}`}>
          <Component />
          <AnimatePresence>
            {loading && (
              <motion.div
                initial={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="absolute inset-0 z-10 flex items-center justify-center bg-background/95 backdrop-blur-sm rounded-2xl"
              >
                <GameLoadingScreen name={name} Icon={GameIcon} />
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
        <NyaButton onClick={() => navigate("/hub")}>Back to Hub</NyaButton>
      </motion.div>
    </div>
  );
}