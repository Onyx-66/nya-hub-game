// =============================================
// Achievement Catalog — Curated hard achievements
// Removed: trivial "visit page" achievements, duplicate misc section,
// and low-threshold padding. Every achievement now requires real effort.
// =============================================

export type AchievementCategory =
  | "gameplay" | "mastery" | "economy" | "progression"
  | "social" | "collection" | "special";

export interface AchievementDef {
  id: string;
  name: string;
  description: string;
  category: AchievementCategory;
  icon: string;
  color: string;
  metric: string;
  threshold: number;
  xpReward: number;
  pawsReward: number;
  gemsReward?: number;
  isHidden?: boolean;
}

export interface CategoryMeta {
  label: string;
  icon: string;
  color: string;
}

export const CATEGORY_META: Record<AchievementCategory, CategoryMeta> = {
  gameplay: { label: "Gameplay", icon: "Gamepad2", color: "text-violet-400" },
  mastery: { label: "Mastery", icon: "Trophy", color: "text-amber-400" },
  economy: { label: "Economy", icon: "Coins", color: "text-yellow-400" },
  progression: { label: "Progression", icon: "TrendingUp", color: "text-cyan-400" },
  social: { label: "Social", icon: "Users", color: "text-pink-400" },
  collection: { label: "Collection", icon: "Palette", color: "text-emerald-400" },
  special: { label: "Special", icon: "Sparkles", color: "text-fuchsia-400" },
};

export const CATEGORIES = Object.keys(CATEGORY_META) as AchievementCategory[];

const GAMES = [
  { slug: "snake", name: "Nya Snake" },
  { slug: "block-blast", name: "Block Blast" },
  { slug: "water-sort", name: "Water Sort" },
  { slug: "meowdoku", name: "Meowdoku" },
  { slug: "angry-birds", name: "Furious Felines" },
  { slug: "quiz-sword", name: "Sword of Knowledge" },
  { slug: "candy-crush", name: "Nya Crush" },
  { slug: "coloring", name: "Cat Coloring" },
  { slug: "multi-color-fill", name: "Multi-Color Fill" },
  { slug: "paws-merge", name: "Paws Merge" },
];

function a(
  id: string, name: string, description: string,
  category: AchievementCategory, icon: string, color: string,
  metric: string, threshold: number,
  xpReward: number, pawsReward: number, gemsReward?: number,
  isHidden?: boolean,
): AchievementDef {
  return { id, name, description, category, icon, color, metric, threshold, xpReward, pawsReward, gemsReward, isHidden };
}

function tiers(
  category: AchievementCategory, icon: string, color: string, metric: string,
  defs: [number, string, string, number, number][],
): AchievementDef[] {
  return defs.map(([threshold, name, desc, xp, paws]) =>
    a(`${metric}_${threshold}`, name, desc, category, icon, color, metric, threshold, xp, paws)
  );
}

