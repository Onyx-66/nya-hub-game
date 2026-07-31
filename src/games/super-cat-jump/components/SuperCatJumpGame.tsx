import React, { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Footprints,
  Heart,
  Coins,
  Clover,
  Timer,
  Play,
  RotateCcw,
  Pause,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Bone,
  Lock,
  Star,
} from "lucide-react";
import confetti from "canvas-confetti";
import { useGameEconomy } from "@/hooks/useGameEconomy";
import { useEconomyStore } from "@/store/economyStore";
import { SUPER_CAT_JUMP_META } from "../game.config";
import {
  createInitialState,
  update,
  computeStars,
  TOTAL_LEVELS,
  WORLDS,
  LEVELS_PER_WORLD,
  type GameState,
  type InputFlags,
} from "../logic/platformerEngine";
import { renderFrame } from "./platformerRenderer";

type Phase = "select" | "playing" | "paused" | "won" | "lost";

const ACCENT = SUPER_CAT_JUMP_META.primaryColor ?? "#10b981";
const PROGRESS_KEY = "super-cat-jump:unlocked-level";

function loadUnlocked(): number {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    return raw ? Math.min(TOTAL_LEVELS, Math.max(1, parseInt(raw, 10))) : 1;
  } catch {
    return 1;
  }
}
function saveUnlocked(n: number) {
  try {
    localStorage.setItem(PROGRESS_KEY, String(n));
  } catch {
    /* ignore */
  }
}

