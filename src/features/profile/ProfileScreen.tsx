import { Coins, Gem, Star, Gamepad2 } from "lucide-react";
import NyaLayout from "@/components/nya/NyaLayout";
import { usePlayerStore } from "@/store/usePlayerStore";
import { useGameStore } from "@/store/useGameStore";

export default function ProfileScreen() {
  const { name, avatar, level, xp, coins, gems } = usePlayerStore();
  const { gamesPlayed, highScores } = useGameStore();
  const xpPct = Math.min(100, (xp / (level * 100)) * 100);
  const totalHighScore = Object.values(highScores).reduce((a, b) => a + b, 0);

  return (
    <NyaLayout title="Profile" showBack={false}>
      <div className="space-y-5">
        {/* avatar card */}
        <div className="bg-card rounded-3xl p-6 border border-border/50 flex flex-col items-center text-center">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center text-4xl shadow-lg mb-3">
            {avatar}
          </div>
          <h2 className="font-heading font-bold text-xl text-foreground">
            {name}
          </h2>
          <span className="text-xs font-bold bg-primary/15 text-primary px-2.5 py-0.5 rounded-full mt-2">
            Level {level}
          </span>
          {/* xp bar */}
          <div className="w-full h-2 rounded-full bg-muted overflow-hidden mt-4">
            <div
              className="h-full rounded-full bg-gradient-to-r from-violet-500 to-pink-500 transition-all duration-500"
              style={{ width: `${xpPct}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-1.5">
            {xp} / {level * 100} XP
          </p>
        </div>

        {/* currency stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-card rounded-2xl p-4 border border-border/50 text-center">
            <Coins className="w-5 h-5 text-yellow-400 fill-yellow-400 mx-auto mb-1" />
            <p className="text-2xl font-bold text-foreground">{coins}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Paws</p>
          </div>
          <div className="bg-card rounded-2xl p-4 border border-border/50 text-center">
            <Gem className="w-5 h-5 text-cyan-400 fill-cyan-400 mx-auto mb-1" />
            <p className="text-2xl font-bold text-foreground">{gems}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Gems</p>
          </div>
        </div>

        {/* game stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-card rounded-2xl p-4 border border-border/50 text-center">
            <Gamepad2 className="w-5 h-5 text-violet-400 mx-auto mb-1" />
            <p className="text-2xl font-bold text-foreground">{gamesPlayed}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Games Played</p>
          </div>
          <div className="bg-card rounded-2xl p-4 border border-border/50 text-center">
            <Star className="w-5 h-5 text-pink-400 fill-pink-400/30 mx-auto mb-1" />
            <p className="text-2xl font-bold text-foreground">{totalHighScore}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Total Score</p>
          </div>
        </div>
      </div>
    </NyaLayout>
  );
}