// =============================================
// Gameplay — high-threshold milestones only
// =============================================
function genGameplay(): AchievementDef[] {
  return [
    ...tiers("gameplay", "Gamepad2", "text-violet-400", "gamesPlayed", [
      [25, "Dedicated", "Play 25 games", 50, 40],
      [50, "Committed", "Play 50 games", 75, 80],
      [100, "Centurion", "Play 100 games", 100, 150],
      [250, "Unstoppable", "Play 250 games", 150, 300],
      [500, "Addicted", "Play 500 games", 200, 500],
      [1000, "Legend", "Play 1,000 games", 500, 800],
      [2000, "Double Millennium", "Play 2,000 games", 750, 1500, 20],
    ]),
    ...tiers("gameplay", "TrendingUp", "text-cyan-400", "totalScore", [
      [1000, "Point Hunter", "Earn 1,000 total points", 30, 30],
      [5000, "Score Master", "Earn 5,000 total points", 50, 60],
      [10000, "High Achiever", "Earn 10,000 total points", 75, 100],
      [50000, "Point Legend", "Earn 50,000 total points", 100, 200],
      [100000, "Mythic Scorer", "Earn 100,000 total points", 200, 400],
      [500000, "Untouchable", "Earn 500,000 total points", 500, 800],
      [1000000, "Score God", "Earn 1,000,000 total points", 1000, 2000, 50],
    ]),
    ...tiers("gameplay", "Star", "text-yellow-400", "totalStars", [
      [10, "Starstruck", "Earn 10 stars", 30, 30],
      [25, "Star Power", "Earn 25 stars", 50, 60],
      [50, "Radiant", "Earn 50 stars", 75, 100],
      [100, "Centennial Star", "Earn 100 stars", 100, 200],
      [200, "Galactic Star", "Earn 200 stars", 150, 350],
      [500, "Stellar", "Earn 500 stars", 300, 600],
      [1000, "Astral Being", "Earn 1,000 stars", 500, 1000, 25],
    ]),
    ...tiers("gameplay", "Compass", "text-emerald-400", "uniqueGames", [
      [5, "Trailblazer", "Play 5 different games", 50, 60],
      [8, "Renaissance Gamer", "Play 8 different games", 100, 150, 5],
      [10, "Completionist Explorer", "Play all 10 games", 200, 400, 10],
    ]),
    a("ten_3stars", "Star Veteran", "Get 10 three-star ratings", "gameplay", "Award", "text-fuchsia-400", "count3Star", 10, 75, 100),
    a("fifty_3stars", "Star Legend", "Get 50 three-star ratings", "gameplay", "Trophy", "text-fuchsia-400", "count3Star", 50, 150, 250),
    a("hundred_3stars", "Star God", "Get 100 three-star ratings", "gameplay", "Crown", "text-fuchsia-400", "count3Star", 100, 300, 500),
    a("streak_7", "Week Warrior", "Play 7 days in a row", "gameplay", "Flame", "text-red-400", "streak", 7, 50, 80),
    a("streak_30", "Unbreakable", "Play 30 days in a row", "gameplay", "Flame", "text-rose-400", "streak", 30, 150, 250),
    a("streak_100", "Iron Will", "Play 100 days in a row", "gameplay", "Flame", "text-rose-500", "streak", 100, 500, 1000, 25),
    a("days_30", "Monthly Player", "Play on 30 different days", "gameplay", "Calendar", "text-emerald-400", "daysPlayed", 30, 75, 100),
    a("days_100", "Centennial Player", "Play on 100 different days", "gameplay", "Calendar", "text-emerald-400", "daysPlayed", 100, 200, 300),
    a("days_365", "Year Player", "Play on 365 different days", "gameplay", "Calendar", "text-emerald-400", "daysPlayed", 365, 500, 1000, 25),
  ];
}

// =============================================
// Mastery — per-game achievements (raised thresholds)
// =============================================
function genMastery(): AchievementDef[] {
  const result: AchievementDef[] = [];
  const playTiers: [number, string, number, number][] = [
    [10, "Regular", 30, 30],
    [25, "Enthusiast", 50, 60],
    [50, "Devotee", 75, 100],
    [100, "Addict", 100, 200],
  ];
  const scoreTiers: [number, string, number, number][] = [
    [500, "High Scorer", 50, 60],
    [1000, "Score Master", 100, 150],
    [5000, "Score Legend", 200, 300, 3],
  ];
  const starTiers: [number, string, number, number][] = [
    [3, "Perfect Player", 50, 80],
    [10, "Star Veteran", 75, 150],
  ];

  for (const game of GAMES) {
    for (const [threshold, label, xp, paws] of playTiers) {
      result.push(a(
        `mastery_${game.slug}_plays_${threshold}`,
        `${game.name} ${label}`,
        `Play ${game.name} ${threshold} times`,
        "mastery", "Gamepad2", "text-violet-400",
        `plays:${game.slug}`, threshold, xp, paws,
      ));
    }
    for (const [threshold, label, xp, paws] of scoreTiers) {
      result.push(a(
        `mastery_${game.slug}_score_${threshold}`,
        `${game.name} ${label}`,
        `Score ${threshold}+ in ${game.name}`,
        "mastery", "Target", "text-amber-400",
        `highScore:${game.slug}`, threshold, xp, paws,
      ));
    }
    for (const [threshold, label, xp, paws] of starTiers) {
      result.push(a(
        `mastery_${game.slug}_stars_${threshold}`,
        `${game.name} ${label}`,
        `Earn ${threshold} stars in ${game.name}`,
        "mastery", "Star", "text-yellow-400",
        `stars:${game.slug}`, threshold, xp, paws,
      ));
    }
  }
  return result;
}

