import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Timer, Trophy, Play } from "lucide-react";
import { usePlayerStore } from "@/store/usePlayerStore";
import { useGameStore } from "@/store/useGameStore";
import { GAME_DURATION } from "./game.config";

interface Target {
  id: number;
  x: number;
  y: number;
}

export default function ExampleGame() {
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [targets, setTargets] = useState<Target[]>([]);
  const nextId = useRef(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const addCoins = usePlayerStore((s) => s.addCoins);
  const addXp = usePlayerStore((s) => s.addXp);
  const recordScore = useGameStore((s) => s.recordScore);
  const highScore = useGameStore((s) => s.highScores["nya-bounce"] ?? 0);

  const spawnTarget = useCallback(() => {
    const id = nextId.current++;
    const x = 10 + Math.random() * 70;
    const y = 15 + Math.random() * 60;
    setTargets((prev) => [...prev, { id, x, y }]);
    setTimeout(() => {
      setTargets((prev) => prev.filter((t) => t.id !== id));
    }, 1500);
  }, []);

  const startGame = () => {
    setScore(0);
    setTimeLeft(GAME_DURATION);
    setTargets([]);
    setIsDone(false);
    setIsPlaying(true);
  };

  const endGame = useCallback(() => {
    setIsPlaying(false);
    setIsDone(true);
    addCoins(score * 2);
    addXp(score);
    recordScore("nya-bounce", score);
  }, [score, addCoins, addXp, recordScore]);

  useEffect(() => {
    if (!isPlaying) return;

    intervalRef.current = setInterval(spawnTarget, 900);
    const timer = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timer);
          if (intervalRef.current) clearInterval(intervalRef.current);
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => {
      clearInterval(timer);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPlaying, spawnTarget]);

  // end game when time hits 0
  useEffect(() => {
    if (isPlaying && timeLeft === 0) {
      endGame();
    }
  }, [timeLeft, isPlaying, endGame]);

  const hitTarget = (id: number) => {
    setTargets((prev) => prev.filter((t) => t.id !== id));
    setScore((s) => s + 1);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-200px)]">
      {/* HUD */}
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2 bg-muted/60 px-3 py-1.5 rounded-xl">
          <Timer className="w-4 h-4 text-primary" />
          <span className="font-bold text-foreground">{timeLeft}s</span>
        </div>
        <div className="flex items-center gap-2 bg-muted/60 px-3 py-1.5 rounded-xl">
          <Trophy className="w-4 h-4 text-yellow-400 fill-yellow-400" />
          <span className="font-bold text-foreground">{score}</span>
        </div>
      </div>

      {/* arena */}
      <div className="relative flex-1 mx-4 mb-4 rounded-3xl bg-gradient-to-br from-violet-900/40 to-purple-900/40 border border-border/50 overflow-hidden">
        {!isPlaying && !isDone && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
            <span className="text-6xl">🐱</span>
            <button
              onClick={startGame}
              className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-2xl font-heading font-bold shadow-lg hover:scale-105 transition-transform"
            >
              <Play className="w-5 h-5 fill-primary-foreground" />
              Start Game
            </button>
          </div>
        )}

        {isDone && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
            <span className="text-5xl">{score > highScore ? "🎉" : "🐾"}</span>
            <p className="font-display font-bold text-2xl text-foreground">
              {score} points!
            </p>
            <p className="text-sm text-muted-foreground">
              {score > highScore ? "New high score!" : `Best: ${highScore}`}
            </p>
            <p className="text-xs text-yellow-400 font-bold">
              +{score * 2} coins · +{score} XP
            </p>
            <button
              onClick={startGame}
              className="mt-2 flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-2xl font-heading font-bold shadow-lg hover:scale-105 transition-transform"
            >
              <Play className="w-5 h-5 fill-primary-foreground" />
              Play Again
            </button>
          </div>
        )}

        <AnimatePresence>
          {isPlaying &&
            targets.map((t) => (
              <motion.button
                key={t.id}
                initial={{ scale: 0, rotate: -30 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 15 }}
                onClick={() => hitTarget(t.id)}
                className="absolute text-4xl drop-shadow-lg active:scale-90 transition-transform"
                style={{ left: `${t.x}%`, top: `${t.y}%` }}
              >
                🐱
              </motion.button>
            ))}
        </AnimatePresence>
      </div>
    </div>
  );
}