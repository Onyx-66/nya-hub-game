import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, Search } from "lucide-react";
import NyaLayout from "@/components/nya/NyaLayout";
import AchievementCard from "./AchievementCard";
import { ICON_MAP } from "./iconMap";
import { ACHIEVEMENTS, CATEGORIES, CATEGORY_META, type AchievementCategory } from "@/data/achievementCatalog";
import { useAchievementStore } from "@/store/achievementStore";

type FilterCategory = AchievementCategory | "all";

export default function AchievementsScreen() {
  const unlocked = useAchievementStore((s) => s.unlocked);
  const [activeCategory, setActiveCategory] = useState<FilterCategory>("all");
  const [search, setSearch] = useState("");
  const [showUnlockedOnly, setShowUnlockedOnly] = useState(false);

  const unlockedSet = useMemo(() => new Set(unlocked), [unlocked]);

  const filtered = useMemo(() => {
    return ACHIEVEMENTS.filter((ach) => {
      if (activeCategory !== "all" && ach.category !== activeCategory) return false;
      if (showUnlockedOnly && !unlockedSet.has(ach.id)) return false;
      if (search) {
        const q = search.toLowerCase();
        if (!ach.name.toLowerCase().includes(q) && !ach.description.toLowerCase().includes(q))
          return false;
      }
      return true;
    });
  }, [activeCategory, showUnlockedOnly, search, unlockedSet]);

  const totalUnlocked = unlocked.length;
  const totalAchievements = ACHIEVEMENTS.length;
  const overallPct = Math.round((totalUnlocked / totalAchievements) * 100);

  return (
    <NyaLayout title="Achievements">
      <div className="space-y-4">
        {/* Overall progress */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10 border border-primary/20 p-4"
        >
          <div className="flex items-end justify-between mb-2">
            <div>
              <p className="text-xs text-muted-foreground">Total Unlocked</p>
              <p className="font-heading font-bold text-2xl text-foreground">
                {totalUnlocked}
                <span className="text-sm text-muted-foreground"> / {totalAchievements}</span>
              </p>
            </div>
            <span className="font-heading font-bold text-3xl text-primary">{overallPct}%</span>
          </div>
          <div className="h-2.5 rounded-full bg-muted/50 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${overallPct}%` }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="h-full rounded-full bg-gradient-to-r from-violet-400 to-fuchsia-400"
            />
          </div>
        </motion.div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search achievements..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-muted/40 border border-border/50 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 transition-colors"
          />
        </div>

        {/* Category filters */}
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-thin">
          <CatChip
            label="All"
            icon={null}
            active={activeCategory === "all"}
            onClick={() => setActiveCategory("all")}
            count={totalAchievements}
            unlockedCount={totalUnlocked}
          />
          {CATEGORIES.map((cat) => {
            const meta = CATEGORY_META[cat];
            const Icon = ICON_MAP[meta.icon] ?? Trophy;
            const { unlocked: u, total: t } = useAchievementStore.getState().getCountByCategory(cat);
            return (
              <CatChip
                key={cat}
                label={meta.label}
                icon={<Icon className={`w-3.5 h-3.5 ${meta.color}`} />}
                active={activeCategory === cat}
                onClick={() => setActiveCategory(cat)}
                count={t}
                unlockedCount={u}
              />
            );
          })}
        </div>

        {/* Unlocked-only toggle */}
        <button
          onClick={() => setShowUnlockedOnly(!showUnlockedOnly)}
          className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-colors ${
            showUnlockedOnly
              ? "bg-primary/15 text-primary"
              : "bg-muted/30 text-muted-foreground"
          }`}
        >
          {showUnlockedOnly ? "✓ " : ""}Unlocked only
        </button>

        {/* Achievement grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-sm text-muted-foreground">No achievements found</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2.5">
            {filtered.map((ach, i) => (
              <AchievementCard key={ach.id} achievement={ach} index={i} />
            ))}
          </div>
        )}
      </div>
    </NyaLayout>
  );
}

function CatChip({
  label,
  icon,
  active,
  onClick,
  count,
  unlockedCount,
}: {
  label: string;
  icon: React.ReactNode;
  active: boolean;
  onClick: () => void;
  count: number;
  unlockedCount: number;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
        active
          ? "bg-primary text-primary-foreground"
          : "bg-muted/30 text-muted-foreground hover:bg-muted/50"
      }`}
    >
      {icon}
      {label}
      <span className={`text-[10px] ${active ? "opacity-70" : "opacity-50"}`}>
        {unlockedCount}/{count}
      </span>
    </button>
  );
}