// =============================================
// Economy — high-threshold currency milestones
// =============================================
function genEconomy(): AchievementDef[] {
  return [
    ...tiers("economy", "Coins", "text-amber-400", "pawsEarned", [
      [500, "Saver", "Earn 500 paws total", 30, 0],
      [1000, "Paw Thousand", "Earn 1,000 paws total", 50, 0],
      [5000, "Paw Tycoon", "Earn 5,000 paws total", 100, 0],
      [10000, "Paw Magnate", "Earn 10,000 paws total", 150, 0],
      [25000, "Paw Empire", "Earn 25,000 paws total", 200, 0],
      [50000, "Paw Dynasty", "Earn 50,000 paws total", 300, 0],
      [100000, "Paw God", "Earn 100,000 paws total", 500, 0, 10],
    ]),
    ...tiers("economy", "Diamond", "text-cyan-400", "gemsEarned", [
      [5, "Gem Collector", "Earn 5 gems", 20, 0],
      [10, "Gem Hoarder", "Earn 10 gems", 30, 0],
      [25, "Gem Enthusiast", "Earn 25 gems", 50, 0],
      [50, "Gem Master", "Earn 50 gems", 75, 0],
      [100, "Gem Baron", "Earn 100 gems", 100, 0],
      [250, "Gem King", "Earn 250 gems", 200, 0],
      [500, "Gem Emperor", "Earn 500 gems", 500, 0, 10],
    ]),
    ...tiers("economy", "ShoppingBag", "text-pink-400", "totalSpent", [
      [500, "Regular Customer", "Spend 500 paws", 20, 0],
      [1000, "Big Spender", "Spend 1,000 paws", 50, 0],
      [5000, "VIP Shopper", "Spend 5,000 paws", 100, 0],
      [10000, "Whale", "Spend 10,000 paws", 200, 0, 5],
      [50000, "Mega Whale", "Spend 50,000 paws", 500, 0, 10],
    ]),
    ...tiers("economy", "Gift", "text-violet-400", "dailyBonuses", [
      [7, "Week of Bonuses", "Claim 7 daily bonuses", 30, 0],
      [14, "Fortnight Bonuses", "Claim 14 daily bonuses", 50, 0],
      [30, "Monthly Bonus", "Claim 30 daily bonuses", 75, 0],
      [100, "Bonus Centurion", "Claim 100 daily bonuses", 150, 0],
      [365, "Year of Bonuses", "Claim 365 daily bonuses", 500, 0, 10],
    ]),
    ...tiers("economy", "ShoppingBag", "text-violet-400", "purchases", [
      [5, "Frequent Buyer", "Make 5 purchases", 25, 0],
      [10, "Shopaholic", "Make 10 purchases", 50, 0],
      [25, "Collector", "Make 25 purchases", 75, 0],
      [50, "Power Buyer", "Make 50 purchases", 150, 0],
    ]),
    ...tiers("economy", "Coins", "text-yellow-400", "pawsBalance", [
      [1000, "Paw Rich", "Hold 1,000 paws at once", 50, 0],
      [5000, "Paw Wealthy", "Hold 5,000 paws at once", 100, 0, 5],
      [10000, "Paw Millionaire", "Hold 10,000 paws at once", 200, 0, 10],
    ]),
    ...tiers("economy", "Diamond", "text-cyan-400", "gemsBalance", [
      [50, "Gem Rich", "Hold 50 gems at once", 50, 0],
      [100, "Gem Wealthy", "Hold 100 gems at once", 100, 0, 5],
      [500, "Gem Tycoon", "Hold 500 gems at once", 300, 0, 10],
    ]),
  ];
}

