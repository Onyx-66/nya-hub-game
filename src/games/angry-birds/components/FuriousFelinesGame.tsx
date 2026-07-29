import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { RotateCcw, Trophy } from "lucide-react";
import confetti from "canvas-confetti";
import { FuriousFelinesEngine, CANVAS_WIDTH, CANVAS_HEIGHT } from "../logic/furiousFelinesEngine";
import {
  renderBackground, renderSlingshot, renderSlingshotBand,
  renderObjects, renderCurrentCat, renderParticles, renderTrajectory, renderHUD,
} from "./furiousFelinesRenderer";
import { useGameEconomy } from "@/hooks/useGameEconomy";
import { useEconomyStore } from "@/store/economyStore";

const GAME_ID = "angry-birds";

export default function FuriousFelinesGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<FuriousFelinesEngine | null>(null);
  const animationFrameRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);

  const [level, setLevel] = useState(1);
  const [gameState, setGameState] = useState<"playing" | "won" | "lost">("playing");
  const [score, setScore] = useState(0);
  const [stars, setStars] = useState(0);
  const [isNewHighScore, setIsNewHighScore] = useState(false);

  const navigate = useNavigate();
  const { onGameStart, onGameEnd, highScore } = useGameEconomy(GAME_ID);
  const addPaws = useEconomyStore((s) => s.addPaws);
  const addGems = useEconomyStore((s) => s.addGems);

  // Init engine
  useEffect(() => {
    const engine = new FuriousFelinesEngine(level);
    engine.onScoreChange = (s) => setScore(s);
    engine.onStateChange = (newState) => {
      if (newState === "complete") {
        const finalScore = engine.getScore();
        const newStars = finalScore > 10000 ? 3 : finalScore > 5000 ? 2 : 1;
        setStars(newStars);
        setIsNewHighScore(finalScore > highScore);
        addPaws(Math.floor(finalScore / 10), `Furious Felines level ${level} reward`);
        if (newStars === 3) addGems(1, `Furious Felines 3-star bonus`);
        onGameEnd(finalScore, level, newStars);
        setGameState("won");
        confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
        console.log("win");
      } else if (newState === "failed") {
        setGameState("lost");
        console.log("lose");
      }
    };
    engine.onCatLaunched = () => console.log("launch");
    engine.onHit = () => console.log("hit");
    engine.onDestroy = () => console.log("destroy");

    engineRef.current = engine;
    onGameStart();
    setScore(0);
    setGameState("playing");
    setIsNewHighScore(false);

    return () => cancelAnimationFrame(animationFrameRef.current);
  }, [level, onGameStart, onGameEnd, addPaws, addGems, highScore]);

  // Render + physics loop
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const engine = engineRef.current;
    if (!canvas || !engine) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const now = performance.now();
    const dt = Math.min((now - lastTimeRef.current) / 1000, 0.05);
    lastTimeRef.current = now;

    engine.update(dt);

    renderBackground(ctx);
    renderSlingshot(ctx, engine);
    renderObjects(ctx, engine.getObjects());
    renderCurrentCat(ctx, engine);
    renderSlingshotBand(ctx, engine);
    renderTrajectory(ctx, engine);
    renderParticles(ctx, engine.getParticles());
    renderHUD(ctx, engine.getScore(), engine.level, engine.getCatsLeft());
  }, []);

  useEffect(() => {
    lastTimeRef.current = performance.now();
    const loop = () => {
      draw();
      animationFrameRef.current = requestAnimationFrame(loop);
    };
    animationFrameRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animationFrameRef.current);
  }, [draw]);

  // Input handlers
  const getCoords = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((clientX - rect.left) / rect.width) * CANVAS_WIDTH,
      y: ((clientY - rect.top) / rect.height) * CANVAS_HEIGHT,
    };
  };

  const handleStart = (clientX: number, clientY: number) => {
    const c = getCoords(clientX, clientY);
    if (c) engineRef.current?.startDrag(c.x, c.y);
  };
  const handleMove = (clientX: number, clientY: number) => {
    const c = getCoords(clientX, clientY);
    if (c) engineRef.current?.updateDrag(c.x, c.y);
  };
  const handleEnd = () => {
    const sling = engineRef.current?.getSlingState();
    if (sling?.dragging) engineRef.current?.launch(0, 0);
  };

  const restartLevel = () => setLevel((l) => l);
  const nextLevel = () => setLevel((l) => Math.min(l + 1, 3));

  return (
    <div className="flex flex-col items-center w-full">
      {/* Level selector */}
      <div className="flex items-center gap-2 mb-3">
        {[1, 2, 3].map((lvl) => (
          <button
            key={lvl}
            onClick={() => setLevel(lvl)}
            className={`w-10 h-10 rounded-lg text-sm font-bold transition-all active:scale-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
              lvl === level ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
            }`}
          >
            {lvl}
          </button>
        ))}
      </div>

      {/* Canvas */}
      <div className="relative w-full max-w-[480px] touch-none select-none">
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className="block w-full h-auto rounded-2xl shadow-xl"
          style={{ aspectRatio: `${CANVAS_WIDTH} / ${CANVAS_HEIGHT}` }}
          onMouseDown={(e) => handleStart(e.clientX, e.clientY)}
          onMouseMove={(e) => handleMove(e.clientX, e.clientY)}
          onMouseUp={handleEnd}
          onMouseLeave={handleEnd}
          onTouchStart={(e) => { e.preventDefault(); const t = e.touches[0]; handleStart(t.clientX, t.clientY); }}
          onTouchMove={(e) => { e.preventDefault(); const t = e.touches[0]; handleMove(t.clientX, t.clientY); }}
          onTouchEnd={(e) => { e.preventDefault(); handleEnd(); }}
          aria-label="Furious Felines game"
          role="img"
        />

        {/* Win overlay */}
        {gameState === "won" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/75 backdrop-blur-sm gap-3 rounded-2xl px-4">
            {isNewHighScore && (
              <span className="px-3 py-1 rounded-full bg-gold/20 text-gold text-xs font-bold">New High Score!</span>
            )}
            <Trophy className="w-12 h-12 text-gold" />
            <h3 className="font-heading font-bold text-2xl text-white">Level Complete!</h3>
            <div className="flex gap-1">
              {[1, 2, 3].map((s) => (
                <span key={s} className={`text-2xl ${s <= stars ? "text-gold" : "text-white/20"}`}>★</span>
              ))}
            </div>
            <p className="text-sm text-white/70">Score: {score}</p>
            <div className="flex items-center gap-3 mt-2">
              <button onClick={restartLevel} className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-muted text-white font-heading font-bold text-sm active:scale-95 transition-transform">
                <RotateCcw className="w-4 h-4" /> Replay
              </button>
              {level < 3 && (
                <button onClick={nextLevel} className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-heading font-bold text-sm active:scale-95 transition-transform">
                  Next Level
                </button>
              )}
              <button onClick={() => navigate("/")} className="px-5 py-2.5 rounded-xl bg-white/10 text-white font-heading font-bold text-sm active:scale-95 transition-transform">
                Hub
              </button>
            </div>
          </div>
        )}

        {/* Lose overlay */}
        {gameState === "lost" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/75 backdrop-blur-sm gap-3 rounded-2xl px-4">
            <h3 className="font-heading font-bold text-2xl text-white">Try Again!</h3>
            <p className="text-sm text-white/70">Score: {score}</p>
            <div className="flex items-center gap-3 mt-2">
              <button onClick={restartLevel} className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-heading font-bold text-sm active:scale-95 transition-transform">
                <RotateCcw className="w-4 h-4" /> Retry
              </button>
              <button onClick={() => navigate("/")} className="px-5 py-2.5 rounded-xl bg-white/10 text-white font-heading font-bold text-sm active:scale-95 transition-transform">
                Hub
              </button>
            </div>
          </div>
        )}
      </div>

      <p className="text-xs text-muted-foreground text-center mt-3">
        Drag from the slingshot to aim, release to launch!
      </p>
    </div>
  );
}