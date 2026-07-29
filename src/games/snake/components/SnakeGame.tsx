import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
  Volume2,
  VolumeX,
  Trophy,
  Star,
  Droplet,
} from "lucide-react";
import { SnakeGameEngine, type Direction, type GameState } from "../logic/snakeEngine";
import { renderSnake } from "./snakeRenderer";
import { SoundManager } from "../utils/soundManager";
import { useGameEconomy, scoreToStars } from "@/hooks/useGameEconomy";

// =============================================
// Constants
// =============================================

const GRID_W = 20;
const GRID_H = 20;
const CANVAS_SIZE = 400;
const INITIAL_SPEED = 180;
const SWIPE_THRESHOLD = 25;
const INPUT_COOLDOWN = 50; // ms — filters accidental double-taps
const GAME_ID = "snake";
const COUNTDOWN_STEP_MS = 650;
const MUTE_KEY = "snake_muted";

// =============================================
// Component
// =============================================

export default function SnakeGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<SnakeGameEngine | null>(null);
  const animationFrameRef = useRef<number>(0);
  const frameRef = useRef(0);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const soundRef = useRef<SoundManager | null>(null);
  const countdownTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastInputTimeRef = useRef(0);
  const reducedMotionRef = useRef(
    typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches,
  );

  const [gameState, setGameState] = useState<GameState>("idle");
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [isPaused, setIsPaused] = useState(false);
  const [isNewHighScore, setIsNewHighScore] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isMuted, setIsMuted] = useState(
    () => typeof localStorage !== "undefined" && localStorage.getItem(MUTE_KEY) === "true",
  );
  const [shakeKey, setShakeKey] = useState(0);

  const navigate = useNavigate();
  const { onGameStart, onGameEnd, highScore } = useGameEconomy(GAME_ID);
  const highScoreRef = useRef(highScore);
  highScoreRef.current = highScore;

  // ── Initialize sound manager ──
  useEffect(() => {
    const sm = new SoundManager();
    sm.setMuted(isMuted);
    soundRef.current = sm;
    return () => {
      soundRef.current = null;
    };
  }, []);

  // ── Mute toggle ──
  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(MUTE_KEY, String(next));
      } catch {
        // no-op
      }
      soundRef.current?.setMuted(next);
      return next;
    });
  }, []);

  // ── Food eaten callback ──
  const handleFoodEaten = useCallback((s: number, lvl: number) => {
    setScore(s);
    setLevel(lvl);
    soundRef.current?.playEat();
    soundRef.current?.vibrate(30);
  }, []);

  // ── Game over: economy + store updates ──
  const handleGameOver = useCallback(
    (finalScore: number) => {
      const lvl = engineRef.current?.getLevel() ?? 1;
      const stars = scoreToStars(finalScore);
      const isHigh = finalScore > highScoreRef.current;
      onGameEnd(finalScore, lvl, stars);
      setIsNewHighScore(isHigh);
      setGameState("gameover");
      soundRef.current?.playGameOver();
      soundRef.current?.vibrate([80, 40, 160]);
      if (!reducedMotionRef.current) {
        setShakeKey((k) => k + 1);
      }
    },
    [onGameEnd],
  );

  // ── Start / Restart (with countdown) ──
  const startGame = useCallback(() => {
    onGameStart();
    const engine = new SnakeGameEngine({
      gridWidth: GRID_W,
      gridHeight: GRID_H,
      initialSpeed: INITIAL_SPEED,
    });
    engine.onFoodEaten = handleFoodEaten;
    engine.onGameOver = (finalScore) => handleGameOver(finalScore);
    engine.start();
    engineRef.current = engine;

    setScore(0);
    setLevel(1);
    setIsPaused(false);
    setIsNewHighScore(false);
    setGameState("ready");

    // Countdown sequence: 3 → 2 → 1 → GO! → play
    let count = 3;
    setCountdown(count);
    soundRef.current?.playCountdown();

    const step = () => {
      count -= 1;
      if (count > 0) {
        setCountdown(count);
        soundRef.current?.playCountdown();
        countdownTimerRef.current = setTimeout(step, COUNTDOWN_STEP_MS);
      } else if (count === 0) {
        setCountdown(0); // "GO!"
        soundRef.current?.playStart();
        countdownTimerRef.current = setTimeout(step, COUNTDOWN_STEP_MS);
      } else {
        setCountdown(null);
        engine.beginPlay();
        setGameState("playing");
        countdownTimerRef.current = null;
      }
    };
    countdownTimerRef.current = setTimeout(step, COUNTDOWN_STEP_MS);
  }, [onGameStart, handleFoodEaten, handleGameOver]);

  // ── Cleanup countdown on unmount ──
  useEffect(() => {
    return () => {
      if (countdownTimerRef.current) {
        clearTimeout(countdownTimerRef.current);
        countdownTimerRef.current = null;
      }
    };
  }, []);

  // ── Quit ──
  const quitGame = useCallback(() => {
    if (countdownTimerRef.current) {
      clearTimeout(countdownTimerRef.current);
      countdownTimerRef.current = null;
    }
    engineRef.current = null;
    setGameState("idle");
    setIsPaused(false);
    setCountdown(null);
    navigate("/");
  }, [navigate]);

  // ── Pause / Resume ──
  const togglePause = useCallback(() => {
    const engine = engineRef.current;
    if (!engine || gameState !== "playing") return;
    if (isPaused) {
      engine.resume();
      setIsPaused(false);
    } else {
      engine.pause();
      setIsPaused(true);
    }
  }, [gameState, isPaused]);

  // ── Auto-pause when tab loses focus ──
  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden && gameState === "playing" && !isPaused) {
        engineRef.current?.pause();
        setIsPaused(true);
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, [gameState, isPaused]);

  // ── Direction input with debounce ──
  const handleDirectionInput = useCallback((dir: Direction) => {
    const now = performance.now();
    if (now - lastInputTimeRef.current < INPUT_COOLDOWN) return;

    const engine = engineRef.current;
    if (!engine) return;

    const accepted = engine.changeDirection(dir);
    if (accepted) {
      lastInputTimeRef.current = now;
      soundRef.current?.playTurn();
      soundRef.current?.vibrate(10);
    }
  }, []);

  // ── Render loop (requestAnimationFrame, decoupled from logic tick) ──
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const engine = engineRef.current;
    if (!canvas || !engine) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    renderSnake(
      ctx,
      {
        snake: engine.snake,
        food: engine.food,
        direction: engine.direction,
        gridWidth: engine.gridWidth,
        gridHeight: engine.gridHeight,
        prevTail: engine.getPrevTail(),
        tickProgress: engine.getTickProgress(),
        eatPulse: reducedMotionRef.current ? 0 : engine.getEatPulse(),
      },
      CANVAS_SIZE,
      CANVAS_SIZE,
      frameRef.current,
    );
  }, []);

  useEffect(() => {
    const loop = () => {
      frameRef.current += 1;
      draw();
      animationFrameRef.current = requestAnimationFrame(loop);
    };
    animationFrameRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animationFrameRef.current);
  }, [draw]);

  // ── Game logic loop (fixed-timestep via recursive setTimeout) ──
  useEffect(() => {
    if (gameState !== "playing" || isPaused) return;
    const engine = engineRef.current;
    if (!engine) return;

    let cancelled = false;
    let timeoutId: ReturnType<typeof setTimeout>;

    const loop = () => {
      if (cancelled) return;
      const result = engine.tick();
      if (result.died) return;
      timeoutId = setTimeout(loop, engine.getSpeed());
    };
    timeoutId = setTimeout(loop, engine.getSpeed());

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, [gameState, isPaused]);

  // ── Keyboard controls (Arrow keys + WASD, P/Space to pause, M to mute) ──
  useEffect(() => {
    const keyMap: Record<string, Direction> = {
      ArrowUp: "UP",
      ArrowDown: "DOWN",
      ArrowLeft: "LEFT",
      ArrowRight: "RIGHT",
      w: "UP",
      s: "DOWN",
      a: "LEFT",
      d: "RIGHT",
      W: "UP",
      S: "DOWN",
      A: "LEFT",
      D: "RIGHT",
    };
    const handler = (e: KeyboardEvent) => {
      const dir = keyMap[e.key];
      if (dir) {
        e.preventDefault();
        handleDirectionInput(dir);
        return;
      }
      if (e.key === "p" || e.key === "P" || e.key === " ") {
        e.preventDefault();
        togglePause();
      }
      if (e.key === "m" || e.key === "M") {
        e.preventDefault();
        toggleMute();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleDirectionInput, togglePause, toggleMute]);

  // ── Touch swipe on canvas ──
  const handleTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    touchStartRef.current = { x: t.clientX, y: t.clientY };
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - touchStartRef.current.x;
    const dy = t.clientY - touchStartRef.current.y;
    touchStartRef.current = null;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < SWIPE_THRESHOLD) return;
    const dir: Direction =
      Math.abs(dx) > Math.abs(dy)
        ? dx > 0
          ? "RIGHT"
          : "LEFT"
        : dy > 0
          ? "DOWN"
          : "UP";
    handleDirectionInput(dir);
  };

  const isActive = gameState === "playing" || gameState === "ready";
  const showDpad = isActive && !isPaused;
  const bestScore = Math.max(highScore, score);

  return (
    <div className="flex flex-col items-center gap-2.5 w-full select-none">
      {/* ── HUD ── */}
      {isActive && (
        <div className="flex items-center justify-between w-full max-w-[400px] gap-2">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-card border border-border/50">
              <span className="font-heading font-bold text-base text-foreground leading-none">
                {score}
              </span>
              <span className="text-[9px] text-muted-foreground uppercase tracking-wide">
                Score
              </span>
            </div>
            <div className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-card border border-border/50">
              <Trophy className="w-3 h-3 text-gold" />
              <span className="font-heading font-bold text-sm text-foreground leading-none">
                {bestScore}
              </span>
            </div>
            <div className="flex items-center gap-1 px-2 py-1.5 rounded-xl bg-card border border-border/50">
              <span className="text-[9px] text-muted-foreground uppercase tracking-wide">
                Lvl
              </span>
              <span className="font-heading font-bold text-sm text-primary leading-none">
                {level}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleMute}
              className="w-11 h-11 rounded-xl bg-card border border-border/50 flex items-center justify-center text-foreground active:scale-95 transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              aria-label={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <button
              onClick={togglePause}
              disabled={gameState !== "playing"}
              className="w-11 h-11 rounded-xl bg-card border border-border/50 flex items-center justify-center text-foreground active:scale-95 transition-transform disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              aria-label={isPaused ? "Resume" : "Pause"}
            >
              {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
            </button>
          </div>
        </div>
      )}

      {/* ── Canvas + overlays ── */}
      <motion.div
        key={shakeKey}
        animate={
          shakeKey > 0
            ? { x: [0, -6, 6, -4, 4, 0], y: [0, -3, 3, -2, 2, 0] }
            : { x: 0, y: 0 }
        }
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="relative w-full max-w-[400px] touch-none"
        style={{ maxWidth: "min(400px, calc(100vh - 260px))" }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <canvas
          ref={canvasRef}
          width={CANVAS_SIZE}
          height={CANVAS_SIZE}
          className="block w-full h-auto rounded-2xl border border-border/50 shadow-lg"
          style={{ aspectRatio: "1 / 1" }}
          aria-label="Snake game board"
          role="img"
        />

        {/* Countdown overlay */}
        <AnimatePresence>
          {countdown !== null && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm rounded-2xl"
            >
              <motion.div
                key={countdown}
                initial={{ scale: 0.4, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 1.8, opacity: 0 }}
                transition={{ duration: 0.35, ease: "backOut" }}
                className="font-heading font-bold text-white text-6xl"
              >
                {countdown === 0 ? "GO!" : countdown}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Idle / start overlay */}
        {gameState === "idle" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm gap-4 rounded-2xl">
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <Droplet className="w-14 h-14 text-primary" />
            </motion.div>
            <button
              onClick={startGame}
              className="px-8 py-3 rounded-xl bg-primary text-primary-foreground font-heading font-bold text-sm active:scale-95 transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              Start Game
            </button>
            {highScore > 0 && (
              <div className="flex items-center gap-1.5 text-xs text-white/60">
                <Trophy className="w-3 h-3 text-gold" />
                Best: {highScore}
              </div>
            )}
          </div>
        )}

        {/* Pause overlay */}
        {isPaused && gameState === "playing" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm gap-4 rounded-2xl">
            <h3 className="font-heading font-bold text-2xl text-white">Paused</h3>
            <button
              onClick={togglePause}
              className="px-8 py-3 rounded-xl bg-primary text-primary-foreground font-heading font-bold text-sm active:scale-95 transition-transform"
            >
              Resume
            </button>
          </div>
        )}

        {/* Game Over overlay */}
        {gameState === "gameover" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 flex flex-col items-center justify-center bg-black/75 backdrop-blur-sm gap-2.5 rounded-2xl px-4"
          >
            {isNewHighScore && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className="flex items-center gap-1 px-3 py-1 rounded-full bg-gold/20 text-gold text-xs font-bold mb-1"
              >
                <Star className="w-3 h-3 fill-gold" /> New High Score!
              </motion.span>
            )}
            <h3 className="font-heading font-bold text-3xl text-white">Game Over!</h3>
            <p className="text-xs text-white/60 uppercase tracking-wide">Final Score</p>
            <span className="font-heading font-bold text-4xl text-white">{score}</span>
            <div className="flex items-center gap-1.5 text-xs text-white/50">
              <Trophy className="w-3 h-3 text-gold/70" />
              Best: {bestScore}
            </div>
            <div className="flex items-center gap-3 mt-3">
              <button
                onClick={startGame}
                className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-heading font-bold text-sm active:scale-95 transition-transform"
              >
                <Play className="w-3.5 h-3.5 fill-primary-foreground" /> Play Again
              </button>
              <button
                onClick={quitGame}
                className="px-6 py-2.5 rounded-xl bg-white/10 text-white font-heading font-bold text-sm active:scale-95 transition-transform"
              >
                Back to Hub
              </button>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* ── On-screen D-pad ── */}
      {showDpad && (
        <div className="grid grid-cols-3 grid-rows-3 gap-1.5 w-44 h-44 mt-0.5">
          <div />
          <DpadButton dir="UP" onPress={handleDirectionInput}>
            <ChevronUp className="w-6 h-6" />
          </DpadButton>
          <div />
          <DpadButton dir="LEFT" onPress={handleDirectionInput}>
            <ChevronLeft className="w-6 h-6" />
          </DpadButton>
          <div />
          <DpadButton dir="RIGHT" onPress={handleDirectionInput}>
            <ChevronRight className="w-6 h-6" />
          </DpadButton>
          <div />
          <DpadButton dir="DOWN" onPress={handleDirectionInput}>
            <ChevronDown className="w-6 h-6" />
          </DpadButton>
          <div />
        </div>
      )}
    </div>
  );
}

// =============================================
// D-pad Button
// =============================================

function DpadButton({
  dir,
  onPress,
  children,
}: {
  dir: Direction;
  onPress: (dir: Direction) => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onPointerDown={(e) => {
        e.preventDefault();
        onPress(dir);
      }}
      onContextMenu={(e) => e.preventDefault()}
      className="flex items-center justify-center w-14 h-14 rounded-full bg-white/10 text-white active:bg-primary active:scale-110 transition-all touch-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      aria-label={dir}
    >
      {children}
    </button>
  );
}