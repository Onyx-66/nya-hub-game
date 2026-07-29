import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eraser, Lightbulb, Pencil, RotateCcw, Heart } from "lucide-react";
import confetti from "canvas-confetti";
import { MeowdokuEngine, type CellPosition, type Difficulty } from "../logic/meowdokuEngine";
import { useGameEconomy } from "@/hooks/useGameEconomy";
import { useEconomyStore } from "@/store/economyStore";
import { formatTime } from "@/utils/formatting";

const GAME_ID = "meowdoku";

const DIFFICULTY_REWARDS: Record<Difficulty, number> = {
  easy: 50,
  medium: 100,
  hard: 200,
};

const DIFFICULTY_BASE_SCORE: Record<Difficulty, number> = {
  easy: 1000,
  medium: 2000,
  hard: 3000,
};

export default function MeowdokuGame() {
  const engineRef = useRef<MeowdokuEngine | null>(null);
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [selectedCell, setSelectedCell] = useState<CellPosition | null>(null);
  const [noteMode, setNoteMode] = useState(false);
  const [mistakes, setMistakes] = useState(0);
  const [timer, setTimer] = useState(0);
  const [gameState, setGameState] = useState<"playing" | "won" | "lost">("playing");
  const [hintCell, setHintCell] = useState<CellPosition | null>(null);
  const [, forceRender] = useState(0);
  const [isNewHighScore, setIsNewHighScore] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);

  const navigate = useNavigate();
  const { onGameStart, onGameEnd, highScore } = useGameEconomy(GAME_ID);
  const addPaws = useEconomyStore((s) => s.addPaws);
  const spendPaws = useEconomyStore((s) => s.spendPaws);
  const addGems = useEconomyStore((s) => s.addGems);

  const triggerRender = useCallback(() => forceRender((v) => v + 1), []);

  // Init engine on difficulty change
  useEffect(() => {
    if (!gameStarted) return;
    const engine = new MeowdokuEngine(difficulty);
    engine.onWin = () => {
      const baseScore = DIFFICULTY_BASE_SCORE[difficulty];
      const elapsedMistakes = engine.mistakes;
      const elapsed = engine.getElapsedTime();
      const score = baseScore - elapsedMistakes * 100 - elapsed * 2;
      const stars = elapsedMistakes === 0 ? 3 : elapsedMistakes === 1 ? 2 : 1;
      const pawsReward = DIFFICULTY_REWARDS[difficulty] + (elapsedMistakes === 0 ? 25 : 0);
      addPaws(pawsReward, `Meowdoku ${difficulty} reward`);
      if (elapsedMistakes === 0) {
        addGems(1, `Meowdoku 0-mistake bonus`);
      }
      onGameEnd(Math.max(score, 0), 1, stars);
      setIsNewHighScore(score > highScore);
      setGameState("won");
      confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
    };
    engine.onMistake = (remaining) => {
      setMistakes(3 - remaining);
      if (remaining <= 0) setGameState("lost");
    };
    engineRef.current = engine;
    onGameStart();
    setMistakes(0);
    setTimer(0);
    setSelectedCell(null);
    setNoteMode(false);
    setGameState("playing");
    setIsNewHighScore(false);
  }, [difficulty, gameStarted, onGameStart, onGameEnd, addPaws, highScore]); // eslint-disable-line react-hooks/exhaustive-deps

  // Timer
  useEffect(() => {
    if (gameState !== "playing") return;
    const interval = setInterval(() => setTimer((t) => t + 1), 1000);
    return () => clearInterval(interval);
  }, [gameState]);

  const handleCellClick = (row: number, col: number) => {
    if (gameState !== "playing") return;
    engineRef.current!.selectedCell = { row, col };
    setSelectedCell({ row, col });
    setHintCell(null);
  };

  const handleNumberInput = (num: number) => {
    if (!selectedCell || gameState !== "playing") return;
    const engine = engineRef.current!;
    if (noteMode && num !== 0) {
      engine.toggleNote(selectedCell.row, selectedCell.col, num);
    } else {
      engine.setCell(selectedCell.row, selectedCell.col, num);
    }
    triggerRender();
  };

  const handleHint = () => {
    if (gameState !== "playing") return;
    if (!spendPaws(10, "Meowdoku hint")) return;
    const cell = engineRef.current!.getHint();
    setHintCell(cell);
    triggerRender();
  };

  const restart = () => {
    engineRef.current?.reset();
    setMistakes(0);
    setTimer(0);
    setSelectedCell(null);
    setGameState("playing");
    triggerRender();
  };

  const engine = engineRef.current;

  // Start screen with difficulty selection
  if (!gameStarted || !engine) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-6 px-4">
        <div className="text-center">
          <h2 className="font-heading text-2xl font-bold text-foreground mb-1">Meowdoku</h2>
          <p className="text-sm text-muted-foreground">Choose your difficulty</p>
        </div>
        <div className="flex flex-col gap-2 w-full max-w-[240px]">
          {(["easy", "medium", "hard"] as Difficulty[]).map((d) => (
            <button
              key={d}
              onClick={() => setDifficulty(d)}
              className={`flex items-center justify-between px-5 py-3 rounded-xl text-sm font-bold capitalize transition-all active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                d === difficulty
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              <span>{d}</span>
              <span className="text-xs opacity-70">
                {d === "easy" ? "35 gaps" : d === "medium" ? "45 gaps" : "55 gaps"}
              </span>
            </button>
          ))}
        </div>
        <button
          onClick={() => setGameStarted(true)}
          className="px-8 py-3 rounded-xl bg-gradient-to-r from-pink-400 to-violet-400 text-white font-heading font-bold text-sm active:scale-95 transition-transform"
        >
          Start Game
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center w-full">
      {/* HUD */}
      <div className="flex items-center justify-between w-full max-w-[340px] mb-3 text-sm">
        <span className="font-bold text-foreground">{formatTime(timer)}</span>
        <div className="flex items-center gap-1">
          {Array.from({ length: 3 }, (_, i) => (
            <Heart
              key={i}
              className={`w-4 h-4 ${i < 3 - mistakes ? "fill-rose-500 text-rose-500" : "text-muted-foreground/30"}`}
            />
          ))}
        </div>
        <span className="text-muted-foreground">
          Best: {highScore > 0 ? highScore : "—"}
        </span>
      </div>

      {/* Current difficulty badge */}
      <div className="mb-3">
        <span className="px-3 py-1 rounded-lg text-xs font-bold capitalize bg-muted text-muted-foreground">
          {difficulty}
        </span>
      </div>

      {/* 9x9 Grid */}
      <div className="relative">
        {/* Cat ears decoration */}
        <div className="absolute -top-3 left-0 w-0 h-0 border-l-[12px] border-r-[12px] border-b-[16px] border-l-transparent border-r-transparent border-b-primary/40" />
        <div className="absolute -top-3 right-0 w-0 h-0 border-l-[12px] border-r-[12px] border-b-[16px] border-l-transparent border-r-transparent border-b-primary/40" />

        <div className="inline-grid grid-cols-9 border-2 border-primary/30 rounded-lg overflow-hidden bg-card">
          {Array.from({ length: 81 }, (_, i) => {
            const row = Math.floor(i / 9);
            const col = i % 9;
            const value = engine.puzzle[row][col];
            const isSelected = selectedCell?.row === row && selectedCell?.col === col;
            const inSameUnit =
              selectedCell &&
              (selectedCell.row === row ||
                selectedCell.col === col ||
                (Math.floor(selectedCell.row / 3) === Math.floor(row / 3) &&
                  Math.floor(selectedCell.col / 3) === Math.floor(col / 3)));
            const isGiven = engine.given[row][col];
            const isHint = hintCell?.row === row && hintCell?.col === col;
            const sameValue = selectedCell && value !== 0 && engine.puzzle[selectedCell.row]?.[selectedCell.col] === value;
            const borderRight =
              (col + 1) % 3 === 0 && col < 8 ? "border-r-2 border-r-primary/40" : "border-r border-r-primary/10";
            const borderBottom =
              (row + 1) % 3 === 0 && row < 8 ? "border-b-2 border-b-primary/40" : "border-b border-b-primary/10";

            return (
              <button
                key={i}
                onClick={() => handleCellClick(row, col)}
                className={`w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center text-sm font-bold transition-colors ${borderRight} ${borderBottom} ${
                  isSelected
                    ? "bg-primary/40"
                    : isHint
                      ? "bg-gold/30"
                      : sameValue
                        ? "bg-accent/10"
                        : inSameUnit
                          ? "bg-primary/10"
                          : "bg-transparent"
                } ${isGiven ? "text-foreground" : value !== 0 ? "text-accent" : "text-muted-foreground"}`}
              >
                {value !== 0 ? (
                  value
                ) : engine.notes[row][col].size > 0 ? (
                  <div className="grid grid-cols-3 gap-0 w-full h-full p-0.5">
                    {Array.from({ length: 9 }, (_, n) => (
                      <span key={n} className="text-[7px] text-muted-foreground/70 flex items-center justify-center">
                        {engine.notes[row][col].has(n + 1) ? n + 1 : ""}
                      </span>
                    ))}
                  </div>
                ) : (
                  ""
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Number pad + controls */}
      <div className="flex items-center gap-2 mt-4 flex-wrap justify-center">
        <button
          onClick={() => setNoteMode((v) => !v)}
          className={`flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 ${
            noteMode ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground"
          }`}
        >
          <Pencil className="w-3.5 h-3.5" /> Notes
        </button>
        {Array.from({ length: 9 }, (_, i) => i + 1).map((n) => {
          const count = engine.puzzle.flat().filter((v) => v === n).length;
          const remaining = 9 - count;
          return (
            <button
              key={n}
              onClick={() => handleNumberInput(n)}
              className="relative w-9 h-9 rounded-lg bg-muted text-foreground font-bold text-sm active:scale-90 transition-transform hover:bg-muted/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {n}
              {remaining > 0 && (
                <span className="absolute -top-1 -right-1 text-[8px] bg-primary/40 text-primary-foreground rounded-full w-3.5 h-3.5 flex items-center justify-center leading-none">
                  {remaining}
                </span>
              )}
            </button>
          );
        })}
        <button
          onClick={() => handleNumberInput(0)}
          className="w-9 h-9 rounded-lg bg-muted text-muted-foreground active:scale-90 transition-transform"
          aria-label="Clear cell"
        >
          <Eraser className="w-4 h-4 mx-auto" />
        </button>
        <button
          onClick={handleHint}
          className="flex items-center gap-1 px-3 py-2 rounded-xl bg-gold/20 text-gold text-xs font-bold active:scale-95 transition-transform"
        >
          <Lightbulb className="w-3.5 h-3.5" /> Hint
        </button>
      </div>

      {/* Win / Lose overlays */}
      {gameState !== "playing" && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/75 backdrop-blur-sm rounded-2xl">
          <div className="flex flex-col items-center gap-3 px-6">
            {gameState === "won" ? (
              <>
                {isNewHighScore && (
                  <span className="px-3 py-1 rounded-full bg-gold/20 text-gold text-xs font-bold">
                    New High Score!
                  </span>
                )}
                <h3 className="font-heading font-bold text-3xl text-white">Purrfect!</h3>
                <p className="text-sm text-white/70">
                  {formatTime(timer)} · {mistakes} mistakes
                </p>
              </>
            ) : (
              <h3 className="font-heading font-bold text-3xl text-white">Game Over!</h3>
            )}
            <div className="flex items-center gap-3 mt-2">
              <button
                onClick={restart}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-heading font-bold text-sm active:scale-95 transition-transform"
              >
                <RotateCcw className="w-4 h-4" /> Play Again
              </button>
              <button
                onClick={() => setGameStarted(false)}
                className="px-5 py-2.5 rounded-xl bg-white/10 text-white font-heading font-bold text-sm active:scale-95 transition-transform"
              >
                New Game
              </button>
              <button
                onClick={() => navigate("/")}
                className="px-5 py-2.5 rounded-xl bg-white/10 text-white font-heading font-bold text-sm active:scale-95 transition-transform"
              >
                Hub
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}