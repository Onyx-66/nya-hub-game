// =============================================
// Leaderboard mock data service
// Deterministic generation (seeded PRNG) so ranks stay stable across reloads.
// =============================================

export interface Country {
  code: string;
  flag: string;
  name: string;
}

export interface RankEntry {
  id: string;
  pseudonym: string;
  avatarId: number;
  country: Country;
  score: number;
  rank?: number;
  isYou?: boolean;
}

export interface RankedResult {
  entries: RankEntry[];
  currentUserRank: number | null;
}

// ── Countries with weighted distribution ──
interface WeightedCountry extends Country {
  weight: number;
}

const COUNTRIES: WeightedCountry[] = [
  { code: "US", flag: "🇺🇸", name: "United States", weight: 25 },
  { code: "TN", flag: "🇹🇳", name: "Tunisia", weight: 15 },
  { code: "FR", flag: "🇫🇷", name: "France", weight: 10 },
  { code: "DZ", flag: "🇩🇿", name: "Algeria", weight: 8 },
  { code: "EG", flag: "🇪🇬", name: "Egypt", weight: 8 },
  { code: "SA", flag: "🇸🇦", name: "Saudi Arabia", weight: 7 },
  { code: "GB", flag: "🇬🇧", name: "United Kingdom", weight: 5 },
  { code: "JP", flag: "🇯🇵", name: "Japan", weight: 5 },
  { code: "KR", flag: "🇰🇷", name: "South Korea", weight: 5 },
  { code: "BR", flag: "🇧🇷", name: "Brazil", weight: 5 },
  { code: "MA", flag: "🇲🇦", name: "Morocco", weight: 2 },
  { code: "ES", flag: "🇪🇸", name: "Spain", weight: 2 },
  { code: "IT", flag: "🇮🇹", name: "Italy", weight: 1 },
  { code: "DE", flag: "🇩🇪", name: "Germany", weight: 1 },
  { code: "CA", flag: "🇨🇦", name: "Canada", weight: 1 },
];

const TOTAL_WEIGHT = COUNTRIES.reduce((sum, c) => sum + c.weight, 0);

// ── 100 pseudonyms (45 specified + 30 creative + 15 Arabic + 10 extra) ──
const PSEUDONYMS: string[] = [
  // First 15 (specified set 1)
  "WhiskerMaster", "PurrfectPro", "LunaCat99", "MochiPlayer", "NekoKnight",
  "ShadowPaw", "CrystalKitty", "StormFeline", "GoldenWhisker", "MidnightMeow",
  "SapphireCat", "EmeraldPaw", "RubyTail", "DiamondFang", "PlatinumPurr",
  // 30 more creative cat-themed
  "VelvetPounce", "NebulaCat", "AuroraWhisker", "CosmoKitty", "EmberPaw",
  "FrostbiteFeline", "IvoryClaw", "JadeMeow", "OnyxPurr", "PearlStriker",
  "QuartzCat", "RippleFang", "SilverMew", "TwilightPaw", "WillowFeline",
  "ZenithCat", "AmberLeap", "CinderPaw", "CopperKitty", "DuskFeline",
  "HazelMeow", "IndigoPaw", "JasperCat", "MarigoldMew", "OpalFang",
  "PewterPurr", "VelvetNya", "BlazeWhisker", "CrystalNya", "DewdropCat",
  // 15 Arabic-style names
  "محارب_القطط", "الأميرة_نيا", "الصياد_الذهبي", "نيا_ستار", "قط_الظلام",
  "أمير_الفراء", "شبح_المخالب", "فارس_نيكو", "ليل_القطط", "روح_النيكو",
  "ملاك_الفراء", "بنت_القمري", "صياد_النجوم", "عرين_نيكا", "همسة_القط",
  // 10 extra creative
  "EchoFeline", "GlitchKitty", "HaloMeow", "LotusFeline", "MangoWhisker",
  "OasisCat", "QuillFeline", "RavenMeow", "SaffronPaw", "ZephyrPaw",
];

