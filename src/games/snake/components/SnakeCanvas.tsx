import { useEffect, useRef, useState, useCallback } from "react";
import { SnakeGameEngine, type Direction } from "../logic/snakeEngine";
import { useGameEconomy } from "@/hooks/useGameEconomy";

// =============================================
// Constants
// =============================================

const GRID_W = 20;
const GRID_H = 20;
const CELL = 20; // px per cell
const CANVAS_W = GRID_W * CELL;
const CANVAS_H = GRID_H * CELL;
const TICK_MS = 150;

const COLORS = {
  bg: "#0d0b14",
  grid: "#1a1726",
  snakeHead: "#4ade80",
  snakeBody: "#22c55e",
  food: "#ef4444",
  foodGlow: "rgba(239, 68, 68, 0.35)",
};

// =============================================
// Component
// =============================================

interface SnakeCanvasProps {
  onScoreChange?: (score: number) => void;
  onGameOver?: (score: number) => void;
}

export default function SnakeCanvas({
  onScoreChange,
  onGameOver,
}: SnakeCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<SnakeGameEngine | null>(null);
  const [score, setScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const { awardPoints, checkPowerup } = useGameEconomy("Snake Game");

  // ── Score callback: update UI + award economy paws ──
  const handleFoodEaten = useCallback(
    (newScore: number, _level: number) => {
      setScore((prev) => {
        const delta = newScore - prev;
        awardPoints(delta);
        onScoreChange?.(newScore);
        return newScore;
      });
    },
    [awardPoints, onScoreChange]
  );

  const handleGameOver = useCallback(
    (finalScore: number, _level: number) => {
      setIsGameOver(true);
      setIsRunning(false);
      onGameOver?.(finalScore);
    },
    [onGameOver]
  );

  // ── Draw the current engine state to the canvas ──
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const engine = engineRef.current;
    if (!canvas || !engine) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // background
    ctx.fillStyle = COLORS.bg;
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

    // grid
    ctx.strokeStyle = COLORS.grid;
    ctx.lineWidth = 1;
    for (let x = 0; x <= GRID_W; x++) {
      ctx.beginPath();
      ctx.moveTo(x * CELL, 0);
      ctx.lineTo(x * CELL, CANVAS_H);
      ctx.stroke();
    }
    for (let y = 0; y <= GRID_H; y++) {
      ctx.beginPath();
      ctx.moveTo(0, y * CELL);
      ctx.lineTo(CANVAS_W, y * CELL);
      ctx.stroke();
    }

    // food with glow
    const { food } = engine;
    const fx = food.x * CELL;
    const fy = food.y * CELL;
    ctx.fillStyle = COLORS.foodGlow;
    ctx.beginPath();
    ctx.arc(fx + CELL / 2, fy + CELL / 2, CELL * 0.75, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = COLORS.food;
    ctx.beginPath();
    ctx.arc(fx + CELL / 2, fy + CELL / 2, CELL * 0.32, 0, Math.PI * 2);
    ctx.fill();

    // snake
    const { snake } = engine;
    snake.forEach((seg, i) => {
      ctx.fillStyle = i === 0 ? COLORS.snakeHead : COLORS.snakeBody;
      const r = i === 0 ? 6 : 4;
      const px = seg.x * CELL + 1;
      const py = seg.y * CELL + 1;
      const sz = CELL - 2;
      ctx.beginPath();
      ctx.roundRect(px, py, sz, sz, r);
      ctx.fill();
    });
  }, []);

  // ── Game loop: tick on interval, draw on rAF ──
  useEffect(() => {
    if (!isRunning) return;
    const engine = engineRef.current;
    if (!engine) return;

    const intervalId = setInterval(() => {
      engine.tick();
      draw();
    }, TICK_MS);

    let rafId: number;
    const renderLoop = () => {
      draw();
      rafId = requestAnimationFrame(renderLoop);
    };
    rafId = requestAnimationFrame(renderLoop);

    return () => {
      clearInterval(intervalId);
      cancelAnimationFrame(rafId);
    };
  }, [isRunning, draw]);

  // ── Start / Restart ──
  const startGame = useCallback(() => {
    checkPowerup();
    const engine = new SnakeGameEngine({
      gridWidth: GRID_W,
      gridHeight: GRID_H,
      initialSpeed: TICK_MS,
    });
    engine.onFoodEaten = handleFoodEaten;
    engine.onGameOver = handleGameOver;
    engine.start();
    engineRef.current = engine;
    setScore(0);
    setIsGameOver(false);
    setIsRunning(true);
    draw();
  }, [checkPowerup, draw, handleFoodEaten, handleGameOver]);

  // ── Keyboard controls ──
  useEffect(() => {
    if (!isRunning) return;
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
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isRunning]);

  // ── Touch swipe controls ──
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const handleTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    touchStart.current = { x: t.clientX, y: t.clientY };
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart.current) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - touchStart.current.x;
    const dy = t.clientY - touchStart.current.y;
    const absX = Math.abs(dx);
    const absY = Math.abs(dy);
    if (Math.max(absX, absY) < 20) return; // ignore tiny taps
    const dir: Direction =
      absX > absY ? (dx > 0 ? "RIGHT" : "LEFT") : dy > 0 ? "DOWN" : "UP";
    engineRef.current?.changeDirection(dir);
    touchStart.current = null;
  };

  // ── D-pad button ──
  const handleDpad = (dir: Direction) => {
    engineRef.current?.changeDirection(dir);
  };

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      {/* Score */}
      <div className="flex items-center gap-2">
        <span className="font-heading font-bold text-lg text-foreground">
          Score: {score}
        </span>
      </div>

      {/* Canvas + overlay */}
      <div
        className="relative rounded-2xl overflow-hidden border border-border/50 shadow-lg"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <canvas
          ref={canvasRef}
          width={CANVAS_W}
          height={CANVAS_H}
          className="block max-w-full h-auto touch-none"
          style={{ aspectRatio: `${CANVAS_W} / ${CANVAS_H}` }}
        />

        {/* Start overlay */}
        {!isRunning && !isGameOver && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/70 backdrop-blur-sm gap-3">
            <span className="text-4xl">🐍</span>
            <button
              onClick={startGame}
              className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-heading font-bold text-sm active:scale-95 transition-transform"
            >
              Start Game
            </button>
          </div>
        )}

        {/* Game Over overlay */}
        {isGameOver && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm gap-3">
            <span className="text-4xl">💀</span>
            <h3 className="font-heading font-bold text-xl text-foreground">
              Game Over
            </h3>
            <p className="text-sm text-muted-foreground">
              Final Score: <span className="font-bold text-foreground">{score}</span>
            </p>
            <button
              onClick={startGame}
              className="mt-1 px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-heading font-bold text-sm active:scale-95 transition-transform"
            >
              Play Again
            </button>
          </div>
        )}
      </div>

      {/* On-screen D-pad (mobile-friendly) */}
      {isRunning && !isGameOver && (
        <div className="grid grid-cols-3 grid-rows-3 gap-2 w-40 h-40 mt-2">
          <div />
          <DpadButton dir="UP" onPress={handleDpad} label="▲" />
          <div />
          <DpadButton dir="LEFT" onPress={handleDpad} label="◀" />
          <div />
          <DpadButton dir="RIGHT" onPress={handleDpad} label="▶" />
          <div />
          <DpadButton dir="DOWN" onPress={handleDpad} label="▼" />
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
  label,
}: {
  dir: Direction;
  onPress: (dir: Direction) => void;
  label: string;
}) {
  return (
    <button
      onPointerDown={(e) => {
        e.preventDefault();
        onPress(dir);
      }}
      className="flex items-center justify-center rounded-xl bg-muted/60 text-foreground text-lg font-bold active:bg-primary/30 transition-colors touch-none"
    >
      {label}
    </button>
  );
}