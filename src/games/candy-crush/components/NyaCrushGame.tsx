import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { RotateCcw, ChevronRight, Play, Sparkles, Zap, Bomb, Rainbow } from "lucide-react";
import { NyaCrushEngine, type Position, type Candy } from "../logic/nyaCrushEngine";
import {
  CANDY_COLORS,
  createRendererConfig,
  renderBoard,
  renderHUD,
  renderSwapAnimation,
  renderParticles,
  type NyaCrushRendererConfig,
  type Particle,
} from "./NyaCrushRenderer";
import { useGameEconomy } from "@/hooks/useGameEconomy";
import { useEconomyStore } from "@/store/economyStore";
import { formatNumber } from "@/utils/formatting";

const GAME_ID = "candy-crush";
const SAVE_KEY = "nya-crush-save";
const DRAG_THRESHOLD = 14;

interface SavedState {
  board: (Candy | null)[][];
  score: number;
  moves: number;
  level: number;
}

interface ScorePopup {
  id: number;
  x: number;
  y: number;
  value: number;
  startTime: number;
}

export default function NyaCrushGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<NyaCrushEngine | null>(null);
  const animationFrameRef = useRef<number>(0);
  const configRef = useRef<NyaCrushRendererConfig>(createRendererConfig());
  const popupIdRef = useRef(0);
  const popupsRef = useRef<ScorePopup[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const swapAnimRef = useRef<{ from: Position; to: Position; startTime: number } | null>(null);
  const inputLockedRef = useRef(false);
  const prevTimeRef = useRef(0);

  const dragRef = useRef<{ start: Position; startX: number; startY: number; swapped: boolean } | null>(null);

  const pendingRestoreRef = useRef<SavedState | null>(null);
  const gameStartedRef = useRef(false);

  const [level, setLevel] = useState(1);
  const [restartKey, setRestartKey] = useState(0);
  const [gameState, setGameState] = useState<"playing" | "gameover" | "levelcomplete">("playing");
  const [score, setScore] = useState(0);
  const [moves, setMoves] = useState(30);
  const [target, setTarget] = useState(1000);
  const [stars, setStars] = useState(0);
  const [isNewHighScore, setIsNewHighScore] = useState(false);
  const [savedInfo, setSavedInfo] = useState<{ level: number; score: number; moves: number } | null>(() => {
    try {
      const saved = localStorage.getItem(SAVE_KEY);
      if (saved) {
        const data = JSON.parse(saved);
        if (data.moves > 0 && data.board) {
          return { level: data.level, score: data.score, moves: data.moves };
        }
      }
    } catch { /* ignore */ }
    return null;
  });
  const [showContinue, setShowContinue] = useState(() => savedInfo !== null);
  const [showHelp, setShowHelp] = useState(false);

  const navigate = useNavigate();
  const { onGameStart, onGameEnd, highScore } = useGameEconomy(GAME_ID);
  const addPaws = useEconomyStore((s) => s.addPaws);
  const addGems = useEconomyStore((s) => s.addGems);

  useEffect(() => {
    const engine = new NyaCrushEngine(level);
    engine.onScoreChange = (s) => setScore(s);
    engine.onBoardUpdate = () => setMoves(engine.moves);
    engine.onCandiesCleared = (cleared) => {
      const config = configRef.current;
      const newParticles: Particle[] = [];
      for (const cell of cleared) {
        const px = config.boardX + cell.col * config.cellSize + config.cellSize / 2;
        const py = config.boardY + cell.row * config.cellSize + config.cellSize / 2;
        const color = CANDY_COLORS[cell.type];
        for (let i = 0; i < 6; i++) {
          const angle = (Math.PI * 2 * i) / 6 + Math.random() * 0.4;
          const speed = 1.5 + Math.random() * 2.5;
          newParticles.push({
            x: px, y: py,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed - 1.5,
            color, life: 0,
            maxLife: 600 + Math.random() * 300,
            size: 3 + Math.random() * 4,
          });
        }
      }
      particlesRef.current = [...particlesRef.current, ...newParticles];
    };
    engine.onGameOver = (finalScore) => {
      localStorage.removeItem(SAVE_KEY);
      onGameEnd(finalScore, level, 0);
      addPaws(Math.floor(finalScore / 20), "Nya Crush reward");
      setIsNewHighScore(finalScore > highScore);
      setGameState("gameover");
    };
    engine.onLevelComplete = (finalScore, s) => {
      localStorage.removeItem(SAVE_KEY);
      setStars(s);
      setIsNewHighScore(finalScore > highScore);
      onGameEnd(finalScore, level, s);
      addPaws(Math.floor(finalScore / 20), "Nya Crush reward");
      if (s === 3) addGems(1, "Nya Crush 3-star bonus");
      setGameState("levelcomplete");
    };
    engineRef.current = engine;
    engine.start();

    if (pendingRestoreRef.current) {
      engine.restoreState(pendingRestoreRef.current);
      setScore(engine.score);
      setMoves(engine.moves);
      pendingRestoreRef.current = null;
    }

    onGameStart();
    setScore(engine.score);
    setMoves(engine.maxMoves);
    setTarget(engine.targetScore);
    setGameState("playing");
    setStars(0);
    setIsNewHighScore(false);
    popupsRef.current = [];
    particlesRef.current = [];
    swapAnimRef.current = null;
    inputLockedRef.current = false;
    prevTimeRef.current = 0;

    // Set gameStartedRef based on whether a Continue screen is showing
    gameStartedRef.current = !showContinue;

    return () => cancelAnimationFrame(animationFrameRef.current);
  }, [level, restartKey, onGameStart, onGameEnd, addPaws, addGems, highScore]);

  // Save state on unmount (only if actively playing)
  useEffect(() => {
    return () => {
      const engine = engineRef.current;
      if (engine && gameStartedRef.current && engine.state === "playing") {
        try {
          localStorage.setItem(SAVE_KEY, JSON.stringify(engine.serialize()));
        } catch {
          // ignore save errors
        }
      }
    };
  }, []);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const engine = engineRef.current;
    if (!canvas || !engine) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const config = configRef.current;
    const time = performance.now();
    const dt = Math.min(32, time - (prevTimeRef.current || time));
    prevTimeRef.current = time;

    ctx.clearRect(0, 0, config.canvasWidth, config.canvasHeight);
    renderHUD(ctx, engine.score, engine.moves, engine.targetScore, config);

    if (swapAnimRef.current) {
      const elapsed = time - swapAnimRef.current.startTime;
      const progress = Math.min(1, elapsed / 200);

      const skip = new Set<string>();
      skip.add(`${swapAnimRef.current.from.row},${swapAnimRef.current.from.col}`);
      skip.add(`${swapAnimRef.current.to.row},${swapAnimRef.current.to.col}`);
      renderBoard(ctx, engine, config, time, skip);
      renderSwapAnimation(ctx, engine, swapAnimRef.current.from, swapAnimRef.current.to, progress, config, time);

      if (progress >= 1) {
        const { from, to } = swapAnimRef.current;
        swapAnimRef.current = null;
        // Reset input lock BEFORE swapCells so the game never freezes
        inputLockedRef.current = false;
        const prevScore = engine.score;
        engine.swapCells(from, to);
        const scoreGain = engine.score - prevScore;
        if (scoreGain > 0) {
          popupsRef.current = [...popupsRef.current, {
            id: popupIdRef.current++,
            x: config.boardX + config.cellSize * 4,
            y: config.boardY,
            value: scoreGain,
            startTime: time,
          }];
        }
      }
    } else {
      renderBoard(ctx, engine, config, time);
    }

    const activeParticles = particlesRef.current.filter((p) => p.life < p.maxLife);
    for (const p of activeParticles) {
      p.life += dt;
      p.x += p.vx * (dt / 16);
      p.y += p.vy * (dt / 16);
      p.vy += 0.1 * (dt / 16);
    }
    particlesRef.current = activeParticles;
    renderParticles(ctx, activeParticles, dt);

    const activePopups = popupsRef.current.filter((p) => time - p.startTime < 1000);
    popupsRef.current = activePopups;
    for (const popup of activePopups) {
      const elapsed = time - popup.startTime;
      const alpha = Math.max(0, 1 - elapsed / 1000);
      const yOffset = -elapsed * 0.04;
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = "#FBBF24";
      ctx.font = "bold 18px Nunito, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(`+${formatNumber(popup.value)}`, popup.x, popup.y + yOffset);
      ctx.restore();
    }
  }, []);

  useEffect(() => {
    const loop = () => {
      draw();
      animationFrameRef.current = requestAnimationFrame(loop);
    };
    animationFrameRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animationFrameRef.current);
  }, [draw]);

  // ── Input: supports both tap-to-swap and drag-to-swap ──
  const getGridPosition = (clientX: number, clientY: number): Position | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const config = configRef.current;
    const x = ((clientX - rect.left) / rect.width) * config.canvasWidth;
    const y = ((clientY - rect.top) / rect.height) * config.canvasHeight;
    const col = Math.floor((x - config.boardX) / config.cellSize);
    const row = Math.floor((y - config.boardY) / config.cellSize);
    if (row < 0 || row >= 8 || col < 0 || col >= 8) return null;
    return { row, col };
  };

  const handleCellClick = (clientX: number, clientY: number) => {
    if (inputLockedRef.current) return;
    const engine = engineRef.current;
    if (!engine || engine.state !== "playing") return;
    const pos = getGridPosition(clientX, clientY);
    if (!pos) return;

    if (!engine.selectedCell) {
      engine.selectedCell = pos;
      return;
    }
    if (engine.selectedCell.row === pos.row && engine.selectedCell.col === pos.col) {
      engine.selectedCell = null;
      return;
    }
    if (engine.isAdjacent(engine.selectedCell, pos)) {
      const from = engine.selectedCell;
      engine.selectedCell = null;
      inputLockedRef.current = true;
      swapAnimRef.current = { from, to: pos, startTime: performance.now() };
    } else {
      engine.selectedCell = pos;
    }
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    if (inputLockedRef.current) return;
    const engine = engineRef.current;
    if (!engine || engine.state !== "playing") return;
    const pos = getGridPosition(e.clientX, e.clientY);
    if (!pos) return;

    dragRef.current = { start: pos, startX: e.clientX, startY: e.clientY, swapped: false };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragRef.current || dragRef.current.swapped) return;
    if (inputLockedRef.current) return;

    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;

    if (Math.abs(dx) < DRAG_THRESHOLD && Math.abs(dy) < DRAG_THRESHOLD) return;

    const { start } = dragRef.current;
    let target: Position;
    if (Math.abs(dx) > Math.abs(dy)) {
      target = { row: start.row, col: start.col + (dx > 0 ? 1 : -1) };
    } else {
      target = { row: start.row + (dy > 0 ? 1 : -1), col: start.col };
    }

    if (target.row < 0 || target.row >= 8 || target.col < 0 || target.col >= 8) return;

    const engine = engineRef.current;
    if (!engine) return;
    engine.selectedCell = null;
    dragRef.current.swapped = true;
    inputLockedRef.current = true;
    swapAnimRef.current = { from: start, to: target, startTime: performance.now() };
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!dragRef.current) return;
    if (!dragRef.current.swapped) {
      handleCellClick(e.clientX, e.clientY);
    }
    dragRef.current = null;
  };

  const retryLevel = () => {
    gameStartedRef.current = true;
    localStorage.removeItem(SAVE_KEY);
    setRestartKey((k) => k + 1);
  };
  const nextLevel = () => {
    gameStartedRef.current = true;
    setLevel((l) => l + 1);
  };

  const handleContinue = () => {
    const saved = localStorage.getItem(SAVE_KEY);
    if (!saved) {
      setShowContinue(false);
      return;
    }
    try {
      const data: SavedState = JSON.parse(saved);
      pendingRestoreRef.current = data;
      gameStartedRef.current = true;
      setShowContinue(false);
      if (data.level !== level) {
        setLevel(data.level);
      } else {
        setRestartKey((k) => k + 1);
      }
    } catch {
      setShowContinue(false);
    }
  };

  const handleNewGame = () => {
    gameStartedRef.current = true;
    localStorage.removeItem(SAVE_KEY);
    setShowContinue(false);
    setRestartKey((k) => k + 1);
  };

  const config = configRef.current;

  return (
    <div className="flex flex-col items-center w-full">
      <div className="flex items-center gap-3 mb-2">
        <span className="text-sm font-bold text-foreground">Level {level}</span>
        <span className="text-xs text-muted-foreground">Target: {formatNumber(target)}</span>
        {highScore > 0 && (
          <span className="text-xs text-muted-foreground">Best: {formatNumber(highScore)}</span>
        )}
        <button
          onClick={() => setShowHelp(s => !s)}
          className="ml-auto text-xs text-primary font-bold hover:underline"
        >
          How to play?
        </button>
      </div>

      <div className="relative w-full max-w-[400px] touch-none select-none">
        <canvas
          ref={canvasRef}
          width={config.canvasWidth}
          height={config.canvasHeight}
          className="block w-full h-auto rounded-2xl shadow-2xl"
          style={{ aspectRatio: `${config.canvasWidth} / ${config.canvasHeight}` }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          aria-label="Nya Crush game board"
          role="img"
        />

        {showContinue && savedInfo && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/85 backdrop-blur-sm gap-4 rounded-2xl px-6">
            <Sparkles className="w-8 h-8 text-primary" />
            <h3 className="font-heading font-bold text-xl text-white text-center">Continue your game?</h3>
            <div className="flex gap-4 text-center">
              <div>
                <p className="text-xs text-muted-foreground">Level</p>
                <p className="text-lg font-bold text-white">{savedInfo.level}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Score</p>
                <p className="text-lg font-bold text-white">{formatNumber(savedInfo.score)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Moves</p>
                <p className="text-lg font-bold text-white">{savedInfo.moves}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleContinue}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-heading font-bold text-sm active:scale-95 transition-transform"
              >
                <Play className="w-4 h-4 fill-primary-foreground" /> Continue
              </button>
              <button
                onClick={handleNewGame}
                className="px-5 py-2.5 rounded-xl bg-white/10 text-white font-heading font-bold text-sm active:scale-95 transition-transform"
              >
                New Game
              </button>
            </div>
          </div>
        )}

        {showHelp && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/85 backdrop-blur-sm gap-3 rounded-2xl px-5 py-4 overflow-y-auto">
            <h3 className="font-heading font-bold text-lg text-white">Special Candies</h3>
            <div className="space-y-2.5 text-left w-full">
              <div className="flex items-start gap-2">
                <Zap className="w-4 h-4 text-yellow-400 mt-0.5 shrink-0" />
                <p className="text-xs text-white/80">Match <b className="text-white">4 in a row</b> &rarr; Striped candy. Clears its entire row + column when activated.</p>
              </div>
              <div className="flex items-start gap-2">
                <Bomb className="w-4 h-4 text-orange-400 mt-0.5 shrink-0" />
                <p className="text-xs text-white/80">Match an <b className="text-white">L or T shape</b> (5 candies) &rarr; Bomb. Explodes a 3&times;3 area.</p>
              </div>
              <div className="flex items-start gap-2">
                <Rainbow className="w-4 h-4 text-pink-400 mt-0.5 shrink-0" />
                <p className="text-xs text-white/80">Match <b className="text-white">5 in a row</b> &rarr; Rainbow. Clears all candies of one color.</p>
              </div>
              <div className="flex items-start gap-2 pt-1 border-t border-white/10">
                <Sparkles className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                <p className="text-xs text-white/80"><b className="text-white">Swap a special candy with any adjacent candy</b> to activate it directly &mdash; no match needed!</p>
              </div>
            </div>
            <button
              onClick={() => setShowHelp(false)}
              className="mt-2 px-5 py-2 rounded-xl bg-primary text-primary-foreground font-heading font-bold text-sm active:scale-95 transition-transform"
            >
              Got it!
            </button>
          </div>
        )}

        {gameState === "levelcomplete" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/75 backdrop-blur-sm gap-3 rounded-2xl px-4">
            {isNewHighScore && (
              <span className="px-3 py-1 rounded-full bg-gold/20 text-gold text-xs font-bold">New High Score!</span>
            )}
            <div className="flex gap-1">
              {[1, 2, 3].map((s) => (
                <span key={s} className={`text-3xl ${s <= stars ? "text-gold" : "text-white/20"}`}>&#9733;</span>
              ))}
            </div>
            <h3 className="font-heading font-bold text-2xl text-white">Level Complete!</h3>
            <p className="text-sm text-white/70">Score: {formatNumber(score)}</p>
            <div className="flex items-center gap-3 mt-2">
              <button onClick={retryLevel} className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-muted text-white font-heading font-bold text-sm active:scale-95 transition-transform">
                <RotateCcw className="w-4 h-4" /> Replay
              </button>
              <button onClick={nextLevel} className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-heading font-bold text-sm active:scale-95 transition-transform">
                Next <ChevronRight className="w-4 h-4" />
              </button>
              <button onClick={() => navigate("/")} className="px-5 py-2.5 rounded-xl bg-white/10 text-white font-heading font-bold text-sm active:scale-95 transition-transform">
                Hub
              </button>
            </div>
          </div>
        )}

        {gameState === "gameover" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/75 backdrop-blur-sm gap-3 rounded-2xl px-4">
            <h3 className="font-heading font-bold text-2xl text-white">Out of Moves!</h3>
            <p className="text-sm text-white/70">Final Score: {formatNumber(score)}</p>
            <p className="text-xs text-muted-foreground">Target was: {formatNumber(target)}</p>
            <div className="flex items-center gap-3 mt-2">
              <button onClick={retryLevel} className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-heading font-bold text-sm active:scale-95 transition-transform">
                <RotateCcw className="w-4 h-4" /> Retry
              </button>
              <button onClick={() => navigate("/")} className="px-5 py-2.5 rounded-xl bg-white/10 text-white font-heading font-bold text-sm active:scale-95 transition-transform">
                Hub
              </button>
            </div>
          </div>
        )}
      </div>

      <p className="text-xs text-muted-foreground text-center mt-2">
        Tap two candies to swap, or drag a candy to swap with an adjacent one
      </p>
    </div>
  );
}