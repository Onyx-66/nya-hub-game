// =============================================
// Profile cosmetics catalog — banners, titles, achievements
// Shared between ProfileScreen and FriendsScreen.
// =============================================

export interface BannerDef {
  id: string;
  name: string;
  gradient: string;
  /** Unlock level — 0 means available from start. */
  unlockLevel: number;
}

export const BANNERS: BannerDef[] = [
  { id: "aurora", name: "Aurora", gradient: "from-violet-500 via-purple-500 to-fuchsia-500", unlockLevel: 0 },
  { id: "sunset", name: "Sunset", gradient: "from-orange-400 via-pink-500 to-rose-500", unlockLevel: 0 },
  { id: "ocean", name: "Ocean", gradient: "from-cyan-400 via-blue-500 to-indigo-500", unlockLevel: 3 },
  { id: "forest", name: "Forest", gradient: "from-emerald-400 via-teal-500 to-cyan-600", unlockLevel: 5 },
  { id: "galaxy", name: "Galaxy", gradient: "from-indigo-600 via-purple-600 to-pink-600", unlockLevel: 8 },
  { id: "gold", name: "Golden", gradient: "from-amber-300 via-yellow-400 to-orange-500", unlockLevel: 12 },
  { id: "midnight", name: "Midnight", gradient: "from-slate-700 via-purple-800 to-slate-900", unlockLevel: 15 },
  { id: "rainbow", name: "Rainbow", gradient: "from-pink-400 via-yellow-400 via-green-400 to-blue-500", unlockLevel: 20 },
];

export function getBanner(bannerId: string | null): BannerDef {
  return BANNERS.find((b) => b.id === bannerId) ?? BANNERS[0];
}

export interface TitleDef {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export const TITLES: TitleDef[] = [
  { id: "newcomer", name: "Newcomer", description: "Welcome to Nya Hub!", icon: "Sparkles" },
  { id: "gamer", name: "Gamer", description: "Play 10 games", icon: "Gamepad2" },
  { id: "pro", name: "Pro", description: "Reach level 5", icon: "Star" },
  { id: "master", name: "Master", description: "Reach level 10", icon: "Crown" },
  { id: "legend", name: "Legend", description: "Reach level 20", icon: "Trophy" },
  { id: "snake_charmer", name: "Snake Charmer", description: "Score 100+ in Nya Snake", icon: "Worm" },
  { id: "puzzle_master", name: "Puzzle Master", description: "Win 5 puzzle games", icon: "Puzzle" },
  { id: "social_butterfly", name: "Social Butterfly", description: "Add 5 friends", icon: "Users" },
];

export function getTitle(titleId: string | null): TitleDef | null {
  if (!titleId) return null;
  return TITLES.find((t) => t.id === titleId) ?? null;
}

export interface AchievementDef {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
}

export const ACHIEVEMENTS: AchievementDef[] = [
  { id: "first_game", name: "First Steps", description: "Play your first game", icon: "Gamepad2", color: "text-violet-400" },
  { id: "ten_games", name: "Getting Hooked", description: "Play 10 games", icon: "Flame", color: "text-orange-400" },
  { id: "fifty_games", name: "Dedicated", description: "Play 50 games", icon: "Award", color: "text-yellow-400" },
  { id: "high_scorer", name: "High Scorer", description: "Score 1000+ in any game", icon: "Trophy", color: "text-gold" },
  { id: "level_5", name: "Rising Star", description: "Reach level 5", icon: "Star", color: "text-pink-400" },
  { id: "level_10", name: "Veteran", description: "Reach level 10", icon: "Crown", color: "text-purple-400" },
  { id: "rich", name: "Fat Cat", description: "Collect 1000 paws", icon: "Coins", color: "text-amber-400" },
  { id: "social", name: "Friendly", description: "Add your first friend", icon: "Users", color: "text-cyan-400" },
  { id: "collector", name: "Collector", description: "Own 3 banners", icon: "Palette", color: "text-emerald-400" },
  { id: "perfectionist", name: "Perfectionist", description: "3-star any game", icon: "Sparkles", color: "text-fuchsia-400" },
];

export function getAchievement(id: string): AchievementDef | undefined {
  return ACHIEVEMENTS.find((a) => a.id === id);
}