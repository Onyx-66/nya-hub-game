import { motion } from "framer-motion";
import { Lock, Gamepad2, Flame, Award, Trophy, Star, Crown, Coins, Users, Palette, Sparkles } from "lucide-react";
import { ACHIEVEMENTS } from "@/data/profileCatalog";
import { useAuthStore } from "@/store/authStore";

const ICON_MAP: Record<string, typeof Gamepad2> = {
  Gamepad2,
  Flame,
  Award,
  Trophy,
  Star,
  Crown,
  Coins,
  Users,
  Palette,
  Sparkles,
};

export default function ProfileAchievements() {
  const { user } = useAuthStore();
  const unlocked = new Set(user?.gameStats.achievements ?? []);

  return (
    <div className="space-y-3">
      <h3 className="font-heading font-bold text-lg text-foreground">Achievements</h3>
      <div className="grid grid-cols-2 gap-3">
        {ACHIEVEMENTS.map((ach, i) => {
          const isUnlocked = unlocked.has(ach.id);
          const Icon = ICON_MAP[ach.icon] ?? Award;
          return (
            <motion.div
              key={ach.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.04 }}
              className={`rounded-2xl p-3.5 border flex items-center gap-3 ${
                isUnlocked
                  ? "bg-card border-border/50"
                  : "bg-muted/30 border-border/30"
              }`}
            >
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  isUnlocked ? "bg-muted/60" : "bg-muted/30"
                }`}
              >
                {isUnlocked ? (
                  <Icon className={`w-5 h-5 ${ach.color}`} />
                ) : (
                  <Lock className="w-4 h-4 text-muted-foreground/50" />
                )}
              </div>
              <div className="min-w-0">
                <p
                  className={`text-xs font-bold truncate ${
                    isUnlocked ? "text-foreground" : "text-muted-foreground/60"
                  }`}
                >
                  {ach.name}
                </p>
                <p className="text-[10px] text-muted-foreground truncate">
                  {ach.description}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}