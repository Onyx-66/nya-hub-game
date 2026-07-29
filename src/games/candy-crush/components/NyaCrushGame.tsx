import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { RotateCcw, ChevronRight } from "lucide-react";
import { NyaCrushEngine, type Position } from "../logic/nyaCrushEngine";
import {
  createRendererConfig,
  renderBoard,
  renderHUD,
  renderSwapAnimation,
  type NyaCrushRendererConfig,
} from "./NyaCrushRenderer";
import { useGameEconomy } from "@/hooks/useGameEconomy";
import { useEconomyStore } from "@/store/economyStore";
import { formatNumber } from "@/utils/formatting";

const GAME_ID = "candy-crush";

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
  const swapAnimRef = useRef<{ from: Position; to: Position; startTime: number } | null>(null);
  const inputLockedRef = useRef(false);

  const [level, setLevel] = useState(1);
  const [restartKey, setRestartKey] = useState(0);
  const [gameState, setGameState] = useState<"playing" | "gameover" | "levelcomplete">("playing");
  const [score, setScore] = useState(0);
  const [moves, setMoves] = useState(30);
  const [target, setTarget] = useState(1000);
  const [stars, setStars] = useState(0);
  const [isNewHighScore, setIsNewHighScore] = useState(false);

  const navigate = useNavigate();
  const { onGameStart, onGameEnd, highScore } = useGameEconomy(GAME_ID);
  const addPaws = useEconomyStore((s) => s.addPaws);
  const addGems = useEconomyStore((s) => s.addGems);

  useEffect(() => {
    const engine = new NyaCrushEngine(level);
    engine.onScoreChange = (s) => setScore(s);
    engine.onBoardUpdate = () => setMoves(engine.moves);
    engine.onGameOver = (finalScore) => {
      onGameEnd(finalScore, level, 0);
      addPaws(Math.floor(finalScore / 20), "Nya Crush reward");
      setIsNewHighScore(finalScore > highScore);
      setGameState("gameover");
    };
    engine.onLevelComplete = (finalScore, s) => {
      setStars(s);
      setIsNewHighScore(finalScore > highScore);
      onGameEnd(finalScore, level, s);
      addPaws(Math.floor(finalScore / 20), "Nya Crush reward");
      if (s === 3) addGems(1, "Nya Crush 3-star bonus");
      setGameState("levelcomplete");
    };
    engineRef.current = engine;
    engine.start();
    onGameStart();
    setScore(0);
    setMoves(engine.maxMoves);
    setTarget(engine.targetScore);
    setGameState("playing");
    setStars(0);
    setIsNewHighScore(false);
    popupsRef.current = [];
    swapAnimRef.current = null;
    inputLockedRef.current = false;

    return () => cancelAnimationFrame(animationFrameRef.current);
  }, [level, restartKey, onGameStart, onGameEnd, addPaws, addGems, highScore]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const engine = engineRef.current;
    if (!canvas || !engine) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const config = configRef.current;
    const time = performance.now();

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
        inputLockedRef.current = false;
      }
    } else {
      renderBoard(ctx, engine, config, time);
    }

    // Score popups
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

  // ── Input ──
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

  const onMouseDown = (e: React.MouseEvent) => handleCellClick(e.clientX, e.clientY);
  const onTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    const t = e.touches[0];
    handleCellClick(t.clientX, t.clientY);
  };

  const retryLevel = () => setRestartKey((k) => k + 1);
  const nextLevel = () => setLevel((l) => l + 1);

  const config = configRef.current;

  return (
    <div className="flex flex-col items-center w-full">
      <div className="flex items-center gap-3 mb-2">
        <span className="text-sm font-bold text-foreground">Level {level}</span>
        <span className="text-xs text-muted-foreground">Target: {formatNumber(target)}</span>
        {highScore > 0 && (
          <span className="text-xs text-muted-foreground">Best: {formatNumber(highScore)}</span>
        )}
      </div>

      <div className="relative w-full max-w-[400px] touch-none select-none">
        <canvas
          ref={canvasRef}
          width={config.canvasWidth}
          height={config.canvasHeight}
          className="block w-full h-auto rounded-2xl shadow-2xl"
          style={{ aspectRatio: `${config.canvasWidth} / ${config.canvasHeight}` }}
          onMouseDown={onMouseDown}
          onTouchStart={onTouchStart}
          aria-label="Nya Crush game board"
          role="img"
        />

        {gameState === "levelcomplete" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/75 backdrop-blur-sm gap-3 rounded-2xl px-4">
            {isNewHighScore && (
              <span className="px-3 py-1 rounded-full bg-gold/20 text-gold text-xs font-bold">New High Score!</span>
            )}
            <div className="flex gap-1">
              {[1, 2, 3].map((s) => (
                <span key={s} className={`text-3xl ${s <= stars ? "text-gold" : "text-white/20"}`}>★</span>
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
        Tap a candy, then tap an adjacent one to swap
      </p>
    </div>
  );
}