// =============================================
// Progression — level, XP, playtime (high tiers only)
// =============================================
function genProgression(): AchievementDef[] {
  return [
    ...tiers("progression", "Crown", "text-purple-400", "level", [
      [5, "Rising Star", "Reach level 5", 30, 40],
      [10, "Veteran", "Reach level 10", 75, 100],
      [15, "Master", "Reach level 15", 150, 200],
      [20, "Grandmaster", "Reach level 20", 200, 350],
      [30, "Hero", "Reach level 30", 400, 600],
      [50, "Mythic", "Reach level 50", 750, 1200, 20],
      [75, "Immortal", "Reach level 75", 1000, 2000, 30],
      [100, "Ascended", "Reach level 100", 2000, 5000, 50],
    ]),
    ...tiers("progression", "Zap", "text-yellow-400", "xp", [
      [1000, "XP Adept", "Earn 1,000 XP", 30, 0],
      [5000, "XP Expert", "Earn 5,000 XP", 50, 0],
      [10000, "XP Master", "Earn 10,000 XP", 75, 0],
      [25000, "XP Grandmaster", "Earn 25,000 XP", 100, 0],
      [50000, "XP Legend", "Earn 50,000 XP", 200, 0],
      [100000, "XP Mythic", "Earn 100,000 XP", 500, 0, 10],
      [250000, "XP God", "Earn 250,000 XP", 1000, 0, 25],
      [500000, "XP Titan", "Earn 500,000 XP", 2000, 0, 50],
    ]),
    ...tiers("progression", "Clock", "text-blue-400", "playTime", [
      [18000, "Five Hours", "Play for 5 hours total", 25, 30],
      [36000, "Ten Hours", "Play for 10 hours total", 50, 60],
      [90000, "Day Player", "Play for 25 hours total", 75, 100],
      [180000, "Time Invested", "Play for 50 hours total", 100, 200],
      [360000, "Centurion", "Play for 100 hours total", 200, 400],
      [720000, "Double Centurion", "Play for 200 hours total", 400, 600],
      [1800000, "Time Lord", "Play for 500 hours total", 1000, 2000, 25],
    ]),
    ...tiers("progression", "Flame", "text-orange-400", "longestStreak", [
      [7, "Week Streak", "Maintain a 7-day streak", 50, 60],
      [14, "Fortnight Streak", "Maintain a 14-day streak", 75, 100],
      [30, "Monthly Streak", "Maintain a 30-day streak", 150, 200],
      [60, "Bi-Monthly Streak", "Maintain a 60-day streak", 250, 400],
      [100, "Centennial Streak", "Maintain a 100-day streak", 500, 1000, 15],
      [365, "Year Streak", "Maintain a 365-day streak", 2000, 5000, 50],
    ]),
    a("fast_learner", "Fast Learner", "Reach level 5 in one day", "progression", "Rocket", "text-orange-400", "fastLearner", 1, 50, 80),
    a("playtime_1h", "One Hour Session", "Play for 1 hour in one session", "progression", "Clock", "text-blue-400", "maxSessionTime", 3600, 30, 40),
  ];
}

// =============================================
// Social — meaningful friend/gift milestones
// =============================================
function genSocial(): AchievementDef[] {
  return [
    ...tiers("social", "Users", "text-pink-400", "friendsCount", [
      [5, "Social Butterfly", "Add 5 friends", 30, 30],
      [10, "Popular", "Add 10 friends", 50, 60],
      [25, "Well-Connected", "Add 25 friends", 75, 100],
      [50, "Celebrity", "Add 50 friends", 100, 200],
      [100, "Influencer", "Add 100 friends", 200, 400],
      [250, "Social Legend", "Add 250 friends", 500, 800, 15],
    ]),
    ...tiers("social", "Gift", "text-violet-400", "giftsSent", [
      [5, "Gift Giver", "Send 5 gifts", 20, 0],
      [10, "Philanthropist", "Send 10 gifts", 30, 0],
      [25, "Benefactor", "Send 25 gifts", 50, 0],
      [50, "Secret Santa", "Send 50 gifts", 75, 0],
      [100, "Patron", "Send 100 gifts", 150, 0, 5],
    ]),
    ...tiers("social", "Heart", "text-red-400", "giftsReceived", [
      [5, "Loved", "Receive 5 gifts", 20, 0],
      [10, "Adored", "Receive 10 gifts", 30, 0],
      [25, "Cherished", "Receive 25 gifts", 50, 0],
      [50, "Beloved", "Receive 50 gifts", 75, 0],
      [100, "Worshipped", "Receive 100 gifts", 150, 0, 5],
    ]),
    a("gift_5_friends", "Generous Soul", "Gift 5 different friends", "social", "Users", "text-pink-400", "uniqueGiftRecipients", 5, 50, 60),
    a("gift_all_friends", "Everyone Gets a Gift", "Gift all your friends", "social", "PartyPopper", "text-fuchsia-400", "giftedAllFriends", 1, 100, 150),
    a("3_gifts_one_day", "Gift Spree", "Send 3 gifts in one day", "social", "Gift", "text-violet-400", "giftsOneDay", 3, 30, 40),
  ];
}

