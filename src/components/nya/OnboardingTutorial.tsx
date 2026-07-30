import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, X, Check } from "lucide-react";
import { useOnboardingStore } from "@/store/onboardingStore";
import { audioService } from "@/services/audioService";

interface TutorialStep {
  icon: string;
  title: string;
  description: string;
  gradient: string;
  emoji: string;
}

const STEPS: TutorialStep[] = [
  {
    icon: "PawPrint",
    title: "Welcome to Nya Hub!",
    description: "Your premium cat-themed gaming destination. 8 amazing games, daily rewards, and a whole cat community — all in one place!",
    gradient: "from-violet-500 to-purple-600",
    emoji: "🐱",
  },
  {
    icon: "Gamepad2",
    title: "Play 8 Awesome Games",
    description: "From Nya Snake to Cat Coloring, Block Blast to Meowdoku — there's a game for every cat lover. New games added regularly!",
    gradient: "from-pink-500 to-rose-500",
    emoji: "🎮",
  },
  {
    icon: "Coins",
    title: "Earn Paws & Gems",
    description: "Play games and earn Paws (free currency) and Gems (premium). Spend them in the store on powerups, cosmetics, and more!",
    gradient: "from-amber-400 to-orange-500",
    emoji: "💰",
  },
  {
    icon: "Target",
    title: "Daily Challenges",
    description: "Complete 5 challenges every day for bonus rewards. Keep your streak going for even bigger prizes!",
    gradient: "from-cyan-400 to-blue-500",
    emoji: "🎯",
  },
  {
    icon: "Trophy",
    title: "400+ Achievements",
    description: "Unlock achievements as you play. Earn XP, Paws, and Gems for every milestone you reach!",
    gradient: "from-emerald-400 to-teal-500",
    emoji: "🏆",
  },
  {
    icon: "PartyPopper",
    title: "You're All Set!",
    description: "Start playing, make friends, climb the rankings, and most importantly — have fun! Welcome to the Nya Hub family!",
    gradient: "from-pink-400 to-violet-500",
    emoji: "🎉",
  },
];

export default function OnboardingTutorial() {
  const { completed, complete } = useOnboardingStore();
  const [step, setStep] = useState(0);
  const [visible, setVisible] = useState(false);

  // Show if not completed
  useEffect(() => {
    if (!completed) {
      const timer = setTimeout(() => setVisible(true), 800);
      return () => clearTimeout(timer);
    }
  }, [completed]);

  const isLast = step === STEPS.length - 1;
  const current = STEPS[step];

  const handleNext = () => {
    audioService.playSFX("button-click");
    if (isLast) {
      complete();
      setVisible(false);
    } else {
      setStep((s) => s + 1);
    }
  };

  const handleSkip = () => {
    audioService.playSFX("button-click");
    complete();
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-md p-6"
        >
          <motion.div
            key={step}
            initial={{ scale: 0.85, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.85, opacity: 0, y: -20 }}
            transition={{ type: "spring", stiffness: 300, damping: 24 }}
            className="relative w-full max-w-sm bg-card rounded-3xl overflow-hidden shadow-2xl border border-border/50"
          >
            {/* Skip button */}
            {!isLast && (
              <button
                onClick={handleSkip}
                className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-muted/60 flex items-center justify-center hover:bg-muted transition-colors"
                aria-label="Skip tutorial"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            )}

            {/* Gradient header with emoji */}
            <div className={`relative h-44 bg-gradient-to-br ${current.gradient} flex items-center justify-center`}>
              <motion.div
                key={`emoji-${step}`}
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
                className="text-7xl"
              >
                {current.emoji}
              </motion.div>
              {/* Decorative paws */}
              <div className="absolute top-4 left-4 text-white/10 text-2xl">🐾</div>
              <div className="absolute bottom-4 right-4 text-white/10 text-2xl">🐾</div>
            </div>

            {/* Content */}
            <div className="p-6">
              <h2 className="font-heading font-bold text-xl text-center text-foreground mb-2">
                {current.title}
              </h2>
              <p className="text-sm text-muted-foreground text-center leading-relaxed">
                {current.description}
              </p>

              {/* Progress dots */}
              <div className="flex items-center justify-center gap-2 mt-5 mb-5">
                {STEPS.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      audioService.playSFX("tab-switch");
                      setStep(i);
                    }}
                    className={`h-2 rounded-full transition-all ${
                      i === step
                        ? "w-6 bg-primary"
                        : i < step
                          ? "w-2 bg-primary/50"
                          : "w-2 bg-muted"
                    }`}
                    aria-label={`Step ${i + 1}`}
                  />
                ))}
              </div>

              {/* Action button */}
              <button
                onClick={handleNext}
                className={`w-full py-3.5 rounded-2xl font-heading font-bold text-sm flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-transform min-h-[48px] ${
                  isLast
                    ? "bg-gradient-to-r from-emerald-400 to-teal-500 text-white"
                    : "bg-gradient-to-r from-pink-400 to-violet-400 text-white"
                }`}
              >
                {isLast ? (
                  <>
                    <Check className="w-4 h-4" /> Let's Play!
                  </>
                ) : (
                  <>
                    Next <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}