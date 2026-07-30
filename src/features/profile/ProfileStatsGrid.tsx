import { motion } from "framer-motion";
import { Gamepad2, Trophy, Star, Award } from "lucide-react";
import { useAuthStore } from "@/store/authStore";

interface StatItem {
  icon: typeof Gamepad2;
  label: string;
  value: number;
  color: string;
}

export default function ProfileStatsGrid() {
  const { user } = useAuthStore();
  if (!user) return null;

  const highScore = Object.values(user.gameStats.highScores).reduce(
    (max, s) => Math.max(max, s),
    0
  );

  const stats: StatItem[] = [
    { icon: Gamepad2, label: "Games Played", value: user.gameStats.gamesPlayed, color: "text-violet-400" },
    { icon: Trophy, label: "High Score", value: highScore, color: "text-yellow-400" },
    { icon: Star, label: "Level", value: user.level, color: "text-pink-400" },
    { icon: Award, label: "Achievements", value: user.gameStats.achievements.length, color: "text-emerald-400" },
  ];

  return (
    <div className="grid grid-cols-2 gap-3">
      {stats.map((stat, i) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 + i * 0.05 }}
          className="bg-card rounded-2xl p-4 border border-border/50"
        >
          <stat.icon className={`w-5 h-5 ${stat.color} mb-2`} />
          <p className="text-2xl font-bold text-foreground">{stat.value.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
        </motion.div>
      ))}
    </div>
  );
}