// =============================================
// Collection — profile customization milestones
// =============================================
function genCollection(): AchievementDef[] {
  return [
    ...tiers("collection", "Palette", "text-emerald-400", "bannersOwned", [
      [3, "Banner Collector", "Own 3 banners", 20, 20],
      [5, "Banner Enthusiast", "Own 5 banners", 30, 40],
      [8, "Banner Master", "Own all 8 banners", 100, 200, 5],
    ]),
    ...tiers("collection", "Smile", "text-cyan-400", "avatarsUsed", [
      [5, "Avatar Collector", "Use 5 different avatars", 15, 20],
      [10, "Avatar Enthusiast", "Use 10 different avatars", 25, 30],
      [20, "Avatar Legend", "Use all 20 avatars", 75, 100, 5],
    ]),
    ...tiers("collection", "Award", "text-amber-400", "titlesEarned", [
      [3, "Title Holder", "Earn 3 titles", 20, 20],
      [5, "Titled", "Earn 5 titles", 30, 40],
      [8, "Renowned", "Earn all 8 titles", 75, 100, 5],
    ]),
    a("first_bio", "Wordsmith", "Write your first bio", "collection", "Pencil", "text-blue-400", "bioWritten", 1, 10, 10),
    a("max_bio", "Storyteller", "Write a max-length bio", "collection", "BookOpen", "text-blue-400", "bioMaxLength", 1, 20, 20),
    a("custom_avatar", "Unique", "Set a custom avatar", "collection", "Camera", "text-purple-400", "customAvatar", 1, 30, 40),
    a("rainbow_banner", "Colorful", "Equip the Rainbow banner", "collection", "Palette", "text-rainbow", "rainbowBanner", 1, 50, 60),
    a("golden_banner", "Premium", "Equip the Golden banner", "collection", "Crown", "text-amber-400", "goldenBanner", 1, 50, 60),
    a("profile_complete", "Complete Profile", "Set bio, banner, and title", "collection", "CheckCircle2", "text-emerald-400", "profileComplete", 1, 50, 80),
    a("country_set", "Global Citizen", "Set your country", "collection", "Globe", "text-blue-400", "countrySet", 1, 10, 10),
    a("dark_mode_user", "Night Mode", "Use dark mode", "collection", "Moon", "text-slate-400", "darkMode", 1, 10, 10),
  ];
}

// =============================================
// Special — hidden achievements (genuinely hard to unlock)
// =============================================
function genSpecial(): AchievementDef[] {
  const hidden: [string, string, string, number, number][] = [
    ["secret_midnight", "Midnight Gamer", "Play a game at midnight", 50, 80],
    ["secret_early_bird", "Early Bird", "Play a game before 7 AM", 50, 80],
    ["secret_night_owl", "Night Owl", "Play a game after 10 PM", 50, 80],
    ["secret_777", "Lucky Sevens", "Score exactly 777 in any game", 100, 150],
    ["secret_1337", "Elite", "Score exactly 1337 in any game", 100, 150, 10],
    ["secret_comeback_30", "Phoenix", "Return after 30 days away", 100, 150],
    ["secret_25_session", "Iron Session", "Play 25 games in one session", 100, 200],
    ["secret_50_day", "Dedicated Day", "Play 50 games in one day", 100, 200],
    ["secret_all_games_day", "Variety Pack", "Play all 10 games in one day", 200, 300, 10],
    ["secret_all_purchases", "Shopaholic", "Buy every store item", 200, 400, 10],
    ["secret_no_spend_100", "Frugal", "Play 100 games without spending", 100, 150],
    ["secret_perfect_week", "Perfect Week", "Get 3 stars 7 days in a row", 200, 300, 10],
    ["secret_cat_lover", "Cat Lover", "Play 50 cat-themed games", 100, 150],
    ["secret_100_achievements", "Achievement Hunter", "Unlock 100 achievements", 200, 400, 10],
    ["secret_half_achievements", "Dedicated Hunter", "Unlock 200 achievements", 500, 1000, 25],
  ];
  return hidden.map(([id, name, desc, xp, paws], i) =>
    a(id, name, desc, "special", "Sparkles", "text-fuchsia-400", `secret_${i}`, 1, xp, paws, undefined, true)
  );
}

