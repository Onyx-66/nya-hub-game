import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { HelpCircle, Play, RotateCcw } from "lucide-react";
import { BlockBlastEngine, type Position } from "../logic/blockBlastEngine";
import {
  renderBoard,
  renderAvailableBlocks,
  renderGhost,
  createConfig,
  type RendererConfig,
} from "./blockBlastRenderer";
import { useGameEconomy } from "@/hooks/useGameEconomy";
import { formatNumber } from "@/utils/formatting";

const GAME_ID = "block-blast";
const CANVAS_WIDTH = 400;
const CANVAS_HEIGHT = 520;

function blockBlastStars(score: number): number {
  if (score > 5000) return 3;
  if (score > 1000) return 2;
  if (score > 0) return 1;
  return 0;
}

export default function BlockBlastGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<BlockBlastEngine | null>(null);
  const animationFrameRef = useRef<number>(0);
  const configRef = useRef<RendererConfig>(createConfig(CANVAS_WIDTH));
  const scoreRef = useRef(0);

  const [gameState, setGameState] = useState<"idle" | "playing" | "gameover">("idle");
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [selectedBlockIndex, setSelectedBlockIndex] = useState<number | null>(null);
  const [hoverPosition, setHoverPosition] = useState<Position | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isNewHighScore, setIsNewHighScore] = useState(false);
  const [scorePopup, setScorePopup] = useState<number | null>(null);
  const [showHelp, setShowHelp] = useState(false);

  const navigate = useNavigate();
  const { onGameStart, onGameEnd, highScore } = useGameEconomy(GAME_ID);
  const highScoreRef = useRef(highScore);
  highScoreRef.current = highScore;

  // ── Init engine ──
  useEffect(() => {
    const engine = new BlockBlastEngine();
    engine.onScoreChange = (s, c) => {
      const prev = scoreRef.current;
      scoreRef.current = s;
      setScore(s);
      setCombo(c);
      if (s > prev) {
        setScorePopup(s - prev);
        setTimeout(() => setScorePopup(null), 800);
      }
    };
    engine.onGameOver = () => {
      const finalScore = engine.score;
      const stars = blockBlastStars(finalScore);
      const isHigh = finalScore > highScoreRef.current;
      onGameEnd(finalScore, 1, stars);
      setIsNewHighScore(isHigh);
      setGameState("gameover");
    };
    engine.onBoardUpdate = () => {
      setSelectedBlockIndex(null);
      setHoverPosition(null);
      setIsDragging(false);
    };
    engineRef.current = engine;
    engine.start();
    onGameStart();
    setGameState("playing");
    scoreRef.current = 0;

    return () => cancelAnimationFrame(animationFrameRef.current);
  }, [onGameStart, onGameEnd]);

  // ── Render loop ──
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const engine = engineRef.current;
    if (!canvas || !engine) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const config = configRef.current;
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    renderBoard(ctx, engine, config);
    if (
      selectedBlockIndex !== null &&
      hoverPosition &&
      engine.availableBlocks[selectedBlockIndex]
    ) {
      const block = engine.availableBlocks[selectedBlockIndex]!;
      const isValid = engine.canPlaceBlock(block, hoverPosition);
      renderGhost(ctx, engine, block, hoverPosition, config, isValid);
    }
    renderAvailableBlocks(ctx, engine, config, selectedBlockIndex);
  }, [selectedBlockIndex, hoverPosition]);

  useEffect(() => {
    const loop = () => {
      draw();
      animationFrameRef.current = requestAnimationFrame(loop);
    };
    animationFrameRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animationFrameRef.current);
  }, [draw]);

  // ── Coordinate conversion ──
  const getCanvasCoords = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((clientX - rect.left) / rect.width) * CANVAS_WIDTH,
      y: ((clientY - rect.top) / rect.height) * CANVAS_HEIGHT,
    };
  };

  const getGridPosition = (x: number, y: number): Position | null => {
    const config = configRef.current;
    const col = Math.floor((x - config.boardX) / config.cellSize);
    const row = Math.floor((y - config.boardY) / config.cellSize);
    if (row < 0 || row >= 8 || col < 0 || col >= 8) return null;
    return { row, col };
  };

  // ── Pointer handlers ──
  const handlePointerDown = (clientX: number, clientY: number) => {
    const { x, y } = getCanvasCoords(clientX, clientY);
    const config = configRef.current;
    const engine = engineRef.current;
    if (!engine || engine.state !== "playing") return;
    if (y < config.blockPreviewY) return;
    const blockIndex = Math.floor(x / config.blockPreviewSpacing);
    if (blockIndex < 0 || blockIndex > 2 || !engine.availableBlocks[blockIndex]) return;
    setSelectedBlockIndex(blockIndex);
    setIsDragging(true);
  };

  const handlePointerMove = (clientX: number, clientY: number) => {
    if (!isDragging) return;
    const { x, y } = getCanvasCoords(clientX, clientY);
    setHoverPosition(getGridPosition(x, y));
  };

  const handlePointerUp = () => {
    if (!isDragging || selectedBlockIndex === null) {
      setIsDragging(false);
      return;
    }
    const engine = engineRef.current;
    if (engine && hoverPosition) {
      engine.placeBlock(selectedBlockIndex, hoverPosition);
    }
    setIsDragging(false);
    setSelectedBlockIndex(null);
    setHoverPosition(null);
  };

  // ── Mouse ──
  const onMouseDown = (e: React.MouseEvent) => handlePointerDown(e.clientX, e.clientY);
  const onMouseMove = (e: React.MouseEvent) => handlePointerMove(e.clientX, e.clientY);
  const onMouseUp = () => handlePointerUp();

  // ── Touch ──
  const onTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    const t = e.touches[0];
    handlePointerDown(t.clientX, t.clientY);
  };
  const onTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();
    const t = e.touches[0];
    handlePointerMove(t.clientX, t.clientY);
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault();
    handlePointerUp();
  };

  // ── Start / restart ──
  const startGame = () => {
    const engine = engineRef.current;
    if (!engine) return;
    engine.reset();
    onGameStart();
    scoreRef.current = 0;
    setScore(0);
    setCombo(0);
    setIsNewHighScore(false);
    setGameState("playing");
  };

  const quitGame = () => navigate("/");

  const isPlaying = gameState === "playing";

  return (
    <div className="flex flex-col items-center w-full">
      {/* HUD */}
      <div className="flex items-center justify-between w-full max-w-[400px] mb-2">
        <div className="flex items-baseline gap-2">
          <span className="text-lg font-bold text-foreground">
            Score: {formatNumber(score)}
          </span>
          {combo > 1 && (
            <span
              key={combo}
              className="text-xs font-bold text-accent animate-pulse"
            >
              {combo}x Combo!
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {highScore > 0 && (
            <span className="text-sm text-muted-foreground">
              Best: {formatNumber(highScore)}
            </span>
          )}
          <button
            onClick={() => setShowHelp((v) => !v)}
            className="w-9 h-9 rounded-xl bg-muted/60 flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            aria-label="Help"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>
      </div>

      {showHelp && (
        <div className="w-full max-w-[400px] mb-2 px-3 py-2 rounded-xl bg-muted/60 text-xs text-muted-foreground">
          Drag blocks onto the grid. Fill entire rows or columns to clear them and
          score points!
        </div>
      )}

      {/* Canvas + overlays */}
      <div className="relative w-full max-w-[400px] touch-none select-none">
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className="block w-full h-auto rounded-2xl shadow-2xl"
          style={{ aspectRatio: "400 / 520" }}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseUp}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          aria-label="Block Blast game board"
          role="img"
        />

        {/* Score popup */}
        {scorePopup !== null && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="text-3xl font-bold text-gold animate-bounce drop-shadow-lg">
              +{formatNumber(scorePopup)}
            </span>
          </div>
        )}

        {/* Game Over overlay */}
        {gameState === "gameover" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 backdrop-blur-sm gap-3 rounded-2xl px-4">
            {isNewHighScore && (
              <span className="px-3 py-1 rounded-full bg-gold/20 text-gold text-xs font-bold mb-1">
                New High Score!
              </span>
            )}
            <h3 className="font-heading font-bold text-3xl text-white">Game Over!</h3>
            <p className="text-sm text-white/70">Final Score</p>
            <span className="font-heading font-bold text-4xl text-white">
              {formatNumber(score)}
            </span>
            <div className="flex items-center gap-3 mt-2">
              <button
                onClick={startGame}
                className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-heading font-bold text-sm active:scale-95 transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <RotateCcw className="w-4 h-4" /> Play Again
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

      <p className="text-xs text-muted-foreground text-center mt-2">
        Drag a block onto the grid to place it
      </p>
    </div>
  );
}