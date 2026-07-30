import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { RefreshCw, Lightbulb, ChevronLeft, Star, Home } from "lucide-react";
import { MultiColorFillEngine } from "../logic/multiColorFillEngine";
import {
  createConfig,
  renderGrid,
  renderCurrentPath,
  renderCompletedPaths,
  renderParticles,
  updateParticles,
  spawnCelebrationParticles,
  pixelToCell,
  type RenderConfig,
  type Particle,
} from "./multiColorFillRenderer";
import { useGameEconomy } from "@/hooks/useGameEconomy";
import { useEconomyStore } from "@/store/economyStore";
import { audioService } from "@/services/audioService";
import { useAchievementStore } from "@/store/achievementStore";
import { useChallengeStore } from "@/store/challengeStore";

const GAME_ID = "multi-color-fill";
const CANVAS_WIDTH = 340;
const CANVAS_HEIGHT = 400;

export default function MultiColorFillGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<MultiColorFillEngine | null>(null);
  const animationFrameRef = useRef<number>(0);
  const frameRef = useRef(0);
  const currentPosRef = useRef<{ x: number; y: number } | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const levelStartTimeRef = useRef(Date.now());
  const hintsUsedRef = useRef(0);

  const [level, setLevel] = useState(1);
  const [moves, setMoves] = useState(0);
  const [hints, setHints] = useState(3);
  const [gameState, setGameState] = useState<"playing" | "won">("playing");
  const [config, setConfig] = useState<RenderConfig | null>(null);

  const navigate = useNavigate();
  const { onGameStart, onGameEnd, highScore } = useGameEconomy(GAME_ID);
  const addPaws = useEconomyStore((s) => s.addPaws);
  const addGems = useEconomyStore((s) => s.addGems);

  // Init engine
  useEffect(() => {
    const engine = new MultiColorFillEngine(level);
    engineRef.current = engine;
    const cfg = createConfig(CANVAS_WIDTH, CANVAS_HEIGHT, engine.rows, engine.cols);
    setConfig(cfg);
    setMoves(0);
    setHints(3);
    setGameState("playing");
    hintsUsedRef.current = 0;
    levelStartTimeRef.current = Date.now();
    particlesRef.current = [];
    onGameStart();
    audioService.playMusic("water-sort-calm", true);

    return () => {
      cancelAnimationFrame(animationFrameRef.current);
      audioService.stopMusic();
    };
  }, [level, onGameStart]);

  // Render loop
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const engine = engineRef.current;
    if (!canvas || !engine || !config) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    frameRef.current++;

    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    renderGrid(ctx, engine, config);
    renderCompletedPaths(ctx, engine, config);
    if (engine.isDrawing) {
      renderCurrentPath(ctx, engine, config, currentPosRef.current);
    }

    // Particles
    const dt = 1 / 60;
    updateParticles(particlesRef.current, dt);
    particlesRef.current = particlesRef.current.filter((p) => p.life > 0);
    renderParticles(ctx, particlesRef.current);
  }, [config]);

  useEffect(() => {
    const loop = () => {
      draw();
      animationFrameRef.current = requestAnimationFrame(loop);
    };
    animationFrameRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animationFrameRef.current);
  }, [draw]);

  // Pointer handlers
  const getCanvasPos = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas || !config) return null;
    const rect = canvas.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * CANVAS_WIDTH;
    const y = ((clientY - rect.top) / rect.height) * CANVAS_HEIGHT;
    return { x, y };
  };

  const handlePointerDown = (clientX: number, clientY: number) => {
    const engine = engineRef.current;
    if (!engine || !config || engine.state === "complete") return;
    const pos = getCanvasPos(clientX, clientY);
    if (!pos) return;
    const cell = pixelToCell(pos.x, pos.y, config);
    if (!cell) return;
    if (engine.startPath(cell.row, cell.col)) {
      audioService.playSFX("button-click");
    }
  };

  const handlePointerMove = (clientX: number, clientY: number) => {
    const engine = engineRef.current;
    if (!engine || !config) return;
    const pos = getCanvasPos(clientX, clientY);
    if (!pos) return;
    currentPosRef.current = pos;
    if (!engine.isDrawing) return;
    const cell = pixelToCell(pos.x, pos.y, config);
    if (!cell) return;
    const prevMoves = engine.moveCount;
    engine.continuePath(cell.row, cell.col);
    if (engine.moveCount > prevMoves) {
      audioService.playSFX("color-fill");
      setMoves(engine.moveCount);
    }
    // Check if path was auto-completed
    if (!engine.isDrawing && engine.paths.length > 0 && engine.state === "complete") {
      handleLevelComplete();
    } else if (!engine.isDrawing && engine.paths.length > 0) {
      audioService.playSFX("correct-answer");
    }
  };

  const handlePointerUp = (clientX: number, clientY: number) => {
    const engine = engineRef.current;
    if (!engine || !config) return;
    currentPosRef.current = null;
    if (!engine.isDrawing) return;
    const pos = getCanvasPos(clientX, clientY);
    if (!pos) {
      engine.cancelPath();
      return;
    }
    const cell = pixelToCell(pos.x, pos.y, config);
    if (!cell) {
      engine.cancelPath();
      return;
    }
    const success = engine.endPath(cell.row, cell.col);
    if (success) {
      audioService.playSFX("correct-answer");
      if (engine.state === "complete") {
        handleLevelComplete();
      }
    } else {
      audioService.playSFX("wrong-answer");
    }
  };

  const handleLevelComplete = () => {
    const engine = engineRef.current;
    if (!engine) return;
    const par = engine.getPar();
    const actualMoves = engine.moveCount;
    const elapsed = (Date.now() - levelStartTimeRef.current) / 1000;
    const stars = actualMoves <= par ? 3 : actualMoves <= par * 1.5 ? 2 : 1;
    const colorsCount = engine.getColorsCount();
    const score = level * 1000 + stars * 200 - actualMoves * 5;

    // Economy rewards
    let pawsReward = 20 + (stars === 3 ? 15 : 0);
    if (hintsUsedRef.current > 0) pawsReward = Math.floor(pawsReward * 0.7);
    addPaws(pawsReward, `Multi-Color Fill level ${level} reward`);
    if (stars === 3) {
      addGems(1, "Multi-Color Fill 3-star bonus");
    }
    onGameEnd(score, level, stars);

    // Achievements
    const ach = useAchievementStore.getState();
    ach.addProgress("mcf-level", 1);
    ach.addProgress(`plays:${GAME_ID}`, 1);
    ach.setProgress(`highScore:${GAME_ID}`, score);
    ach.setProgress(`stars:${GAME_ID}`, stars);
    if (stars === 3) ach.addProgress("mcf-three-star", 1);
    if (hintsUsedRef.current === 0) ach.addProgress("mcf-no-hints", 1);
    if (elapsed < 30) ach.addProgress("mcf-speed-30", 1);
    if (elapsed < 15) ach.addProgress("mcf-speed-15", 1);
    if (colorsCount >= 5) ach.addProgress("mcf-rainbow", 1);
    ach.addProgress("gamesPlayed", 1);
    ach.addProgress("totalStars", stars);

    // Challenges
    const ch = useChallengeStore.getState();
    ch.addProgress("gamesPlayed", 1);
    ch.addProgress("totalStars", stars);
    ch.addProgress(`plays:${GAME_ID}`, 1);
    ch.addProgress("mcf-levels", 1);
    if (stars === 3) ch.addProgress("mcf-three-star", 1);
    ch.addProgress("totalScore", score);

    // Celebration particles
    if (config) {
      spawnCelebrationParticles(config, particlesRef.current, ["#FF6B9D", "#60A5FA", "#FBBF24", "#34D399", "#A78BFA"]);
    }
    audioService.playSFX("game-win");
    setGameState("won");
  };

  const handleHint = () => {
    const engine = engineRef.current;
    if (!engine) return;
    const hint = engine.useHint();
    if (hint) {
      setHints(engine.hintsRemaining);
      hintsUsedRef.current++;
      audioService.playSFX("hint-use");
    }
  };

  const handleReset = () => {
    const engine = engineRef.current;
    if (!engine) return;
    engine.reset();
    setMoves(0);
    setHints(3);
    hintsUsedRef.current = 0;
    levelStartTimeRef.current = Date.now();
    setGameState("playing");
    audioService.playSFX("button-click");
  };

  const nextLevel = () => {
    const maxLevel = MultiColorFillEngine.getMaxLevels();
    setLevel((l) => Math.min(l + 1, maxLevel));
  };

  const replayLevel = () => {
    setLevel((l) => l);
    setGameState("playing");
  };

  const difficulty = engineRef.current?.getDifficulty() ?? "easy";
  const maxLevel = MultiColorFillEngine.getMaxLevels();

  return (
    <div className="flex flex-col items-center w-full">
      {/* HUD */}
      <div className="flex items-center justify-between w-full max-w-[340px] mb-3">
        <button
          onClick={() => navigate("/hub")}
          className="w-9 h-9 rounded-xl bg-muted/60 flex items-center justify-center"
          aria-label="Back to hub"
        >
          <ChevronLeft className="w-5 h-5 text-foreground" />
        </button>
        <div className="text-center">
          <span className="font-heading font-bold text-lg text-foreground">Level {level}</span>
          <span className="text-xs text-muted-foreground ml-2 capitalize">{difficulty}</span>
        </div>
        <button
          onClick={handleReset}
          className="w-9 h-9 rounded-xl bg-muted/60 flex items-center justify-center"
          aria-label="Reset level"
        >
          <RefreshCw className="w-4 h-4 text-foreground" />
        </button>
      </div>

      {/* Moves + High Score */}
      <div className="flex items-center justify-between w-full max-w-[340px] mb-2">
        <span className="text-sm text-muted-foreground">Moves: <span className="text-foreground font-bold">{moves || engineRef.current?.moveCount}</span></span>
        <span className="text-sm text-muted-foreground">Par: <span className="text-foreground font-bold">{engineRef.current?.getPar()}</span></span>
        <span className="text-sm text-muted-foreground">Best: <span className="text-foreground font-bold">{highScore > 0 ? highScore : "—"}</span></span>
      </div>

      {/* Canvas */}
      <div className="relative w-full max-w-[340px] touch-none select-none">
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className="block w-full h-auto rounded-2xl shadow-xl"
          style={{ aspectRatio: `${CANVAS_WIDTH} / ${CANVAS_HEIGHT}` }}
          onMouseDown={(e) => handlePointerDown(e.clientX, e.clientY)}
          onMouseMove={(e) => handlePointerMove(e.clientX, e.clientY)}
          onMouseUp={(e) => handlePointerUp(e.clientX, e.clientY)}
          onMouseLeave={() => {
            const engine = engineRef.current;
            if (engine?.isDrawing) engine.cancelPath();
            currentPosRef.current = null;
          }}
          onTouchStart={(e) => {
            e.preventDefault();
            const t = e.touches[0];
            handlePointerDown(t.clientX, t.clientY);
          }}
          onTouchMove={(e) => {
            e.preventDefault();
            const t = e.touches[0];
            handlePointerMove(t.clientX, t.clientY);
          }}
          onTouchEnd={(e) => {
            e.preventDefault();
            const t = e.changedTouches[0];
            handlePointerUp(t.clientX, t.clientY);
          }}
          aria-label="Multi-Color Fill puzzle grid"
          role="img"
        />

        {/* Hint button */}
        {gameState === "playing" && (
          <button
            onClick={handleHint}
            disabled={hints <= 0}
            className="absolute bottom-3 right-3 flex items-center gap-1.5 px-3 py-2 rounded-xl bg-primary/90 text-primary-foreground font-heading font-bold text-xs disabled:opacity-40 active:scale-95 transition-transform shadow-lg"
          >
            <Lightbulb className="w-4 h-4" />
            {hints}
          </button>
        )}

        {/* Win overlay */}
        {gameState === "won" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 flex flex-col items-center justify-center bg-black/75 backdrop-blur-sm gap-3 rounded-2xl px-4"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 15 }}
            >
              <Star className="w-12 h-12 text-gold fill-gold" />
            </motion.div>
            <h3 className="font-heading font-bold text-2xl text-white">
              {engineRef.current?.moveCount <= (engineRef.current?.getPar() ?? 0) ? "YOU CRUSHED IT!" : "CONGRATS!"}
            </h3>
            <div className="flex items-center gap-1">
              {[1, 2, 3].map((s) => {
                const earned = engineRef.current
                  ? engineRef.current.moveCount <= engineRef.current.getPar() * (s === 3 ? 1 : s === 2 ? 1.5 : 2)
                  : false;
                return (
                  <Star
                    key={s}
                    className={`w-7 h-7 ${earned ? "text-gold fill-gold" : "text-white/20"}`}
                  />
                );
              })}
            </div>
            <p className="text-sm text-white/70">
              {engineRef.current?.moveCount} moves (par {engineRef.current?.getPar()})
            </p>
            <div className="flex items-center gap-2 mt-2">
              <button
                onClick={replayLevel}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-muted text-white font-heading font-bold text-sm active:scale-95 transition-transform"
              >
                <RefreshCw className="w-4 h-4" /> Replay
              </button>
              {level < maxLevel && (
                <button
                  onClick={nextLevel}
                  className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-heading font-bold text-sm active:scale-95 transition-transform"
                >
                  Next Level
                </button>
              )}
              <button
                onClick={() => navigate("/hub")}
                className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center"
                aria-label="Back to hub"
              >
                <Home className="w-4 h-4 text-white" />
              </button>
            </div>
          </motion.div>
        )}
      </div>

      <p className="text-xs text-muted-foreground text-center mt-3 px-4">
        Drag from a colored dot to its matching star. Connect all pairs to win!
      </p>
    </div>
  );
}