// =============================================
// Meta — achievement unlock milestones + cross-game challenges
// =============================================
function genMeta(): AchievementDef[] {
  return [
    ...tiers("special", "Award", "text-amber-400", "achievementsUnlocked", [
      [10, "Achievement Hunter", "Unlock 10 achievements", 30, 30],
      [25, "Achievement Seeker", "Unlock 25 achievements", 50, 60],
      [50, "Achievement Collector", "Unlock 50 achievements", 75, 100],
      [100, "Centennial Achiever", "Unlock 100 achievements", 150, 250],
      [150, "Achievement Legend", "Unlock 150 achievements", 200, 400],
      [200, "Achievement Hero", "Unlock 200 achievements", 300, 600],
      [300, "Achievement Mythic", "Unlock 300 achievements", 500, 1000, 10],
    ]),
    a("misc_all_games_played", "Jack of All Trades", "Play every game at least once", "special", "Compass", "text-emerald-400", "uniqueGames", 10, 100, 200, 5),
    a("misc_score_1000_any", "Score King", "Score 1,000+ in any game", "special", "Trophy", "text-amber-400", "anyHighScore", 1000, 100, 150),
    a("misc_score_5000_any", "Mythic Score", "Score 5,000+ in any game", "special", "Crown", "text-amber-400", "anyHighScore", 5000, 200, 300, 10),
    a("misc_daily_chal_10", "Challenger", "Complete 10 daily challenges", "special", "Target", "text-violet-400", "dailyChallengesClaimed", 10, 30, 40),
    a("misc_daily_chal_50", "Challenge Master", "Complete 50 daily challenges", "special", "Award", "text-purple-400", "dailyChallengesClaimed", 50, 75, 100),
    a("misc_daily_chal_100", "Challenge Legend", "Complete 100 daily challenges", "special", "Crown", "text-amber-400", "dailyChallengesClaimed", 100, 150, 200, 5),
    a("misc_daily_streak_7", "Week Warrior", "Complete all daily challenges 7 days in a row", "special", "Flame", "text-red-400", "dailyStreak", 7, 100, 150, 3),
    a("misc_daily_streak_30", "Unstoppable", "Complete all daily challenges 30 days in a row", "special", "Flame", "text-red-500", "dailyStreak", 30, 300, 400, 10),
    a("misc_first_powerup", "Powered Up", "Use your first powerup", "special", "Zap", "text-violet-400", "powerupsUsed", 1, 20, 20),
    a("misc_powerup_50", "Power Master", "Use 50 powerups", "special", "Zap", "text-violet-400", "powerupsUsed", 50, 75, 100),
    a("misc_all_categories", "All-Rounder", "Play all game categories", "special", "Compass", "text-emerald-400", "categoriesPlayed", 4, 75, 100),
  ];
}

// =============================================
// Multi-Color Fill
// =============================================
function genMultiColorFill(): AchievementDef[] {
  return [
    ...tiers("gameplay", "Palette", "text-violet-400", "mcf-level", [
      [5, "Color Apprentice", "Reach level 5", 50, 30],
      [10, "Color Enthusiast", "Reach level 10", 100, 60],
      [15, "Color Master", "Reach level 15", 200, 100],
      [30, "Color Grandmaster", "Reach level 30", 500, 300, 3],
    ]),
    a("mcf-three-star-10", "Perfect Artist", "3-star 10 levels", "mastery", "Star", "text-fuchsia-400", "mcf-three-star", 10, 400, 0),
    a("mcf-three-star-20", "Perfect Artist+", "3-star 20 levels", "mastery", "Trophy", "text-fuchsia-400", "mcf-three-star", 20, 1000, 5),
    a("mcf-no-hints-10", "No Help Needed", "Complete 10 levels without hints", "mastery", "Lightbulb", "text-cyan-400", "mcf-no-hints", 10, 200, 0),
    a("mcf-no-hints-20", "Path Master", "Complete 20 levels without hints", "mastery", "Lightbulb", "text-blue-400", "mcf-no-hints", 20, 500, 3),
    a("mcf-speed-15", "Lightning Artist", "Complete a level in under 15 seconds", "mastery", "Zap", "text-amber-400", "mcf-speed-15", 1, 500, 3),
    a("mcf-rainbow", "Rainbow", "Complete a level with 5+ colors", "mastery", "Palette", "text-fuchsia-400", "mcf-rainbow", 1, 300, 0),
    ...tiers("gameplay", "Gamepad2", "text-violet-400", "plays:multi-color-fill", [
      [10, "Regular", "Play 10 times", 30, 30],
      [25, "Enthusiast", "Play 25 times", 50, 60],
      [50, "Devotee", "Play 50 times", 75, 100],
      [100, "Addicted", "Play 100 times", 100, 150],
    ]),
    ...tiers("mastery", "Target", "text-amber-400", "highScore:multi-color-fill", [
      [2000, "High Scorer", "Score 2,000+", 50, 60],
      [5000, "Score Master", "Score 5,000+", 75, 100],
      [10000, "Score Legend", "Score 10,000+", 100, 150, 3],
    ]),
  ];
}

