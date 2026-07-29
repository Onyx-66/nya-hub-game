import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { Trophy, Globe, Flag } from "lucide-react";
import NyaLayout from "@/components/nya/NyaLayout";
import { useAuthStore } from "@/store/authStore";
import type { UserProfile } from "@/types";

// =============================================
// Mock Data Generators
// =============================================

const COUNTRIES = [
  { code: "TN", flag: "🇹🇳", name: "Tunisia" },
  { code: "US", flag: "🇺🇸", name: "USA" },
  { code: "FR", flag: "🇫🇷", name: "France" },
  { code: "DE", flag: "🇩🇪", name: "Germany" },
  { code: "GB", flag: "🇬🇧", name: "UK" },
  { code: "JP", flag: "🇯🇵", name: "Japan" },
  { code: "BR", flag: "🇧🇷", name: "Brazil" },
  { code: "IN", flag: "🇮🇳", name: "India" },
  { code: "CA", flag: "🇨🇦", name: "Canada" },
  { code: "AU", flag: "🇦🇺", name: "Australia" },
  { code: "ES", flag: "🇪🇸", name: "Spain" },
  { code: "IT", flag: "🇮🇹", name: "Italy" },
  { code: "EG", flag: "🇪🇬", name: "Egypt" },
  { code: "MA", flag: "🇲🇦", name: "Morocco" },
  { code: "SA", flag: "🇸🇦", name: "Saudi Arabia" },
];

const ADJECTIVES = [
  "Nya", "Fuzzy", "Swift", "Lucky", "Shadow", "Pixel", "Turbo", "Mystic",
  "Cosmo", "Neon", "Wild", "Silent", "Golden", "Crimson", "Frost", "Thunder",
  "Blaze", "Mighty", "Quick", "Epic",
];
const NOUNS = [
  "Cat", "Whiskers", "Paws", "Pounce", "Striker", "Hunter", "Leaper", "Scout",
  "Dash", "Spark", "Claw", "Fang", "Ninja", "Wizard", "Knight", "Rogue",
  "Star", "Storm", "Phoenix", "Legend",
];
const AVATARS = ["🐱", "😺", "😸", "😻", "😼", "🐈‍⬛", "👑", "🚀", "⭐", "🔥", "💎", "🌟", "🎯", "🏆", "🎮"];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generatePseudonym(): string {
  return `${pick(ADJECTIVES)}${pick(NOUNS)}${Math.floor(Math.random() * 1000)}`;
}

function generateScore(): number {
  const tier = Math.random();
  if (tier < 0.05) return Math.floor(Math.random() * 20000) + 30000;
  if (tier < 0.2) return Math.floor(Math.random() * 15000) + 15000;
  if (tier < 0.5) return Math.floor(Math.random() * 10000) + 8000;
  return Math.floor(Math.random() * 7000) + 1000;
}

interface RankEntry {
  id: string;
  pseudonym: string;
  avatar: string;
  country: (typeof COUNTRIES)[0];
  score: number;
  isYou: boolean;
}

function generateLeaderboard(user: UserProfile | null): RankEntry[] {
  const userCountry =
    user?.country
      ? COUNTRIES.find((c) => c.code === user.country) ?? pick(COUNTRIES)
      : pick(COUNTRIES);

  const entries: RankEntry[] = [];

  // 49 mock users
  for (let i = 0; i < 49; i++) {
    entries.push({
      id: `mock_${i}`,
      pseudonym: generatePseudonym(),
      avatar: pick(AVATARS),
      country: pick(COUNTRIES),
      score: generateScore(),
      isYou: false,
    });
  }

  // Current user with a mid-range score
  if (user) {
    entries.push({
      id: user.id,
      pseudonym: user.pseudonym,
      avatar: user.avatar,
      country: userCountry,
      score: Math.floor(Math.random() * 5000) + 5000,
      isYou: true,
    });
  }

  entries.sort((a, b) => b.score - a.score);
  return entries;
}

// =============================================
// Component
// =============================================

type Scope = "global" | "national";

