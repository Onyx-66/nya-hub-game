import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Globe, Flag, Users, Check, Sparkles } from "lucide-react";
import NyaLayout from "@/components/nya/NyaLayout";
import { useAuthStore } from "@/store/authStore";
import { games as registryGames } from "@/games/registry";
import { useLeaderboard, type LeaderboardScope } from "../hooks/useLeaderboard";
import PodiumDisplay from "./PodiumDisplay";
import LeaderboardTable from "./LeaderboardTable";

interface RankingGame {
  slug: string;
  title: string;
  icon: string;
}

const RANKING_GAMES: RankingGame[] = [
  { slug: "snake", title: "Nya Snake", icon: "🐍" },
  ...registryGames.map((g) => ({ slug: g.id, title: g.title, icon: g.icon })),
];

const SCOPES: {
  id: LeaderboardScope;
  label: string;
  icon: typeof Globe;
  comingSoon?: boolean;
}[] = [
  { id: "global", label: "Global", icon: Globe },
  { id: "national", label: "National", icon: Flag },
  { id: "friends", label: "Friends", icon: Users, comingSoon: true },
];

function GameSelector({
  value,
  onChange,
}: {
  value: RankingGame;
  onChange: (g: RankingGame) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between gap-2 bg-muted/60 px-4 py-3 rounded-2xl text-left transition-colors hover:bg-muted"
      >
        <span className="flex items-center gap-2.5">
          <span className="text-xl">{value.icon}</span>
          <span className="font-heading font-semibold text-sm text-foreground">
            {value.title}
          </span>
        </span>
        <ChevronDown
          className={`w-4 h-4 text-muted-foreground transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div
              className="fixed inset-0 z-30"
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
              className="absolute z-40 mt-1 w-full bg-popover border border-border rounded-2xl shadow-xl overflow-hidden max-h-64 overflow-y-auto"
            >
              {RANKING_GAMES.map((g) => (
                <button
                  key={g.slug}
                  onClick={() => {
                    onChange(g);
                    setOpen(false);
                  }}
                  className={`w-full flex items-center justify-between gap-2 px-4 py-2.5 text-left transition-colors hover:bg-muted/60 ${
                    g.slug === value.slug ? "bg-muted/40" : ""
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <span className="text-lg">{g.icon}</span>
                    <span className="text-sm font-medium text-foreground">
                      {g.title}
                    </span>
                  </span>
                  {g.slug === value.slug && (
                    <Check className="w-4 h-4 text-primary" />
                  )}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function RankingScreen() {
  const { user, login } = useAuthStore();
  const [selectedGame, setSelectedGame] = useState<RankingGame>(
    RANKING_GAMES[0],
  );
  const [scope, setScope] = useState<LeaderboardScope>("global");

  useEffect(() => {
    if (!user) login();
  }, [user, login]);

  const { entries, currentUserRank, isLoading, isRefreshing, refresh } =
    useLeaderboard(selectedGame.slug, scope);

  const podium = useMemo(
    () => entries.filter((e) => (e.rank ?? 0) <= 3).slice(0, 3),
    [entries],
  );

  return (
    <NyaLayout title="Rankings" showBack={false}>
      <div className="space-y-5">
        {/* ── Game selector ── */}
        <GameSelector value={selectedGame} onChange={setSelectedGame} />

        {/* ── Scope toggle ── */}
        <div className="flex gap-1 bg-muted/40 rounded-2xl p-1">
          {SCOPES.map((s) => {
            const Icon = s.icon;
            const active = scope === s.id;
            return (
              <button
                key={s.id}
                onClick={() => setScope(s.id)}
                className="relative flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-colors"
              >
                <span className={active ? "text-white" : "text-muted-foreground"}>
                  <Icon className="w-3.5 h-3.5" />
                </span>
                <span className={active ? "text-white" : "text-muted-foreground"}>
                  {s.label}
                </span>
                {s.comingSoon && (
                  <span className="bg-accent/20 text-accent text-[8px] font-bold px-1 py-0.5 rounded-full uppercase leading-none">
                    Soon
                  </span>
                )}
                {active && (
                  <motion.span
                    layoutId="ranking-scope"
                    className="absolute inset-0 -z-10 rounded-xl bg-gradient-to-r from-pink-400 to-violet-400"
                    transition={{ type: "spring", stiffness: 350, damping: 26 }}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* ── Friends coming-soon state ── */}
        {scope === "friends" ? (
          <div className="text-center py-16">
            <Users className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <h3 className="font-heading font-bold text-lg text-foreground">
              Friends Leaderboard
            </h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-xs mx-auto">
              Connect with friends to see who's the top cat. Coming soon!
            </p>
          </div>
        ) : (
          <>
            {/* ── Podium ── */}
            {!isLoading && podium.length === 3 && <PodiumDisplay podium={podium} />}

            {/* ── Your rank summary ── */}
            {!isLoading && currentUserRank && (
              <div className="flex items-center justify-center gap-2 bg-primary/10 border border-primary/30 rounded-2xl py-2.5">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold text-foreground">
                  Your rank:{" "}
                  <span className="text-primary">#{currentUserRank}</span>
                </span>
              </div>
            )}

            {/* ── Table ── */}
            <LeaderboardTable
              entries={entries}
              currentUserRank={currentUserRank}
              isLoading={isLoading}
              isRefreshing={isRefreshing}
            />

            {/* ── Refresh ── */}
            {scope !== "friends" && (
              <button
                onClick={refresh}
                disabled={isRefreshing}
                className="w-full text-center text-xs text-muted-foreground hover:text-foreground transition-colors py-2"
              >
                {isRefreshing ? "Refreshing..." : "Tap to refresh"}
              </button>
            )}
          </>
        )}
      </div>
    </NyaLayout>
  );
}