// =============================================
// Paws Merge
// =============================================
function genPawsMerge(): AchievementDef[] {
  return [
    ...tiers("gameplay", "PawPrint", "text-orange-400", "pm-score", [
      [500, "Paw Collector", "Score 500", 50, 30],
      [1000, "Paw Fan", "Score 1,000", 75, 50],
      [2000, "Paw Enthusiast", "Score 2,000", 200, 100],
      [5000, "Paw Pro", "Score 5,000", 300, 200],
      [10000, "Paw Master", "Score 10,000", 1000, 400, 5],
      [20000, "Paw Legend", "Score 20,000", 2000, 800, 10],
    ]),
    a("pm-tier-7", "Cheetah Spot", "Reach tier 7", "mastery", "PawPrint", "text-amber-500", "pm-max-tier", 7, 200, 0),
    a("pm-tier-9", "Panther Paw", "Reach tier 9", "mastery", "PawPrint", "text-slate-400", "pm-max-tier", 9, 500, 0),
    a("pm-tier-10", "Lion Paw", "Reach tier 10", "mastery", "PawPrint", "text-amber-600", "pm-max-tier", 10, 1000, 5),
    a("pm-tier-11", "Mega Tiger Paw", "Reach tier 11 (max!)", "mastery", "Crown", "text-orange-500", "pm-max-tier", 11, 2000, 10),
    ...tiers("gameplay", "Gamepad2", "text-violet-400", "plays:paws-merge", [
      [10, "Regular", "Play 10 times", 30, 30],
      [25, "Enthusiast", "Play 25 times", 50, 60],
      [50, "Devotee", "Play 50 times", 75, 100],
      [100, "Addicted", "Play 100 times", 100, 150],
    ]),
    ...tiers("mastery", "Target", "text-amber-400", "highScore:paws-merge", [
      [1000, "High Scorer", "Score 1,000+", 50, 60],
      [5000, "Score Master", "Score 5,000+", 100, 150],
      [15000, "Score Legend", "Score 15,000+", 200, 300, 5],
    ]),
    ...tiers("mastery", "Star", "text-yellow-400", "stars:paws-merge", [
      [3, "Perfect Player", "Earn 3 stars", 50, 60],
      [10, "Star Veteran", "Earn 10 stars", 75, 100],
    ]),
    a("pm-chain-5", "Chain Reaction", "Get a 5+ merge chain", "mastery", "Flame", "text-red-400", "pm-chain-merge", 5, 1000, 5),
    a("pm-chain-10", "Chain Master", "Get a 10+ merge chain", "mastery", "Flame", "text-rose-500", "pm-chain-merge", 10, 2000, 10),
  ];
}

// =============================================
// Export
// =============================================
export const ACHIEVEMENTS: AchievementDef[] = [
  ...genGameplay(),
  ...genMastery(),
  ...genEconomy(),
  ...genProgression(),
  ...genSocial(),
  ...genCollection(),
  ...genSpecial(),
  ...genMeta(),
  ...genMultiColorFill(),
  ...genPawsMerge(),
];

export const ACHIEVEMENT_MAP: Record<string, AchievementDef> = Object.fromEntries(
  ACHIEVEMENTS.map((a) => [a.id, a])
);

export const TOTAL_ACHIEVEMENTS = ACHIEVEMENTS.length;