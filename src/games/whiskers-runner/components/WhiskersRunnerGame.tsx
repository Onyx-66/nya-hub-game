import React, { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Cat, Heart, Fish, Dog, Play, RotateCcw, Pause } from "lucide-react";
import confetti from "canvas-confetti";
import { useGameEconomy } from "@/hooks/useGameEconomy";
import { useEconomyStore } from "@/store/economyStore";
import { WHISKERS_RUNNER_META } from "../game.config";
import {
  createInitialState,
  applyInput,
  update,
  computeStars,
  type WhiskersState,
  type InputFlags,
} from "../logic/whiskersEngine";
import { renderFrame } from "./whiskersRenderer";

type Phase = "idle" | "playing" | "paused" | "gameover";

const ACCENT = WHISKERS_RUNNER_META.primaryColor ?? "#f59e0b";
const SWIPE_THRESHOLD = 28;

export default function WhiskersRunnerGame() {
  const { onGameStart, onGameEnd, highScore } = useGameEconomy(WHISKERS_RUNNER_META.slug);
  const addPaws = useEconomyStore((s) => s.addPaws);
  const addGems = useEconomyStore((s) => s.addGems);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef<WhiskersState>(createInitialState());
  const phaseRef = useRef<Phase>("idle");
  const rafRef = useRef<number | undefined>(undefined);
  const lastTsRef = useRef<number>(0);
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const hudThrottle = useRef(0);
  const endedRef = useRef(false);

  const [phase, setPhase] = useState<Phase>("idle");
  const [hud, setHud] = useState({
    score: 0,
    lives: 9,
    fish: 0,
    guardGap: 100,
  });
  const [result, setResult] = useState<{ score: number; stars: 0 | 1 | 2 | 3; newHigh: boolean } | null>(
    null
  );

  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const dpr = window.devicePixelRatio || 1;
    const rect = container.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    const ctx = canvas.getContext("2d");
    ctx?.setTransform(dpr, 0, 0, dpr, 0, 0);
  }, []);

  useEffect(() => {
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    return () => window.removeEventListener("resize", resizeCanvas);
  }, [resizeCanvas]);

  const endGame = useCallback(
    (s: WhiskersState) => {
      if (endedRef.current) return;
      endedRef.current = true;
      const stars = computeStars(s);
      const finalScore = Math.round(s.score);
      const isNewHigh = finalScore > highScore;
      onGameEnd(finalScore, 1, stars);
      if (stars >= 3) {
        addPaws(40, "Whiskers Runner star bonus");
        addGems(2);
      } else if (stars >= 2) {
        addPaws(20, "Whiskers Runner star bonus");
      }
      if (isNewHigh) {
        confetti({ particleCount: 110, spread: 75, origin: { y: 0.6 }, colors: [ACCENT, "#fff", "#111"] });
      }
      setResult({ score: finalScore, stars, newHigh: isNewHigh });
      setPhase("gameover");
      phaseRef.current = "gameover";
    },
    [addGems, addPaws, highScore, onGameEnd]
  );

  const loop = useCallback(
    (ts: number) => {
      if (phaseRef.current !== "playing") return;
      const dt = Math.min(0.05, lastTsRef.current ? (ts - lastTsRef.current) / 1000 : 0.016);
      lastTsRef.current = ts;

      const s = stateRef.current;
      update(s, dt);

      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (canvas && container) {
        const ctx = canvas.getContext("2d");
        const rect = container.getBoundingClientRect();
        if (ctx) renderFrame(ctx, rect.width, rect.height, s, ACCENT);
      }

      hudThrottle.current += dt;
      if (hudThrottle.current > 0.12) {
        hudThrottle.current = 0;
        setHud({
          score: Math.round(s.score),
          lives: s.lives,
          fish: s.fishCollected,
          guardGap: s.guardGap,
        });
      }

      if (s.gameOver) {
        endGame(s);
        return;
      }
      rafRef.current = requestAnimationFrame(loop);
    },
    [endGame]
  );

  const startGame = useCallback(() => {
    stateRef.current = createInitialState();
    endedRef.current = false;
    lastTsRef.current = 0;
    setResult(null);
    setHud({ score: 0, lives: 9, fish: 0, guardGap: 100 });
    onGameStart();
    setPhase("playing");
    phaseRef.current = "playing";
    rafRef.current = requestAnimationFrame(loop);
  }, [loop, onGameStart]);

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const handleInput = useCallback((input: InputFlags) => {
    if (phaseRef.current !== "playing") return;
    applyInput(stateRef.current, input);
  }, []);

  const onTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    touchStart.current = { x: t.clientX, y: t.clientY };
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart.current) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - touchStart.current.x;
    const dy = t.clientY - touchStart.current.y;
    touchStart.current = null;
    if (Math.abs(dx) < SWIPE_THRESHOLD && Math.abs(dy) < SWIPE_THRESHOLD) return;
    if (Math.abs(dx) > Math.abs(dy)) {
      handleInput(dx < 0 ? { swipeLeft: true } : { swipeRight: true });
    } else {
      handleInput(dy < 0 ? { swipeUp: true } : { swipeDown: true });
    }
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") handleInput({ swipeLeft: true });
      if (e.key === "ArrowRight") handleInput({ swipeRight: true });
      if (e.key === "ArrowUp" || e.key === " ") handleInput({ swipeUp: true });
      if (e.key === "ArrowDown") handleInput({ swipeDown: true });
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [handleInput]);

  const togglePause = () => {
    if (phaseRef.current === "playing") {
      setPhase("paused");
      phaseRef.current = "paused";
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    } else if (phaseRef.current === "paused") {
      setPhase("playing");
      phaseRef.current = "playing";
      lastTsRef.current = 0;
      rafRef.current = requestAnimationFrame(loop);
    }
  };

  const guardDanger = hud.guardGap < 30;

  return (
    <div className="w-full max-w-md mx-auto flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 bg-muted/60 px-3 py-1.5 rounded-xl">
          <Cat className="w-4 h-4" style={{ color: ACCENT }} />
          <span className="font-heading font-bold text-sm">{hud.score}</span>
        </div>
        <div className="flex items-center gap-2 bg-muted/60 px-3 py-1.5 rounded-xl">
          <Fish className="w-4 h-4" style={{ color: ACCENT }} />
          <span className="font-heading font-bold text-sm">{hud.fish}</span>
        </div>
        <div className="flex items-center gap-2 bg-muted/60 px-3 py-1.5 rounded-xl">
          <Heart className="w-4 h-4 text-red-400" />
          <span className="font-heading font-bold text-sm">{hud.lives}/9</span>
        </div>
        <div className="flex items-center gap-2 bg-muted/60 px-3 py-1.5 rounded-xl">
          <span className="text-xs text-muted-foreground hidden sm:inline">Best</span>
          <span className="font-heading font-bold text-sm">{highScore}</span>
        </div>
      </div>

      {/* guard chase meter */}
      <div className="flex items-center gap-2 px-1">
        <Dog className={`w-4 h-4 ${guardDanger ? "text-red-500 animate-pulse" : "text-muted-foreground"}`} />
        <div className="flex-1 h-2 rounded-full bg-muted/60 overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ background: guardDanger ? "#ef4444" : ACCENT }}
            animate={{ width: `${hud.guardGap}%` }}
            transition={{ duration: 0.15 }}
          />
        </div>
      </div>

      <div
        ref={containerRef}
        className="relative w-full aspect-[3/4] rounded-2xl overflow-hidden bg-black touch-none select-none shadow-lg"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <canvas ref={canvasRef} className="w-full h-full block" />

        {phase === "playing" && (
          <button
            onClick={togglePause}
            className="absolute top-2 right-2 p-2 rounded-xl bg-black/40 text-white"
            aria-label="Pause"
          >
            <Pause className="w-4 h-4" />
          </button>
        )}

        <AnimatePresence>
          {phase === "idle" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center bg-black/75 backdrop-blur-sm rounded-2xl text-center px-6"
            >
              <Cat className="w-14 h-14 mb-3" style={{ color: ACCENT }} />
              <h2 className="font-display font-bold text-2xl text-white mb-2">
                {WHISKERS_RUNNER_META.displayName}
              </h2>
              <p className="text-sm text-white/70 mb-6 max-w-xs">
                Swipe left/right to switch lanes, swipe up to jump pits, swipe down to slide under beams.
                Collect fish, dodge the guard hound, survive your nine lives.
              </p>
              <button
                onClick={startGame}
                className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-2xl font-heading font-bold shadow-lg hover:scale-105 active:scale-95 transition-transform"
                style={{ backgroundColor: ACCENT }}
              >
                <Play className="w-4 h-4" /> Start Run
              </button>
            </motion.div>
          )}

          {phase === "paused" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center bg-black/75 backdrop-blur-sm rounded-2xl"
            >
              <h2 className="font-display font-bold text-xl text-white mb-4">Paused</h2>
              <button
                onClick={togglePause}
                className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-2xl font-heading font-bold shadow-lg hover:scale-105 active:scale-95 transition-transform"
                style={{ backgroundColor: ACCENT }}
              >
                <Play className="w-4 h-4" /> Resume
              </button>
            </motion.div>
          )}

          {phase === "gameover" && result && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center bg-black/75 backdrop-blur-sm rounded-2xl text-center px-6"
            >
              <h2 className="font-display font-bold text-2xl text-white mb-1">
                {result.newHigh ? "New Best!" : "Caught!"}
              </h2>
              <p className="text-white/70 text-sm mb-1">Score: {result.score}</p>
              <div className="flex gap-1 mb-4">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="text-xl"
                    style={{ opacity: i < result.stars ? 1 : 0.25 }}
                  >
                    ⭐
                  </span>
                ))}
              </div>
              <button
                onClick={startGame}
                className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-2xl font-heading font-bold shadow-lg hover:scale-105 active:scale-95 transition-transform"
                style={{ backgroundColor: ACCENT }}
              >
                <RotateCcw className="w-4 h-4" /> Run Again
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* on-screen controls for desktop / accessibility */}
      <div className="grid grid-cols-4 gap-2">
        <button
          onClick={() => handleInput({ swipeLeft: true })}
          className="py-2 rounded-xl bg-muted/60 font-heading font-bold text-sm active:scale-95 transition-transform"
        >
          ← Lane
        </button>
        <button
          onClick={() => handleInput({ swipeUp: true })}
          className="py-2 rounded-xl bg-muted/60 font-heading font-bold text-sm active:scale-95 transition-transform"
        >
          ↑ Jump
        </button>
        <button
          onClick={() => handleInput({ swipeDown: true })}
          className="py-2 rounded-xl bg-muted/60 font-heading font-bold text-sm active:scale-95 transition-transform"
        >
          ↓ Slide
        </button>
        <button
          onClick={() => handleInput({ swipeRight: true })}
          className="py-2 rounded-xl bg-muted/60 font-heading font-bold text-sm active:scale-95 transition-transform"
        >
          Lane →
        </button>
      </div>
    </div>
  );
}