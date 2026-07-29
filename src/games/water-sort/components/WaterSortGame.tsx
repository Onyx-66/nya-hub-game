import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { RotateCcw, Trophy } from "lucide-react";
import confetti from "canvas-confetti";
import { WaterSortEngine } from "../logic/waterSortEngine";
import {
  createConfig,
  getCanvasHeight,
  getTubeAtPosition,
  renderTubes,
  type RendererConfig,
} from "./waterSortRenderer";
import { useGameEconomy } from "@/hooks/useGameEconomy";
import { useEconomyStore } from "@/store/economyStore";
import { formatNumber } from "@/utils/formatting";

const GAME_ID = "water-sort";
const CANVAS_WIDTH = 320;

export default function WaterSortGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<WaterSortEngine | null>(null);
  const animationFrameRef = useRef<number>(0);
  const frameRef = useRef(0);
  const configRef = useRef<RendererConfig>(createConfig(CANVAS_WIDTH));

  const [level, setLevel] = useState(1);
  const [selectedTube, setSelectedTube] = useState<number | null>(null);
  const [moves, setMoves] = useState(0);
  const [gameState, setGameState] = useState<"playing" | "won">("playing");
  const [invalidFlash, setInvalidFlash] = useState<{ tube: number; time: number } | null>(null);
  const [isNewHighScore, setIsNewHighScore] = useState(false);

  const navigate = useNavigate();
  const { onGameStart, onGameEnd, highScore } = useGameEconomy(GAME_ID);
  const addPaws = useEconomyStore((s) => s.addPaws);
  const addGems = useEconomyStore((s) => s.addGems);

  // Init / restart on level change
  useEffect(() => {
    const engine = new WaterSortEngine(level);
    engine.onMove = (m) => setMoves(m);
    engine.onWin = () => {
      const par = engine.getPar();
      const actualMoves = engine.getMoves();
      const score = level * 1000 - actualMoves * 10;
      const stars = actualMoves < par ? 3 : actualMoves < par * 2 ? 2 : 1;
      const pawsReward = 10 + (stars === 3 ? 5 : 0);
      addPaws(pawsReward, `Water Sort level ${level} reward`);
      if (stars === 3) {
        addGems(1, `Water Sort 3-star bonus`);
      }
      onGameEnd(score, level, stars);
      setIsNewHighScore(score > highScore);
      setGameState("won");
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
    };
    engineRef.current = engine;
    onGameStart();
    setMoves(0);
    setSelectedTube(null);
    setGameState("playing");
    setIsNewHighScore(false);

    return () => cancelAnimationFrame(animationFrameRef.current);
  }, [level, onGameStart, onGameEnd, addPaws, highScore]);

  // Canvas height
  const tubeCount = engineRef.current?.tubes.length ?? 5;
  const canvasHeight = getCanvasHeight(tubeCount, configRef.current);

  // Render loop
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const engine = engineRef.current;
    if (!canvas || !engine) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    frameRef.current += 1;
    ctx.clearRect(0, 0, CANVAS_WIDTH, canvasHeight);
    renderTubes(ctx, engine, configRef.current, selectedTube, invalidFlash, frameRef.current);
  }, [selectedTube, invalidFlash, canvasHeight]);

  useEffect(() => {
    const loop = () => {
      draw();
      animationFrameRef.current = requestAnimationFrame(loop);
    };
    animationFrameRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animationFrameRef.current);
  }, [draw]);

  // Click/tap handler
  const handlePointer = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    const engine = engineRef.current;
    if (!canvas || !engine || engine.state !== "playing") return;
    const rect = canvas.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * CANVAS_WIDTH;
    const y = ((clientY - rect.top) / rect.height) * canvasHeight;
    const tubeIndex = getTubeAtPosition(x, y, configRef.current, engine.tubes.length);
    if (tubeIndex === null) return;

    if (selectedTube === null) {
      if (engine.tubes[tubeIndex].length > 0) setSelectedTube(tubeIndex);
    } else if (selectedTube === tubeIndex) {
      setSelectedTube(null);
    } else {
      const result = engine.pour(selectedTube, tubeIndex);
      if (!result.success) {
        setInvalidFlash({ tube: tubeIndex, time: Date.now() });
      }
      setSelectedTube(null);
    }
  };

  const onMouseDown = (e: React.MouseEvent) => handlePointer(e.clientX, e.clientY);
  const onTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    const t = e.touches[0];
    handlePointer(t.clientX, t.clientY);
  };

  const nextLevel = () => setLevel((l) => Math.min(l + 1, 10));
  const restartLevel = () => setLevel((l) => l); // triggers re-init via key change

  return (
    <div className="flex flex-col items-center w-full">
      {/* HUD */}
      <div className="flex items-center justify-between w-full max-w-[320px] mb-3">
        <span className="text-lg font-bold text-foreground">
          Moves: {formatNumber(moves)}
        </span>
        <span className="text-sm text-muted-foreground">
          Best: {highScore > 0 ? formatNumber(highScore) : "—"}
        </span>
      </div>

      {/* Level selector */}
      <div className="flex items-center gap-1.5 mb-3 flex-wrap justify-center">
        {Array.from({ length: 10 }, (_, i) => i + 1).map((lvl) => (
          <button
            key={lvl}
            onClick={() => setLevel(lvl)}
            className={`w-8 h-8 rounded-lg text-xs font-bold transition-all active:scale-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
              lvl === level
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {lvl}
          </button>
        ))}
      </div>

      {/* Canvas */}
      <div className="relative w-full max-w-[320px] touch-none select-none">
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={canvasHeight}
          className="block w-full h-auto rounded-2xl shadow-xl"
          style={{ aspectRatio: `${CANVAS_WIDTH} / ${canvasHeight}` }}
          onMouseDown={onMouseDown}
          onTouchStart={onTouchStart}
          aria-label="Water Sort game board"
          role="img"
        />

        {/* Win overlay */}
        {gameState === "won" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/75 backdrop-blur-sm gap-3 rounded-2xl px-4">
            {isNewHighScore && (
              <span className="px-3 py-1 rounded-full bg-gold/20 text-gold text-xs font-bold">
                New High Score!
              </span>
            )}
            <Trophy className="w-12 h-12 text-gold" />
            <h3 className="font-heading font-bold text-2xl text-white">Level Complete!</h3>
            <p className="text-sm text-white/70">{moves} moves</p>
            <div className="flex items-center gap-3 mt-2">
              <button
                onClick={restartLevel}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-muted text-white font-heading font-bold text-sm active:scale-95 transition-transform"
              >
                <RotateCcw className="w-4 h-4" /> Retry
              </button>
              {level < 10 && (
                <button
                  onClick={nextLevel}
                  className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-heading font-bold text-sm active:scale-95 transition-transform"
                >
                  Next Level
                </button>
              )}
              <button
                onClick={() => navigate("/")}
                className="px-5 py-2.5 rounded-xl bg-white/10 text-white font-heading font-bold text-sm active:scale-95 transition-transform"
              >
                Hub
              </button>
            </div>
          </div>
        )}
      </div>

      <p className="text-xs text-muted-foreground text-center mt-3">
        Tap a tube to select, tap another to pour
      </p>
    </div>
  );
}