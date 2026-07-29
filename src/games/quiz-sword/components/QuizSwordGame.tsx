import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sword, Clock, Globe, FlaskConical, Scroll, Gamepad2, PawPrint, RotateCcw, Trophy, Heart } from "lucide-react";
import confetti from "canvas-confetti";
import { QuizEngine, type QuizCategory, type QuizState } from "../logic/quizEngine";
import { useGameEconomy } from "@/hooks/useGameEconomy";
import { useEconomyStore } from "@/store/economyStore";

const GAME_ID = "quiz-sword";

const CATEGORY_ICONS: Record<string, { icon: typeof Globe; label: string; labelAr: string }> = {
  all: { icon: Globe, label: "All", labelAr: "الكل" },
  general: { icon: Globe, label: "General", labelAr: "عام" },
  science: { icon: FlaskConical, label: "Science", labelAr: "علوم" },
  history: { icon: Scroll, label: "History", labelAr: "تاريخ" },
  gaming: { icon: Gamepad2, label: "Gaming", labelAr: "ألعاب" },
  cats: { icon: PawPrint, label: "Cats", labelAr: "قطط" },
};

export default function QuizSwordGame() {
  const [gameState, setGameState] = useState<QuizState>("menu");
  const [category, setCategory] = useState<QuizCategory | "all">("all");
  const [language, setLanguage] = useState<"en" | "ar">("en");
  const [selectedAnswer, setSelectedAnswer] = useState(-1);
  const [answered, setAnswered] = useState(false);
  const [answerResult, setAnswerResult] = useState<{ correct: boolean; explanation: string } | null>(null);
  const [timeLeft, setTimeLeft] = useState(15);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [swordCharge, setSwordCharge] = useState(0);
  const [stars, setStars] = useState(0);

  const engineRef = useRef<QuizEngine | null>(null);
  const navigate = useNavigate();
  const { onGameStart, onGameEnd, highScore } = useGameEconomy(GAME_ID);
  const addPaws = useEconomyStore((s) => s.addPaws);
  const addGems = useEconomyStore((s) => s.addGems);

  const isAr = language === "ar";

  // ── Start game ──
  const startGame = () => {
    const engine = new QuizEngine(category, language);
    engineRef.current = engine;
    engine.startGame();
    onGameStart();
    setGameState("playing");
    setCurrentQIndex(0);
    setSelectedAnswer(-1);
    setAnswerResult(null);
    setAnswered(false);
    setScore(0);
    setSwordCharge(0);
  };

  // ── Handle answer ──
  const handleAnswer = (index: number) => {
    if (answered) return;
    const engine = engineRef.current;
    if (!engine) return;
    const result = engine.answerQuestion(index);
    setSelectedAnswer(index);
    setAnswerResult(result);
    setAnswered(true);
    setScore(engine.score);
    setSwordCharge(engine.swordCharge);
  };

  // ── Handle next question ──
  const handleNext = () => {
    const engine = engineRef.current;
    if (!engine) return;
    engine.nextQuestion();
    const newState = engine.getState();
    if (newState === "victory") {
      const reg = engine.correctAnswers - engine.bossCorrect;
      const boss = engine.bossCorrect;
      const newStars = reg >= 10 && boss >= 3 ? 3 : reg >= 8 ? 2 : 1;
      setStars(newStars);
      const paws = engine.correctAnswers * 10 + 50 + (newStars === 3 ? 100 : 0);
      addPaws(paws, "Quiz Sword victory");
      addGems(1, "Quiz Sword boss victory");
      onGameEnd(engine.score, 1, newStars);
      setGameState("victory");
      confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
    } else if (newState === "defeat") {
      setGameState("defeat");
    } else {
      setGameState(newState);
      setCurrentQIndex(engine.currentQuestionIndex);
      setSelectedAnswer(-1);
      setAnswerResult(null);
      setAnswered(false);
    }
  };

  const handleNextRef = useRef(handleNext);
  handleNextRef.current = handleNext;

  // ── Timer ──
  useEffect(() => {
    if ((gameState !== "playing" && gameState !== "boss") || answered) return;
    const duration = gameState === "boss" ? 10 : 15;
    setTimeLeft(duration);
    const interval = setInterval(() => {
      setTimeLeft((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [gameState, currentQIndex, answered]);

  // ── Timeout auto-submit ──
  useEffect(() => {
    if (timeLeft > 0 || answered || (gameState !== "playing" && gameState !== "boss")) return;
    const engine = engineRef.current;
    if (!engine) return;
    const result = engine.answerQuestion(-1);
    setSelectedAnswer(-1);
    setAnswerResult(result);
    setAnswered(true);
    setScore(engine.score);
    setSwordCharge(engine.swordCharge);
  }, [timeLeft, answered, gameState]);

  // ── Auto-advance after answer ──
  useEffect(() => {
    if (!answered) return;
    const timeout = setTimeout(() => handleNextRef.current(), 2000);
    return () => clearTimeout(timeout);
  }, [answered, currentQIndex]);

  const engine = engineRef.current;
  const question = engine?.getCurrentQuestion();
  const progress = engine?.getProgress();
  const bossProgress = engine?.getBossProgress();
  const isBoss = gameState === "boss";
  const maxTime = isBoss ? 10 : 15;

  // ── Mascot emoji ──
  const mascot = !answered ? "🤔" : answerResult?.correct ? "😺" : "😿";
  const bossMascot = isBoss ? (answered ? (answerResult?.correct ? "⚔️" : "💢") : "😾") : null;

  // ═══ MENU SCREEN ═══
  if (gameState === "menu") {
    return (
      <div className="flex flex-col items-center w-full gap-5 py-4">
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <Sword className="w-8 h-8 text-primary rotate-[-45deg]" />
            <h2 className="font-heading text-2xl font-bold text-foreground">
              {isAr ? "سيف المعرفة" : "Sword of Knowledge"}
            </h2>
            <Sword className="w-8 h-8 text-primary rotate-45" />
          </div>
          <p className="text-sm text-muted-foreground">
            {isAr ? "اختبر معرفتك واهزم الزعيم!" : "Test your knowledge and defeat the boss!"}
          </p>
        </div>

        {/* Language toggle */}
        <div className="flex gap-2">
          <button onClick={() => setLanguage("en")} className={`px-4 py-1.5 rounded-lg text-sm font-bold ${language === "en" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>English</button>
          <button onClick={() => setLanguage("ar")} className={`px-4 py-1.5 rounded-lg text-sm font-bold ${language === "ar" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>العربية</button>
        </div>

        {/* Category selector */}
        <div className="w-full">
          <p className="text-xs font-bold text-muted-foreground mb-2 text-center">
            {isAr ? "اختر الفئة" : "Choose Category"}
          </p>
          <div className="flex gap-2 overflow-x-auto pb-2 justify-start sm:justify-center">
            {(Object.keys(CATEGORY_ICONS) as (QuizCategory | "all")[]).map((cat) => {
              const ci = CATEGORY_ICONS[cat];
              const Icon = ci.icon;
              return (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`flex flex-col items-center gap-1 px-4 py-3 rounded-2xl min-w-[72px] transition-all active:scale-95 ${
                    category === cat ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  }`}
                >
                  <Icon className="w-6 h-6" />
                  <span className="text-[10px] font-bold">{isAr ? ci.labelAr : ci.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Start button */}
        <button
          onClick={startGame}
          className="flex items-center gap-2 px-8 py-3 rounded-2xl bg-gradient-to-r from-pink-400 to-violet-400 text-white font-heading font-bold text-base active:scale-95 transition-transform shadow-lg shadow-violet-500/20"
        >
          <Sword className="w-5 h-5" />
          {isAr ? "ابدأ المعركة!" : "Start Battle!"}
        </button>

        {/* Cat mascot */}
        <div className="text-5xl mt-2">🐱</div>
        {highScore > 0 && <p className="text-xs text-muted-foreground">Best: {highScore}</p>}
      </div>
    );
  }

  // ═══ VICTORY SCREEN ═══
  if (gameState === "victory") {
    return (
      <div className="flex flex-col items-center w-full gap-4 py-8">
        <div className="text-6xl">😻</div>
        <h2 className="font-heading text-3xl font-bold text-gold">
          {isAr ? "نصر!" : "Victory!"}
        </h2>
        <div className="flex gap-1">
          {[1, 2, 3].map((s) => (
            <span key={s} className={`text-2xl ${s <= stars ? "text-gold" : "text-white/20"}`}>★</span>
          ))}
        </div>
        <div className="bg-card rounded-2xl px-6 py-4 flex flex-col gap-2 text-center">
          <p className="text-sm text-muted-foreground">{isAr ? "النتيجة" : "Score"}</p>
          <p className="font-heading text-2xl font-bold text-foreground">{score}</p>
          <p className="text-xs text-muted-foreground">
            {isAr ? `إجابات صحيحة: ${engine?.correctAnswers ?? 0}` : `Correct: ${engine?.correctAnswers ?? 0}`}
          </p>
        </div>
        <div className="flex gap-3 mt-2">
          <button onClick={startGame} className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-heading font-bold text-sm active:scale-95 transition-transform">
            <RotateCcw className="w-4 h-4" /> {isAr ? "العب مجدداً" : "Play Again"}
          </button>
          <button onClick={() => setGameState("menu")} className="px-5 py-2.5 rounded-xl bg-muted text-muted-foreground font-heading font-bold text-sm active:scale-95 transition-transform">
            {isAr ? "تغيير الفئة" : "Change Category"}
          </button>
          <button onClick={() => navigate("/")} className="px-5 py-2.5 rounded-xl bg-white/10 text-white font-heading font-bold text-sm active:scale-95 transition-transform">
            {isAr ? "الرئيسية" : "Hub"}
          </button>
        </div>
      </div>
    );
  }

  // ═══ DEFEAT SCREEN ═══
  if (gameState === "defeat") {
    return (
      <div className="flex flex-col items-center w-full gap-4 py-8">
        <div className="text-6xl">😿</div>
        <h2 className="font-heading text-2xl font-bold text-foreground">
          {isAr ? "حاول مجدداً" : "Try Again"}
        </h2>
        <p className="text-sm text-muted-foreground text-center max-w-[280px]">
          {isAr ? "المعرفة تنمو مع كل معركة!" : "Knowledge grows with every battle!"}
        </p>
        <div className="bg-card rounded-2xl px-6 py-4 text-center">
          <p className="text-sm text-muted-foreground">{isAr ? "النتيجة" : "Score"}</p>
          <p className="font-heading text-xl font-bold text-foreground">{score}</p>
        </div>
        <div className="flex gap-3 mt-2">
          <button onClick={startGame} className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-heading font-bold text-sm active:scale-95 transition-transform">
            <RotateCcw className="w-4 h-4" /> {isAr ? "حاول مجدداً" : "Try Again"}
          </button>
          <button onClick={() => setGameState("menu")} className="px-5 py-2.5 rounded-xl bg-muted text-muted-foreground font-heading font-bold text-sm active:scale-95 transition-transform">
            {isAr ? "تغيير الفئة" : "Change Category"}
          </button>
          <button onClick={() => navigate("/")} className="px-5 py-2.5 rounded-xl bg-white/10 text-white font-heading font-bold text-sm active:scale-95 transition-transform">
            {isAr ? "الرئيسية" : "Hub"}
          </button>
        </div>
      </div>
    );
  }

  // ═══ PLAYING / BOSS SCREEN ═══
  if (!question) return null;
  const options = isAr ? question.optionsAr : question.optionsEn;
  const questionText = isAr ? question.questionAr : question.questionEn;

  return (
    <div className={`flex flex-col w-full gap-3 py-2 ${isBoss ? "bg-gradient-to-b from-red-950/40 to-background rounded-2xl p-3" : ""}`}>
      {/* Boss header */}
      {isBoss && (
        <div className="text-center mb-1">
          <div className="flex items-center justify-center gap-2">
            <span className="text-3xl">{bossMascot ?? "😾"}</span>
            <h3 className="font-heading text-xl font-bold text-red-400">BOSS BATTLE!</h3>
            <span className="text-3xl">{bossMascot ?? "😾"}</span>
          </div>
          <div className="flex items-center justify-center gap-1 mt-1">
            {Array.from({ length: 3 }, (_, i) => (
              <Heart key={i} className={`w-4 h-4 ${i < (bossProgress?.correct ?? 0) ? "fill-red-500 text-red-500" : "text-white/20"}`} />
            ))}
            <span className="text-xs text-muted-foreground ml-1">{bossProgress?.correct ?? 0}/3</span>
          </div>
        </div>
      )}

      {/* Sword charge + timer */}
      <div className="flex items-center gap-2">
        <Sword className={`w-5 h-5 shrink-0 ${swordCharge >= 100 ? "text-gold" : "text-primary"}`} />
        <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
          <div className="h-full rounded-full bg-gradient-to-r from-violet-500 to-pink-400 transition-all duration-300" style={{ width: `${swordCharge}%` }} />
        </div>
        <Clock className={`w-5 h-5 shrink-0 ${timeLeft <= 5 ? "text-red-500" : "text-muted-foreground"}`} />
        <div className="w-16 h-3 bg-muted rounded-full overflow-hidden">
          <div className={`h-full rounded-full transition-all duration-1000 ${timeLeft <= 5 ? "bg-red-500" : "bg-primary"}`} style={{ width: `${(timeLeft / maxTime) * 100}%` }} />
        </div>
      </div>

      {/* Progress + score */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{isAr ? `سؤال ${progress?.current}/${progress?.total}` : `Question ${progress?.current}/${progress?.total}`}</span>
        <span className="font-bold text-foreground">{isAr ? "النتيجة" : "Score"}: {score}</span>
      </div>

      {/* Question */}
      <div className="bg-card rounded-2xl p-4 text-center min-h-[80px] flex items-center justify-center">
        <p className="font-heading text-base font-bold text-foreground leading-snug">{questionText}</p>
      </div>

      {/* Options */}
      <div className="flex flex-col gap-2">
        {options.map((opt, i) => {
          let bgClass = "bg-muted text-foreground";
          if (answered) {
            if (i === question.correctIndex) bgClass = "bg-green-500/80 text-white";
            else if (i === selectedAnswer) bgClass = "bg-red-500/80 text-white";
            else bgClass = "bg-muted/50 text-muted-foreground";
          }
          return (
            <button
              key={i}
              onClick={() => handleAnswer(i)}
              disabled={answered}
              className={`px-4 py-3 rounded-2xl text-sm font-bold text-left transition-all active:scale-[0.98] disabled:active:scale-100 ${bgClass}`}
            >
              {opt}
            </button>
          );
        })}
      </div>

      {/* Explanation + mascot */}
      {answered && answerResult && (
        <div className="flex items-start gap-2 bg-card/50 rounded-xl p-3">
          <span className="text-2xl shrink-0">{mascot}</span>
          <div className="flex-1">
            <p className={`text-xs font-bold ${answerResult.correct ? "text-green-400" : "text-red-400"}`}>
              {answerResult.correct ? (isAr ? "✓ صحيح!" : "✓ Correct!") : (isAr ? "✗ خطأ!" : "✓ Wrong!")}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">{answerResult.explanation}</p>
          </div>
          <button onClick={() => handleNextRef.current()} className="shrink-0 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-bold active:scale-95 transition-transform">
            {isAr ? "التالي" : "Next"} →
          </button>
        </div>
      )}
    </div>
  );
}