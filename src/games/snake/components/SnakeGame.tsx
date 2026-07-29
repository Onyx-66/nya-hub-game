import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { SnakeGameEngine, type Direction, type GameState } from "../logic/snakeEngine";
import { renderSnake } from "./snakeRenderer";
import { useGameEconomy, scoreToStars } from "@/hooks/useGameEconomy";

// =============================================
// Constants
// =============================================

const GRID_W = 20;
const GRID_H = 20;
const CANVAS_SIZE = 400; // internal resolution (square)
const INITIAL_SPEED = 150;
const SWIPE_THRESHOLD = 30;
const GAME_ID = "snake";

// =============================================
// Component
// =============================================

export default function SnakeGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<SnakeGameEngine | null>(null);
  const animationFrameRef = useRef<number>(0);
  const frameRef = useRef(0);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  const [gameState, setGameState] = useState<GameState>("idle");
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [isPaused, setIsPaused] = useState(false);
  const [isNewHighScore, setIsNewHighScore] = useState(false);

  const navigate = useNavigate();
  const { onGameStart, onGameEnd, highScore } = useGameEconomy(GAME_ID);
  const highScoreRef = useRef(highScore);
  highScoreRef.current = highScore;

  // ── Game over: economy + store updates ──
  const handleGameOver = useCallback(
    (finalScore: number) => {
      const lvl = engineRef.current?.getLevel() ?? 1;
      const stars = scoreToStars(finalScore);
      const isHigh = finalScore > highScoreRef.current;
      onGameEnd(finalScore, lvl, stars);
      setIsNewHighScore(isHigh);
      setGameState("gameover");
    },
    [onGameEnd],
  );

  // ── Start / Restart ──
  const startGame = useCallback(() => {
    onGameStart();
    const engine = new SnakeGameEngine({
      gridWidth: GRID_W,
      gridHeight: GRID_H,
      initialSpeed: INITIAL_SPEED,
    });
    engine.onFoodEaten = (s, lvl) => {
      setScore(s);
      setLevel(lvl);
    };
    engine.onGameOver = (finalScore) => handleGameOver(finalScore);
    engine.start();
    engineRef.current = engine;

    setScore(0);
    setLevel(1);
    setIsPaused(false);
    setIsNewHighScore(false);
    setGameState("playing");
  }, [onGameStart, handleGameOver]);

  const quitGame = useCallback(() => {
    engineRef.current = null;
    setGameState("idle");
    setIsPaused(false);
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

  // ── Render loop (requestAnimationFrame, separate from logic tick) ──
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

  // ── Game logic loop (dynamic speed via recursive setTimeout) ──
  useEffect(() => {
    if (gameState !== "playing" || isPaused) return;
    const engine = engineRef.current;
    if (!engine) return;

    let cancelled = false;
    let timeoutId: ReturnType<typeof setTimeout>;

    const loop = () => {
      if (cancelled) return;
      const result = engine.tick();
      if (result.died) return; // onGameOver handled by engine callback
      timeoutId = setTimeout(loop, engine.getSpeed());
    };
    timeoutId = setTimeout(loop, engine.getSpeed());

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, [gameState, isPaused]);

  // ── Keyboard controls (Arrow keys + WASD, P/Space to pause) ──
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
    };
    const handler = (e: KeyboardEvent) => {
      const dir = keyMap[e.key];
      if (dir) {
        e.preventDefault();
        engineRef.current?.changeDirection(dir);
        return;
      }
      if (e.key === "p" || e.key === " ") {
        e.preventDefault();
        togglePause();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [togglePause]);

  // ── Touch swipe controls ──
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
    engineRef.current?.changeDirection(dir);
  };

  const handleDpad = (dir: Direction) => {
    engineRef.current?.changeDirection(dir);
  };

  const isPlaying = gameState === "playing";

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      {/* ── Canvas + overlays ── */}
      <div
        className="relative w-full max-w-[400px] touch-none select-none"
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

        {/* Score + level + pause button (top bar overlay) */}
        {isPlaying && (
          <div className="absolute top-2 left-2 right-2 flex items-center justify-between gap-2 pointer-events-none">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/40 backdrop-blur-sm">
              <span className="font-heading font-bold text-sm text-white">
                {score}
              </span>
              <span className="text-[10px] text-white/60">LVL {level}</span>
            </div>
            <button
              onClick={togglePause}
              className="pointer-events-auto w-11 h-11 rounded-xl bg-black/40 backdrop-blur-sm flex items-center justify-center text-white active:scale-95 transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2"
              aria-label={isPaused ? "Resume" : "Pause"}
            >
              {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
            </button>
          </div>
        )}

        {/* Idle / start overlay */}
        {gameState === "idle" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm gap-4 rounded-2xl">
            <span className="text-5xl">🐍</span>
            <button
              onClick={startGame}
              className="px-8 py-3 rounded-xl bg-primary text-primary-foreground font-heading font-bold text-sm active:scale-95 transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              Start Game
            </button>
            {highScore > 0 && (
              <span className="text-xs text-white/60">Best: {highScore}</span>
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
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 backdrop-blur-sm gap-3 rounded-2xl px-4">
            {isNewHighScore && (
              <span className="px-3 py-1 rounded-full bg-gold/20 text-gold text-xs font-bold mb-1">
                ⭐ New High Score!
              </span>
            )}
            <h3 className="font-heading font-bold text-3xl text-white">Game Over!</h3>
            <p className="text-sm text-white/70">Final Score</p>
            <span className="font-heading font-bold text-4xl text-white">{score}</span>
            <div className="flex items-center gap-3 mt-2">
              <button
                onClick={startGame}
                className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-heading font-bold text-sm active:scale-95 transition-transform"
              >
                Play Again
              </button>
              <button
                onClick={quitGame}
                className="px-6 py-2.5 rounded-xl bg-white/10 text-white font-heading font-bold text-sm active:scale-95 transition-transform"
              >
                Quit
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── On-screen D-pad (mobile) ── */}
      {isPlaying && !isPaused && (
        <div className="grid grid-cols-3 grid-rows-3 gap-2 w-48 h-48 mt-1">
          <div />
          <DpadButton dir="UP" onPress={handleDpad}>
            <ChevronUp className="w-6 h-6" />
          </DpadButton>
          <div />
          <DpadButton dir="LEFT" onPress={handleDpad}>
            <ChevronLeft className="w-6 h-6" />
          </DpadButton>
          <div />
          <DpadButton dir="RIGHT" onPress={handleDpad}>
            <ChevronRight className="w-6 h-6" />
          </DpadButton>
          <div />
          <DpadButton dir="DOWN" onPress={handleDpad}>
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
      className="flex items-center justify-center w-14 h-14 rounded-full bg-white/10 text-white active:bg-primary active:scale-110 transition-colors touch-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      aria-label={dir}
    >
      {children}
    </button>
  );
}