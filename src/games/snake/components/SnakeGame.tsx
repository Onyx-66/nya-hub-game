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
  Settings,
} from "lucide-react";
import { SnakeGameEngine, type Direction, type GameState } from "../logic/snakeEngine";
import { renderSnake } from "./snakeRenderer";
import { SoundManager } from "../utils/soundManager";
import SnakeControls, { type ControlMode } from "./SnakeControls";
import { useGameEconomy, scoreToStars } from "@/hooks/useGameEconomy";

// =============================================
// Constants
// =============================================

const GRID_W = 20;
const GRID_H = 20;
const CANVAS_SIZE = 400;
const INITIAL_SPEED = 180;
const SWIPE_THRESHOLD = 25;
const INPUT_COOLDOWN = 50;
const GAME_ID = "snake";
const COUNTDOWN_STEP_MS = 650;
const MUTE_KEY = "snake_muted";
const CONTROL_MODE_KEY = "snake_control_mode";

// =============================================
// Component
// =============================================

export default function SnakeGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);
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
  const [canvasDim, setCanvasDim] = useState(360);
  const [controlMode, setControlMode] = useState<ControlMode>(
    () =>
      (typeof localStorage !== "undefined" &&
        (localStorage.getItem(CONTROL_MODE_KEY) as ControlMode)) ||
      "arrows",
  );
  const [showSettings, setShowSettings] = useState(false);
  const [pendingStart, setPendingStart] = useState(false);

  const navigate = useNavigate();
  const { onGameStart, onGameEnd, highScore } = useGameEconomy(GAME_ID);
  const highScoreRef = useRef(highScore);
  highScoreRef.current = highScore;

  // ── Canvas size: measure available space for a square canvas ──
  useEffect(() => {
    const el = canvasContainerRef.current;
    if (!el) return;
    const update = () => {
      const rect = el.getBoundingClientRect();
      setCanvasDim(Math.floor(Math.min(rect.width, rect.height)));
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // ── Initialize sound manager ──
  useEffect(() => {
    const sm = new SoundManager();
    sm.setMuted(isMuted);
    soundRef.current = sm;
    return () => {
      soundRef.current = null;
    };
  }, []);

  // ── Lock body scroll while game is active ──
  useEffect(() => {
    if (gameState === "idle") return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [gameState]);

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

  // ── Game over ──
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
      if (!reducedMotionRef.current) setShakeKey((k) => k + 1);
    },
    [onGameEnd],
  );

  // ── Actual game start (countdown + engine init) ──
  const doStartGame = useCallback(() => {
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
        setCountdown(0);
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

  // ── Start game entry point — shows control picker on first play ──
  const startGame = useCallback(() => {
    if (typeof localStorage !== "undefined" && !localStorage.getItem(CONTROL_MODE_KEY)) {
      setShowSettings(true);
      setPendingStart(true);
      return;
    }
    doStartGame();
  }, [doStartGame]);

  // ── Control mode selection ──
  const handleModeSelect = useCallback(
    (mode: ControlMode) => {
      try {
        localStorage.setItem(CONTROL_MODE_KEY, mode);
      } catch {
        // no-op
      }
      setControlMode(mode);
      setShowSettings(false);
      if (pendingStart) {
        setPendingStart(false);
        doStartGame();
      }
    },
    [pendingStart, doStartGame],
  );

  const handleSettingsDismiss = useCallback(() => {
    setShowSettings(false);
    if (pendingStart) {
      setPendingStart(false);
      doStartGame();
    }
  }, [pendingStart, doStartGame]);

  const openSettings = useCallback(() => {
    if (gameState === "playing" && !isPaused) {
      engineRef.current?.pause();
      setIsPaused(true);
    }
    setShowSettings(true);
  }, [gameState, isPaused]);

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

  // ── Auto-pause on tab blur ──
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

  // ── Render loop ──
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const engine = engineRef.current;
    if (!engine) {
      // Draw board background + grid when idle (no engine yet)
      ctx.fillStyle = "#1a1a2e";
      ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
      const cell = CANVAS_SIZE / GRID_W;
      ctx.strokeStyle = "#252540";
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      for (let x = 0; x <= GRID_W; x++) {
        ctx.moveTo(x * cell, 0);
        ctx.lineTo(x * cell, CANVAS_SIZE);
      }
      for (let y = 0; y <= GRID_H; y++) {
        ctx.moveTo(0, y * cell);
        ctx.lineTo(CANVAS_SIZE, y * cell);
      }
      ctx.stroke();
      return;
    }
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

  // ── Game logic loop ──
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

  // ── Keyboard ──
  useEffect(() => {
    const keyMap: Record<string, Direction> = {
      ArrowUp: "UP",
      ArrowDown: "DOWN",
      ArrowLeft: "LEFT",
      ArrowRight: "RIGHT",
      w: "UP", s: "DOWN", a: "LEFT", d: "RIGHT",
      W: "UP", S: "DOWN", A: "LEFT", D: "RIGHT",
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
        ? dx > 0 ? "RIGHT" : "LEFT"
        : dy > 0 ? "DOWN" : "UP";
    handleDirectionInput(dir);
  };

  const isActive = gameState === "playing" || gameState === "ready";
  const showControls = isActive && !isPaused;
  const bestScore = Math.max(highScore, score);

  return (
    <div className="flex flex-col h-full w-full select-none gap-1">
      {/* ── HUD ── */}
      {isActive && (
        <div className="shrink-0 flex items-center justify-between w-full gap-1.5">
          <div className="flex items-center gap-1.5">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-card border border-border/50">
              <span className="font-heading font-bold text-sm text-foreground leading-none">{score}</span>
              <span className="text-[8px] text-muted-foreground uppercase tracking-wide">Score</span>
            </div>
            <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-card border border-border/50">
              <Trophy className="w-3 h-3 text-gold" />
              <span className="font-heading font-bold text-xs text-foreground leading-none">{bestScore}</span>
            </div>
            <div className="flex items-center gap-0.5 px-2 py-1 rounded-lg bg-card border border-border/50">
              <span className="text-[8px] text-muted-foreground uppercase">Lvl</span>
              <span className="font-heading font-bold text-xs text-primary leading-none">{level}</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={openSettings}
              className="w-9 h-9 rounded-lg bg-card border border-border/50 flex items-center justify-center text-foreground active:scale-95 transition-transform"
              aria-label="Control settings"
            >
              <Settings className="w-4 h-4" />
            </button>
            <button
              onClick={toggleMute}
              className="w-9 h-9 rounded-lg bg-card border border-border/50 flex items-center justify-center text-foreground active:scale-95 transition-transform"
              aria-label={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <button
              onClick={togglePause}
              disabled={gameState !== "playing"}
              className="w-9 h-9 rounded-lg bg-card border border-border/50 flex items-center justify-center text-foreground active:scale-95 transition-transform disabled:opacity-40"
              aria-label={isPaused ? "Resume" : "Pause"}
            >
              {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
            </button>
          </div>
        </div>
      )}

      {/* ── Canvas area (fills remaining space) ── */}
      <div ref={canvasContainerRef} className="flex-1 min-h-0 flex items-center justify-center w-full">
        <motion.div
          key={shakeKey}
          animate={shakeKey > 0 ? { x: [0, -6, 6, -4, 4, 0], y: [0, -3, 3, -2, 2, 0] } : { x: 0, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="relative touch-none"
          style={{ width: canvasDim, height: canvasDim }}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <canvas
            ref={canvasRef}
            width={CANVAS_SIZE}
            height={CANVAS_SIZE}
            className="absolute inset-0 w-full h-full rounded-2xl border border-border/50 shadow-lg"
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
                  transition={{ duration: 0.3, ease: "backOut" }}
                  className="font-heading font-bold text-white"
                  style={{ fontSize: canvasDim * 0.18 }}
                >
                  {countdown === 0 ? "GO!" : countdown}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Idle overlay */}
          {gameState === "idle" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm gap-4 rounded-2xl px-4">
              <div className="flex flex-col items-center gap-1">
                <span className="text-[10px] text-white/50 uppercase tracking-widest">Best Score</span>
                <span className="flex items-center gap-2">
                  <Trophy className="w-6 h-6 text-gold" />
                  <span className="font-heading font-bold text-5xl text-gold leading-none">{highScore}</span>
                </span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={startGame}
                  className="px-7 py-2.5 rounded-xl bg-primary text-primary-foreground font-heading font-bold text-sm active:scale-95 transition-transform"
                >
                  Start Game
                </button>
                <button
                  onClick={openSettings}
                  className="flex items-center gap-1.5 px-7 py-2.5 rounded-xl bg-secondary text-secondary-foreground font-heading font-bold text-sm active:scale-95 transition-transform"
                >
                  <Settings className="w-4 h-4" /> Controls
                </button>
              </div>
            </div>
          )}

          {/* Pause overlay */}
          {isPaused && gameState === "playing" && !showSettings && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm gap-4 rounded-2xl">
              <h3 className="font-heading font-bold text-2xl text-white">Paused</h3>
              <button
                onClick={togglePause}
                className="px-8 py-2.5 rounded-xl bg-primary text-primary-foreground font-heading font-bold text-sm active:scale-95 transition-transform"
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
              className="absolute inset-0 flex flex-col items-center justify-center bg-black/75 backdrop-blur-sm gap-2 rounded-2xl px-4"
            >
              {isNewHighScore && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.15, type: "spring" }}
                  className="flex items-center gap-1 px-3 py-1 rounded-full bg-gold/20 text-gold text-xs font-bold"
                >
                  <Star className="w-3 h-3 fill-gold" /> New High Score!
                </motion.span>
              )}
              <h3 className="font-heading font-bold text-2xl text-white">Game Over!</h3>
              <p className="text-[10px] text-white/60 uppercase tracking-wide">Final Score</p>
              <span className="font-heading font-bold text-3xl text-white">{score}</span>
              <div className="flex items-center gap-1.5 text-xs text-white/50">
                <Trophy className="w-3 h-3 text-gold/70" /> Best: {bestScore}
              </div>
              <div className="flex items-center gap-2.5 mt-2">
                <button
                  onClick={startGame}
                  className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-primary text-primary-foreground font-heading font-bold text-xs active:scale-95 transition-transform"
                >
                  <Play className="w-3 h-3 fill-primary-foreground" /> Play Again
                </button>
                <button
                  onClick={quitGame}
                  className="px-5 py-2 rounded-xl bg-white/10 text-white font-heading font-bold text-xs active:scale-95 transition-transform"
                >
                  Back to Hub
                </button>
              </div>
            </motion.div>
          )}

          {/* Settings / control picker overlay */}
          <AnimatePresence>
            {showSettings && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-20 flex items-center justify-center bg-black/75 backdrop-blur-sm rounded-2xl p-4"
              >
                <div className="bg-card rounded-2xl p-4 space-y-3" style={{ maxWidth: 240 }}>
                  <h3 className="font-heading font-bold text-sm text-foreground text-center">
                    {pendingStart ? "Choose Controls" : "Control Mode"}
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleModeSelect("arrows")}
                      className={`p-3 rounded-xl border-2 flex flex-col items-center gap-1.5 transition-colors ${
                        controlMode === "arrows" ? "border-primary bg-primary/10" : "border-border"
                      }`}
                    >
                      <div className="grid grid-cols-3 gap-0.5">
                        <div /><ChevronUp className="w-3.5 h-3.5" /><div />
                        <ChevronLeft className="w-3.5 h-3.5" /><div /><ChevronRight className="w-3.5 h-3.5" />
                        <div /><ChevronDown className="w-3.5 h-3.5" /><div />
                      </div>
                      <span className="text-[11px] font-bold text-foreground">Arrows</span>
                    </button>
                    <button
                      onClick={() => handleModeSelect("analog")}
                      className={`p-3 rounded-xl border-2 flex flex-col items-center gap-1.5 transition-colors ${
                        controlMode === "analog" ? "border-primary bg-primary/10" : "border-border"
                      }`}
                    >
                      <div className="w-9 h-9 rounded-full border-2 border-border flex items-center justify-center">
                        <div className="w-3.5 h-3.5 rounded-full bg-primary/60" />
                      </div>
                      <span className="text-[11px] font-bold text-foreground">Analog</span>
                    </button>
                  </div>
                  {!pendingStart && (
                    <button
                      onClick={handleSettingsDismiss}
                      className="w-full py-2 rounded-xl bg-muted text-muted-foreground text-xs font-bold"
                    >
                      Close
                    </button>
                  )}
                  {pendingStart && (
                    <button
                      onClick={handleSettingsDismiss}
                      className="w-full py-2 rounded-xl bg-muted text-muted-foreground text-xs font-bold"
                    >
                      Start with {controlMode === "arrows" ? "Arrows" : "Analog"}
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* ── Controls (directly below canvas, no gap) ── */}
      {showControls ? (
        <div className="shrink-0 w-full flex justify-center">
          <SnakeControls mode={controlMode} onDirection={handleDirectionInput} />
        </div>
      ) : (
        !isActive && <div className="shrink-0 h-[120px]" />
      )}
    </div>
  );
}