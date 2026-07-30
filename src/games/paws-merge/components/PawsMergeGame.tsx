import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Sparkles, Undo2, Pause, Play, Home, Trophy } from "lucide-react";
import { PawsMergeEngine, TIERS } from "../logic/pawsMergeEngine";
import {
  renderContainer,
  renderPaws,
  renderDropPreview,
  renderNextQueue,
  renderProgressionBar,
  renderMergeEffects,
  updateMergeParticles,
  spawnMergeParticles,
  type MergeParticle,
} from "./pawsMergeRenderer";
import { useGameEconomy } from "@/hooks/useGameEconomy";
import { useEconomyStore } from "@/store/economyStore";
import { audioService } from "@/services/audioService";
import { useAchievementStore } from "@/store/achievementStore";
import { useChallengeStore } from "@/store/challengeStore";
import { formatNumber } from "@/utils/formatting";

const GAME_ID = "paws-merge";
const CANVAS_WIDTH = 300;
const CANVAS_HEIGHT = 500;

export default function PawsMergeGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<PawsMergeEngine | null>(null);
  const animationFrameRef = useRef<number>(0);
  const lastTimeRef = useRef(0);
  const frameRef = useRef(0);
  const mergeParticlesRef = useRef<MergeParticle[]>([]);
  const prevPawCountRef = useRef(0);
  const prevScoreRef = useRef(0);

  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [dusterUses, setDusterUses] = useState(2);
  const [gameState, setGameState] = useState<"aiming" | "playing" | "gameover">("aiming");
  const [dusterMode, setDusterMode] = useState(false);
  const [paused, setPaused] = useState(false);
  const [isNewHighScore, setIsNewHighScore] = useState(false);

  const navigate = useNavigate();
  const { onGameStart, onGameEnd, highScore: ecoHighScore } = useGameEconomy(GAME_ID);
  const addPaws = useEconomyStore((s) => s.addPaws);
  const addGems = useEconomyStore((s) => s.addGems);

  // Init engine
  useEffect(() => {
    const engine = new PawsMergeEngine();
    engine.startGame();
    engineRef.current = engine;
    setScore(0);
    setHighScore(engine.highScore);
    setDusterUses(2);
    setGameState("aiming");
    setDusterMode(false);
    setPaused(false);
    setIsNewHighScore(false);
    prevPawCountRef.current = 0;
    prevScoreRef.current = 0;
    onGameStart();
    audioService.playMusic("nya-crush-happy", true);

    return () => {
      cancelAnimationFrame(animationFrameRef.current);
      audioService.stopMusic();
    };
  }, [onGameStart]);

  // Game loop
  const draw = useCallback((timestamp: number) => {
    const canvas = canvasRef.current;
    const engine = engineRef.current;
    if (!canvas || !engine) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    if (!lastTimeRef.current) lastTimeRef.current = timestamp;
    const dt = Math.min((timestamp - lastTimeRef.current) / 1000, 1 / 30);
    lastTimeRef.current = timestamp;
    frameRef.current++;

    if (!paused && gameState !== "gameover") {
      engine.update(dt);

      // Detect merges (score increased)
      if (engine.score > prevScoreRef.current) {
        const lastPaw = engine.paws[engine.paws.length - 1];
        if (lastPaw) {
          spawnMergeParticles(lastPaw.x, lastPaw.y, lastPaw.color, mergeParticlesRef.current);
        }
        if (engine.maxTierReached >= 8) {
          audioService.playSFX("achievement-unlock");
        } else {
          audioService.playSFX("paw-earn");
        }
        prevScoreRef.current = engine.score;
        setScore(engine.score);

        // Chain merge achievement
        if (engine.mergeChainCount >= 5) {
          useAchievementStore.getState().addProgress("pm-chain-merge", 1);
        }
      }

      // Detect new paw dropped
      if (engine.paws.length > prevPawCountRef.current) {
        audioService.playSFX("block-place");
        prevPawCountRef.current = engine.paws.length;
      } else if (engine.paws.length < prevPawCountRef.current) {
        prevPawCountRef.current = engine.paws.length;
      }

      // Check game over
      if (engine.checkGameOver()) {
        handleGameOver();
      }

      // Update state
      if (engine.state === "aiming" && gameState === "playing") {
        setGameState("aiming");
      } else if (engine.state === "dropping" && gameState === "aiming") {
        setGameState("playing");
      }
    }

    // Update particles
    updateMergeParticles(mergeParticlesRef.current, dt);
    mergeParticlesRef.current = mergeParticlesRef.current.filter((p) => p.life > 0);

    // Render
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    renderContainer(ctx, engine, frameRef.current);
    renderPaws(ctx, engine.getPaws(), frameRef.current);
    renderDropPreview(ctx, engine, frameRef.current);
    renderNextQueue(ctx, engine, frameRef.current);
    renderMergeEffects(ctx, mergeParticlesRef.current);

    // Progression bar at bottom
    const barY = CANVAS_HEIGHT - 16;
    renderProgressionBar(ctx, engine, barY, CANVAS_WIDTH - 20, 10, frameRef.current);
  }, [paused, gameState]);

  useEffect(() => {
    const loop = (ts: number) => {
      draw(ts);
      animationFrameRef.current = requestAnimationFrame(loop);
    };
    animationFrameRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animationFrameRef.current);
  }, [draw]);

  const handleGameOver = () => {
    const engine = engineRef.current;
    if (!engine) return;
    const finalScore = engine.score;
    const maxTier = engine.maxTierReached;
    const wasNewHigh = finalScore > engine.highScore;
    setGameState("gameover");
    setIsNewHighScore(wasNewHigh);
    audioService.playSFX("game-lose");

    // Economy rewards
    const pawsReward = Math.floor(finalScore / 2);
    addPaws(pawsReward, "Paws Merge game reward");
    if (maxTier >= 11) {
      addPaws(50, "Paws Merge tier 11 bonus");
      addGems(5, "Paws Merge tier 11 bonus");
    }
    if (wasNewHigh) {
      addPaws(25, "Paws Merge high score bonus");
      addGems(1, "Paws Merge high score bonus");
    }

    onGameEnd(finalScore, maxTier, maxTier >= 8 ? 3 : maxTier >= 5 ? 2 : 1);

    // Achievements
    const ach = useAchievementStore.getState();
    ach.addProgress("pm-score", finalScore);
    ach.setProgress("pm-max-tier", maxTier);
    ach.addProgress(`plays:${GAME_ID}`, 1);
    ach.setProgress(`highScore:${GAME_ID}`, finalScore);
    ach.addProgress("gamesPlayed", 1);
    ach.addProgress("totalScore", finalScore);

    // Challenges
    const ch = useChallengeStore.getState();
    ch.addProgress("gamesPlayed", 1);
    ch.addProgress("totalScore", finalScore);
    ch.addProgress(`plays:${GAME_ID}`, 1);
    ch.setProgress("pm-tier", maxTier);
    ch.setProgress("pm-score", finalScore);
  };

  // Pointer handlers
  const getCanvasX = (clientX: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return 0;
    const rect = canvas.getBoundingClientRect();
    return ((clientX - rect.left) / rect.width) * CANVAS_WIDTH;
  };

  const handleMove = (clientX: number) => {
    const engine = engineRef.current;
    if (!engine || engine.state !== "aiming" || paused) return;
    engine.setDropX(getCanvasX(clientX));
  };

  const handleClick = (clientX: number, clientY: number) => {
    const engine = engineRef.current;
    if (!engine || paused || gameState === "gameover") return;

    if (dusterMode) {
      // Find paw at click position
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const x = ((clientX - rect.left) / rect.width) * CANVAS_WIDTH;
      const y = ((clientY - rect.top) / rect.height) * CANVAS_HEIGHT;
      const paw = engine.getPaws().find((p) => {
        const dx = p.x - x;
        const dy = p.y - y;
        return Math.sqrt(dx * dx + dy * dy) < p.radius;
      });
      if (paw) {
        engine.useDuster(paw.id);
        setDusterUses(engine.dusterUses);
        setDusterMode(false);
        audioService.playSFX("block-clear");
        useAchievementStore.getState().addProgress("pm-duster", 1);
        useChallengeStore.getState().addProgress("pm-duster", 1);
      }
      return;
    }

    if (engine.state === "aiming") {
      engine.setDropX(getCanvasX(clientX));
      engine.drop();
      prevPawCountRef.current = engine.paws.length;
      setScore(engine.score);
      setGameState("playing");
    }
  };

  const toggleDuster = () => {
    if (dusterUses <= 0) return;
    setDusterMode(!dusterMode);
    audioService.playSFX("button-click");
  };

  const handleUndo = () => {
    const engine = engineRef.current;
    if (!engine) return;
    engine.undo();
    prevPawCountRef.current = engine.paws.length;
    prevScoreRef.current = engine.score;
    setScore(engine.score);
    setGameState("aiming");
    audioService.playSFX("button-click");
  };

  const restart = () => {
    const engine = engineRef.current;
    if (!engine) return;
    engine.startGame();
    setScore(0);
    setDusterUses(2);
    setGameState("aiming");
    setDusterMode(false);
    setPaused(false);
    setIsNewHighScore(false);
    prevPawCountRef.current = 0;
    prevScoreRef.current = 0;
    onGameStart();
    audioService.playSFX("game-start");
  };

  const currentTierDef = TIERS[engineRef.current ? engineRef.current.currentPawTier - 1 : 0];

  return (
    <div className="flex flex-col items-center w-full">
      {/* HUD */}
      <div className="flex items-center justify-between w-full max-w-[300px] mb-2">
        <div className="flex gap-2">
          <button
            onClick={toggleDuster}
            disabled={dusterUses <= 0}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all active:scale-95 ${
              dusterMode
                ? "bg-amber-500 text-white"
                : "bg-muted text-foreground disabled:opacity-40"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            {dusterUses}
          </button>
          <button
            onClick={handleUndo}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-muted text-foreground text-xs font-bold active:scale-95 transition-transform"
            aria-label="Undo"
          >
            <Undo2 className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="text-center">
          <span className="font-heading font-bold text-xl text-foreground">{formatNumber(score)}</span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setPaused(!paused)}
            className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center active:scale-95 transition-transform"
            aria-label={paused ? "Resume" : "Pause"}
          >
            {paused ? <Play className="w-4 h-4 text-foreground" /> : <Pause className="w-4 h-4 text-foreground" />}
          </button>
        </div>
      </div>

      <div className="flex justify-between w-full max-w-[300px] mb-1">
        <span className="text-xs text-muted-foreground">Dropping: {currentTierDef?.name}</span>
        <span className="text-xs text-muted-foreground">Best: {highScore > 0 ? formatNumber(highScore) : "—"}</span>
      </div>

      {/* Canvas */}
      <div className="relative w-full max-w-[300px] touch-none select-none">
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className={`block w-full h-auto rounded-2xl shadow-xl ${dusterMode ? "cursor-crosshair" : ""}`}
          style={{ aspectRatio: `${CANVAS_WIDTH} / ${CANVAS_HEIGHT}` }}
          onMouseMove={(e) => handleMove(e.clientX)}
          onClick={(e) => handleClick(e.clientX, e.clientY)}
          onTouchStart={(e) => {
            e.preventDefault();
            const t = e.touches[0];
            handleMove(t.clientX);
          }}
          onTouchMove={(e) => {
            e.preventDefault();
            const t = e.touches[0];
            handleMove(t.clientX);
          }}
          onTouchEnd={(e) => {
            e.preventDefault();
            const t = e.changedTouches[0];
            handleClick(t.clientX, t.clientY);
          }}
          aria-label="Paws Merge game container"
          role="img"
        />

        {/* Duster mode indicator */}
        {dusterMode && gameState !== "gameover" && (
          <div className="absolute top-2 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-amber-500 text-white text-xs font-bold">
            Tap a paw to remove!
          </div>
        )}

        {/* Pause overlay */}
        {paused && gameState !== "gameover" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 backdrop-blur-sm gap-4 rounded-2xl">
            <p className="font-heading font-bold text-xl text-white">Paused</p>
            <button
              onClick={() => setPaused(false)}
              className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-heading font-bold text-sm active:scale-95 transition-transform"
            >
              Resume
            </button>
          </div>
        )}

        {/* Game over overlay */}
        {gameState === "gameover" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm gap-3 rounded-2xl px-4"
          >
            {isNewHighScore && (
              <span className="px-3 py-1 rounded-full bg-gold/20 text-gold text-xs font-bold">
                New High Score!
              </span>
            )}
            <Trophy className="w-12 h-12 text-gold" />
            <h3 className="font-heading font-bold text-2xl text-white">Game Over!</h3>
            <p className="text-sm text-white/70">Final Score: {formatNumber(score)}</p>
            <p className="text-xs text-white/50">
              Highest: {engineRef.current ? TIERS[engineRef.current.maxTierReached - 1].name : "—"}
            </p>
            <div className="flex items-center gap-2 mt-2">
              <button
                onClick={restart}
                className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-heading font-bold text-sm active:scale-95 transition-transform"
              >
                Play Again
              </button>
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

      <p className="text-xs text-muted-foreground text-center mt-2 px-4">
        {dusterMode
          ? "Tap a paw to remove it with the duster!"
          : "Move to aim, tap to drop. Merge same paws to evolve!"}
      </p>
    </div>
  );
}