// ── 20 cat-themed avatar emojis (id 1-20) ──
export const AVATARS: string[] = [
  "🐱", "😺", "😸", "😻", "😼", "🐈‍⬛", "👑", "🚀", "⭐", "🔥",
  "💎", "🌟", "🎯", "🏆", "🎮", "🐾", "🦁", "🐯", "🦊", "⚡",
];

export function getAvatar(avatarId: number): string {
  return AVATARS[(avatarId - 1) % AVATARS.length] ?? "🐱";
}

export function getCountry(code: string): Country | undefined {
  return COUNTRIES.find((c) => c.code === code);
}

// ── Seeded PRNG (mulberry32) for deterministic output ──
function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pickCountry(rand: () => number): Country {
  let r = rand() * TOTAL_WEIGHT;
  for (const c of COUNTRIES) {
    r -= c.weight;
    if (r <= 0) return c;
  }
  return COUNTRIES[0];
}

function generateScoreForIndex(index: number, rand: () => number): number {
  // Intended tier by index — after sorting desc, top 10 are the high scorers.
  if (index < 10) return Math.floor(rand() * 25000) + 25000; // 25,000–50,000
  if (index < 50) return Math.floor(rand() * 20000) + 5000; // 5,000–24,999
  return Math.floor(rand() * 4500) + 500; // 500–4,999
}

function buildLeaderboard(): RankEntry[] {
  const rand = mulberry32(20260729);
  const entries: RankEntry[] = PSEUDONYMS.map((pseudonym, i) => ({
    id: `mock_${i}`,
    pseudonym,
    avatarId: Math.floor(rand() * 20) + 1,
    country: pickCountry(rand),
    score: generateScoreForIndex(i, rand),
    isYou: false,
  }));
  // Sort descending by score so ranks line up with tiers.
  entries.sort((a, b) => b.score - a.score);
  return entries;
}

export const MOCK_LEADERBOARD_DATA: RankEntry[] = buildLeaderboard();

/**
 * Generates a per-game leaderboard (50 entries, scores 100–50000).
 * Uses the gameSlug as a seed so each game has stable but distinct data.
 */
export function generateLeaderboard(
  gameSlug: string,
  minScore = 100,
  maxScore = 50000,
): RankEntry[] {
  const seed = gameSlug.split("").reduce((s, c) => s + c.charCodeAt(0), 0);
  const rand = mulberry32(seed);
  const range = maxScore - minScore;
  const entries: RankEntry[] = PSEUDONYMS.slice(0, 50).map((pseudonym, i) => ({
    id: `mock_${gameSlug}_${i}`,
    pseudonym,
    avatarId: Math.floor(rand() * 20) + 1,
    country: pickCountry(rand),
    score: Math.floor(rand() * range) + minScore,
    isYou: false,
  }));
  entries.sort((a, b) => b.score - a.score);
  return entries;
}

/** Pre-generated leaderboards for games with specific score ranges. */
export const ANGRY_BIRDS_LEADERBOARD: RankEntry[] = generateLeaderboard("angry-birds", 1000, 100000);
export const QUIZ_SWORD_LEADERBOARD: RankEntry[] = generateLeaderboard("quiz-sword", 500, 50000);
export const BLOCK_BLAST_LEADERBOARD: RankEntry[] = generateLeaderboard("block-blast", 500, 30000);
export const NYA_CRUSH_LEADERBOARD: RankEntry[] = generateLeaderboard("candy-crush", 1000, 50000);
export const COLORING_LEADERBOARD: RankEntry[] = generateLeaderboard("coloring", 25, 500);
export const MULTI_COLOR_FILL_LEADERBOARD: RankEntry[] = generateLeaderboard("multi-color-fill", 100, 5000);
export const PAWS_MERGE_LEADERBOARD: RankEntry[] = generateLeaderboard("paws-merge", 200, 20000);