export default function SuperCatJumpGame() {
  const { onGameStart, onGameEnd, highScore } = useGameEconomy(SUPER_CAT_JUMP_META.slug);
  const addPaws = useEconomyStore((s) => s.addPaws);
  const addGems = useEconomyStore((s) => s.addGems);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef<GameState | null>(null);
  const phaseRef = useRef<Phase>("select");
  const rafRef = useRef<number | undefined>(undefined);
  const lastTsRef = useRef(0);
  const heldInput = useRef({ left: false, right: false });
  const edgeInput = useRef({ jump: false, throw: false });
  const endedRef = useRef(false);
  const hudThrottle = useRef(0);

  const [phase, setPhase] = useState<Phase>("select");
  const [unlocked, setUnlocked] = useState(1);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [hud, setHud] = useState({ score: 0, lives: 3, clovers: 0, time: 0 });
  const [result, setResult] = useState<{ score: number; stars: 0 | 1 | 2 | 3; won: boolean } | null>(
    null
  );

  useEffect(() => {
    setUnlocked(loadUnlocked());
  }, []);

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

  const endLevel = useCallback(
    (s: GameState, won: boolean) => {
      if (endedRef.current) return;
      endedRef.current = true;
      const stars = computeStars(s);
      const finalScore = Math.round(s.score);
      onGameEnd(finalScore, currentLevel, stars);

      if (won) {
        if (stars >= 3) {
          addPaws(40, "Super Cat Jump star bonus");
          addGems(3);
        } else if (stars === 2) {
          addPaws(20, "Super Cat Jump star bonus");
        } else {
          addPaws(8, "Super Cat Jump level clear");
        }
        if (currentLevel >= unlocked && currentLevel < TOTAL_LEVELS) {
          const next = currentLevel + 1;
          setUnlocked(next);
          saveUnlocked(next);
        }
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 }, colors: [ACCENT, "#fde047", "#fff"] });
      }

      setResult({ score: finalScore, stars, won });
      setPhase(won ? "won" : "lost");
      phaseRef.current = won ? "won" : "lost";
    },
    [addGems, addPaws, currentLevel, onGameEnd, unlocked]
  );

  const loop = useCallback(
    (ts: number) => {
      if (phaseRef.current !== "playing" || !stateRef.current) return;
      const dt = Math.min(0.05, lastTsRef.current ? (ts - lastTsRef.current) / 1000 : 0.016);
      lastTsRef.current = ts;

      const s = stateRef.current;
      const input: InputFlags = {
        left: heldInput.current.left,
        right: heldInput.current.right,
        jumpPressed: edgeInput.current.jump,
        throwPressed: edgeInput.current.throw,
      };
      edgeInput.current.jump = false;
      edgeInput.current.throw = false;

      update(s, dt, input);

      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (canvas && container) {
        const ctx = canvas.getContext("2d");
        const rect = container.getBoundingClientRect();
        if (ctx) renderFrame(ctx, rect.width, rect.height, s);
      }

      hudThrottle.current += dt;
      if (hudThrottle.current > 0.1) {
        hudThrottle.current = 0;
        setHud({
          score: Math.round(s.score),
          lives: s.lives,
          clovers: s.cloversCollected,
          time: Math.ceil(s.timeLeft),
        });
      }

      if (s.status === "won") {
        endLevel(s, true);
        return;
      }
      if (s.status === "dead" || s.status === "timeup") {
        endLevel(s, false);
        return;
      }
      rafRef.current = requestAnimationFrame(loop);
    },
    [endLevel]
  );

  const startLevel = useCallback(
    (levelNumber: number) => {
      setCurrentLevel(levelNumber);
      stateRef.current = createInitialState(levelNumber);
      endedRef.current = false;
      lastTsRef.current = 0;
      heldInput.current = { left: false, right: false };
      edgeInput.current = { jump: false, throw: false };
      setResult(null);
      setHud({ score: 0, lives: 3, clovers: 0, time: stateRef.current.level.timeLimit });
      onGameStart();
      setPhase("playing");
      phaseRef.current = "playing";
      rafRef.current = requestAnimationFrame(loop);
    },
    [loop, onGameStart]
  );

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" || e.key === "a") heldInput.current.left = true;
      if (e.key === "ArrowRight" || e.key === "d") heldInput.current.right = true;
      if (e.key === "ArrowUp" || e.key === " " || e.key === "w") edgeInput.current.jump = true;
      if (e.key === "x" || e.key === "Shift") edgeInput.current.throw = true;
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" || e.key === "a") heldInput.current.left = false;
      if (e.key === "ArrowRight" || e.key === "d") heldInput.current.right = false;
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, []);

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

  const backToSelect = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    setPhase("select");
    phaseRef.current = "select";
  };

  const holdStart = (key: "left" | "right") => () => (heldInput.current[key] = true);
  const holdEnd = (key: "left" | "right") => () => (heldInput.current[key] = false);

  // ---------- Level select screen ----------
  if (phase === "select") {
    return (
      <div className="w-full max-w-md mx-auto flex flex-col gap-4">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <Footprints className="w-6 h-6" style={{ color: ACCENT }} />
            <h2 className="font-display font-bold text-xl">{SUPER_CAT_JUMP_META.displayName}</h2>
          </div>
          <div className="flex items-center gap-2 bg-muted/60 px-3 py-1.5 rounded-xl">
            <span className="text-xs text-muted-foreground">Best</span>
            <span className="font-heading font-bold text-sm">{highScore}</span>
          </div>
        </div>

        {Array.from({ length: WORLDS }).map((_, w) => (
          <div key={w} className="bg-muted/40 rounded-2xl p-3">
            <p className="font-heading font-bold text-sm mb-2" style={{ color: ACCENT }}>
              World {w + 1}
            </p>
            <div className="grid grid-cols-4 gap-2">
              {Array.from({ length: LEVELS_PER_WORLD }).map((_, l) => {
                const levelNum = w * LEVELS_PER_WORLD + l + 1;
                const isUnlocked = levelNum <= unlocked;
                return (
                  <button
                    key={levelNum}
                    disabled={!isUnlocked}
                    onClick={() => isUnlocked && startLevel(levelNum)}
                    className={`aspect-square rounded-xl font-heading font-bold text-sm flex flex-col items-center justify-center gap-0.5 transition-transform ${
                      isUnlocked
                        ? "bg-primary text-primary-foreground shadow-lg hover:scale-105 active:scale-95"
                        : "bg-muted text-muted-foreground"
                    }`}
                    style={isUnlocked ? { backgroundColor: ACCENT } : undefined}
                  >
                    {isUnlocked ? levelNum : <Lock className="w-4 h-4" />}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    );
  }

  // ---------- In-level UI ----------
  return (
    <div className="w-full max-w-md mx-auto flex flex-col gap-3">
      <div className="flex items-center justify-between gap-1 flex-wrap">
        <div className="flex items-center gap-2 bg-muted/60 px-3 py-1.5 rounded-xl">
          <Coins className="w-4 h-4" style={{ color: ACCENT }} />
          <span className="font-heading font-bold text-sm">{hud.score}</span>
        </div>
        <div className="flex items-center gap-2 bg-muted/60 px-3 py-1.5 rounded-xl">
          <Clover className="w-4 h-4" style={{ color: ACCENT }} />
          <span className="font-heading font-bold text-sm">{hud.clovers}/3</span>
        </div>
        <div className="flex items-center gap-2 bg-muted/60 px-3 py-1.5 rounded-xl">
          <Heart className="w-4 h-4 text-red-400" />
          <span className="font-heading font-bold text-sm">{hud.lives}</span>
        </div>
        <div className="flex items-center gap-2 bg-muted/60 px-3 py-1.5 rounded-xl">
          <Timer className={`w-4 h-4 ${hud.time <= 10 ? "text-red-500 animate-pulse" : "text-muted-foreground"}`} />
          <span className="font-heading font-bold text-sm">{hud.time}s</span>
        </div>
      </div>

      <div
        ref={containerRef}
        className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden bg-black touch-none select-none shadow-lg"
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
          {phase === "paused" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center bg-black/75 backdrop-blur-sm rounded-2xl gap-3"
            >
              <h2 className="font-display font-bold text-xl text-white">Paused</h2>
              <button
                onClick={togglePause}
                className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-2xl font-heading font-bold shadow-lg hover:scale-105 active:scale-95 transition-transform"
                style={{ backgroundColor: ACCENT }}
              >
                <Play className="w-4 h-4" /> Resume
              </button>
              <button
                onClick={backToSelect}
                className="text-sm text-white/70 underline underline-offset-2"
              >
                Back to level select
              </button>
            </motion.div>
          )}

          {(phase === "won" || phase === "lost") && result && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center bg-black/75 backdrop-blur-sm rounded-2xl text-center px-6"
            >
              <h2 className="font-display font-bold text-2xl text-white mb-1">
                {result.won ? "Level Clear!" : "Try Again"}
              </h2>
              <p className="text-white/70 text-sm mb-1">Score: {result.score}</p>
              <div className="flex gap-1 mb-4">
                {[0, 1, 2].map((i) => (
                  <Star
                    key={i}
                    className="w-6 h-6"
                    style={{
                      color: i < result.stars ? "#fde047" : "rgba(255,255,255,0.25)",
                      fill: i < result.stars ? "#fde047" : "transparent",
                    }}
                  />
                ))}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => startLevel(currentLevel)}
                  className="flex items-center gap-2 px-5 py-3 bg-primary text-primary-foreground rounded-2xl font-heading font-bold shadow-lg hover:scale-105 active:scale-95 transition-transform"
                  style={{ backgroundColor: ACCENT }}
                >
                  <RotateCcw className="w-4 h-4" /> Retry
                </button>
                {result.won && currentLevel < TOTAL_LEVELS && (
                  <button
                    onClick={() => startLevel(currentLevel + 1)}
                    className="flex items-center gap-2 px-5 py-3 bg-white/10 text-white rounded-2xl font-heading font-bold shadow-lg hover:scale-105 active:scale-95 transition-transform"
                  >
                    Next Level
                  </button>
                )}
              </div>
              <button onClick={backToSelect} className="mt-4 text-sm text-white/70 underline underline-offset-2">
                Back to level select
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* touch controls */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex gap-2">
          <button
            onTouchStart={holdStart("left")}
            onTouchEnd={holdEnd("left")}
            onMouseDown={holdStart("left")}
            onMouseUp={holdEnd("left")}
            onMouseLeave={holdEnd("left")}
            className="w-14 h-14 rounded-2xl bg-muted/60 flex items-center justify-center active:scale-95 transition-transform touch-none select-none"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <button
            onTouchStart={holdStart("right")}
            onTouchEnd={holdEnd("right")}
            onMouseDown={holdStart("right")}
            onMouseUp={holdEnd("right")}
            onMouseLeave={holdEnd("right")}
            className="w-14 h-14 rounded-2xl bg-muted/60 flex items-center justify-center active:scale-95 transition-transform touch-none select-none"
          >
            <ArrowRight className="w-6 h-6" />
          </button>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => (edgeInput.current.throw = true)}
            className="w-14 h-14 rounded-2xl bg-muted/60 flex items-center justify-center active:scale-95 transition-transform touch-none select-none"
          >
            <Bone className="w-6 h-6" style={{ color: ACCENT }} />
          </button>
          <button
            onClick={() => (edgeInput.current.jump = true)}
            className="w-16 h-16 rounded-2xl font-heading font-bold shadow-lg flex items-center justify-center active:scale-95 transition-transform touch-none select-none"
            style={{ backgroundColor: ACCENT, color: "#052e16" }}
          >
            <ArrowUp className="w-7 h-7" />
          </button>
        </div>
      </div>
    </div>
  );
}