export default function RankingsScreen() {
  const { user, login } = useAuthStore();
  const [scope, setScope] = useState<Scope>("global");

  useEffect(() => {
    if (!user) login();
  }, [user, login]);

  const fullLeaderboard = useMemo(() => generateLeaderboard(user), [user]);

  const userCountry = fullLeaderboard.find((e) => e.isYou)?.country;

  const entries = useMemo(() => {
    if (scope === "national" && userCountry) {
      return fullLeaderboard.filter((e) => e.country.code === userCountry.code);
    }
    return fullLeaderboard;
  }, [scope, fullLeaderboard, userCountry]);

  const showPodium = entries.length >= 3;
  const podium = showPodium ? entries.slice(0, 3) : [];
  const list = showPodium ? entries.slice(3) : entries;

  // Podium visual order: 2nd, 1st, 3rd
  const podiumOrder = [1, 0, 2];
  const podiumHeights = ["h-20", "h-28", "h-16"];

  return (
    <NyaLayout title="Rankings" showBack={false}>
      <div className="space-y-5">
        {/* ── Toggle ── */}
        <div className="flex gap-1 bg-muted/40 rounded-2xl p-1">
          {(["global", "national"] as Scope[]).map((s) => (
            <button
              key={s}
              onClick={() => setScope(s)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold capitalize transition-all ${
                scope === s
                  ? "bg-primary text-primary-foreground shadow-lg"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {s === "global" ? (
                <Globe className="w-3.5 h-3.5" />
              ) : (
                <Flag className="w-3.5 h-3.5" />
              )}
              {s}
            </button>
          ))}
        </div>

        {/* ── Empty state ── */}
        {entries.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground text-sm">
            No players from your country yet. Be the first!
          </div>
        ) : (
          <>
            {/* ── Podium ── */}
            {showPodium && (
              <div className="flex items-end justify-center gap-2 pt-2">
                {podiumOrder.map((idx, i) => {
                  const entry = podium[idx];
                  if (!entry) return null;
                  return (
                    <motion.div
                      key={entry.id}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="flex-1 flex flex-col items-center"
                    >
                      <span className="text-3xl mb-1">{entry.avatar}</span>
                      <span className="text-xs font-bold text-foreground truncate max-w-full">
                        {entry.pseudonym}
                        {entry.isYou && (
                          <span className="ml-1 text-[10px] text-primary">(You)</span>
                        )}
                      </span>
                      <span className="text-[10px] text-muted-foreground mb-1">
                        {entry.country.flag} {entry.score.toLocaleString()}
                      </span>
                      <div
                        className={`w-full ${podiumHeights[i]} rounded-t-2xl flex items-start justify-center pt-2 ${
                          idx === 0
                            ? "bg-gradient-to-b from-yellow-400 to-amber-600"
                            : idx === 1
                            ? "bg-gradient-to-b from-gray-300 to-gray-500"
                            : "bg-gradient-to-b from-orange-400 to-orange-700"
                        }`}
                      >
                        <span className="font-display font-bold text-white text-lg">
                          {idx + 1}
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}

            {/* ── Scrollable list ── */}
            <div className="space-y-2 max-h-[42vh] overflow-y-auto pr-1 -mr-1">
              {list.map((entry, i) => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: Math.min(i * 0.03, 0.6) }}
                  className={`flex items-center gap-3 p-3 rounded-2xl border ${
                    entry.isYou
                      ? "bg-primary/10 border-primary/50"
                      : "bg-card border-border/50"
                  }`}
                >
                  <span className="w-7 text-center font-bold text-muted-foreground text-sm shrink-0">
                    {showPodium ? i + 4 : i + 1}
                  </span>
                  <span className="text-2xl shrink-0">{entry.avatar}</span>
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-semibold text-foreground block truncate">
                      {entry.pseudonym}
                      {entry.isYou && (
                        <span className="ml-1 text-xs text-primary">(You)</span>
                      )}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {entry.country.flag} {entry.country.name}
                    </span>
                  </div>
                  <span className="flex items-center gap-1 text-sm font-bold text-foreground shrink-0">
                    <Trophy className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                    {entry.score.toLocaleString()}
                  </span>
                </motion.div>
              ))}
            </div>
          </>
        )}
      </div>
    </NyaLayout>
  );
}