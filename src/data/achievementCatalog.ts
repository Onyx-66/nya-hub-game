// =============================================
// Achievement Catalog — 400+ achievements across 7 categories
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

// Compact creator
function a(
  id: string, name: string, description: string,
  category: AchievementCategory, icon: string, color: string,
  metric: string, threshold: number,
  xpReward: number, pawsReward: number, gemsReward?: number,
  isHidden?: boolean,
): AchievementDef {
  return { id, name, description, category, icon, color, metric, threshold, xpReward, pawsReward, gemsReward, isHidden };
}

// Tier generator — creates multiple achievements from a metric + array of [threshold, name, desc, xp, paws]
function tiers(
  category: AchievementCategory, icon: string, color: string, metric: string,
  defs: [number, string, string, number, number][],
): AchievementDef[] {
  return defs.map(([threshold, name, desc, xp, paws]) =>
    a(`${metric}_${threshold}`, name, desc, category, icon, color, metric, threshold, xp, paws)
  );
}

// =============================================
// Gameplay (55)
// =============================================
function genGameplay(): AchievementDef[] {
  return [
    ...tiers("gameplay", "Gamepad2", "text-violet-400", "gamesPlayed", [
      [1, "First Steps", "Play your first game", 10, 20],
      [5, "Getting Hooked", "Play 5 games", 20, 40],
      [10, "Regular", "Play 10 games", 30, 60],
      [25, "Dedicated", "Play 25 games", 50, 100],
      [50, "Committed", "Play 50 games", 75, 150],
      [100, "Centurion", "Play 100 games", 100, 250],
      [250, "Unstoppable", "Play 250 games", 150, 400],
      [500, "Addicted", "Play 500 games", 200, 600],
      [1000, "Legend", "Play 1000 games", 500, 1000],
      [2000, "Double Millenium", "Play 2000 games", 750, 1500, 20],
    ]),
    ...tiers("gameplay", "TrendingUp", "text-cyan-400", "totalScore", [
      [100, "Scorer", "Earn 100 total points", 10, 20],
      [500, "Rising Score", "Earn 500 total points", 20, 40],
      [1000, "Point Hunter", "Earn 1,000 total points", 30, 60],
      [5000, "Score Master", "Earn 5,000 total points", 50, 100],
      [10000, "High Achiever", "Earn 10,000 total points", 75, 150],
      [50000, "Point Legend", "Earn 50,000 total points", 100, 250],
      [100000, "Mythic Scorer", "Earn 100,000 total points", 200, 500],
      [500000, "Untouchable", "Earn 500,000 total points", 500, 1000],
      [1000000, "Score God", "Earn 1,000,000 total points", 1000, 2000, 50],
    ]),
    ...tiers("gameplay", "Star", "text-yellow-400", "totalStars", [
      [1, "Shining Star", "Earn your first star", 10, 20],
      [5, "Star Collector", "Earn 5 stars", 20, 40],
      [10, "Starstruck", "Earn 10 stars", 30, 60],
      [25, "Star Power", "Earn 25 stars", 50, 100],
      [50, "Radiant", "Earn 50 stars", 75, 150],
      [100, "Centennial Star", "Earn 100 stars", 100, 250],
      [200, "Galactic Star", "Earn 200 stars", 150, 400],
      [500, "Stellar", "Earn 500 stars", 300, 800],
      [1000, "Astral Being", "Earn 1000 stars", 500, 1000, 25],
    ]),
    ...tiers("gameplay", "Compass", "text-emerald-400", "uniqueGames", [
      [1, "First Explorer", "Play a game", 10, 20],
      [3, "Adventurer", "Play 3 different games", 25, 50],
      [5, "Trailblazer", "Play 5 different games", 50, 100],
      [8, "Renaissance Gamer", "Play all 8 games", 100, 250, 5],
    ]),
    a("first_3star", "Perfectionist", "Get your first 3-star rating", "gameplay", "Star", "text-fuchsia-400", "first3Star", 1, 50, 100),
    a("ten_3stars", "Star Veteran", "Get 10 three-star ratings", "gameplay", "Award", "text-fuchsia-400", "count3Star", 10, 75, 150),
    a("fifty_3stars", "Star Legend", "Get 50 three-star ratings", "gameplay", "Trophy", "text-fuchsia-400", "count3Star", 50, 150, 300),
    a("hundred_3stars", "Star God", "Get 100 three-star ratings", "gameplay", "Crown", "text-fuchsia-400", "count3Star", 100, 300, 600),
    a("first_2star", "Two Stars", "Get your first 2-star rating", "gameplay", "Star", "text-orange-400", "first2Star", 1, 25, 50),
    a("first_1star", "One Star", "Get your first 1-star rating", "gameplay", "Star", "text-yellow-400", "first1Star", 1, 10, 20),
    a("streak_3", "On Fire", "Play 3 days in a row", "gameplay", "Flame", "text-orange-400", "streak", 3, 30, 60),
    a("streak_7", "Week Warrior", "Play 7 days in a row", "gameplay", "Flame", "text-red-400", "streak", 7, 50, 100),
    a("streak_30", "Unbreakable", "Play 30 days in a row", "gameplay", "Flame", "text-rose-400", "streak", 30, 150, 300),
    a("streak_100", "Iron Will", "Play 100 days in a row", "gameplay", "Flame", "text-rose-500", "streak", 100, 500, 1000, 25),
    a("days_3", "Three Day Streak", "Play on 3 different days", "gameplay", "Calendar", "text-green-400", "daysPlayed", 3, 20, 40),
    a("days_7", "Week Player", "Play on 7 different days", "gameplay", "Calendar", "text-green-400", "daysPlayed", 7, 30, 60),
    a("days_30", "Monthly Player", "Play on 30 different days", "gameplay", "Calendar", "text-emerald-400", "daysPlayed", 30, 75, 150),
    a("days_100", "Centennial Player", "Play on 100 different days", "gameplay", "Calendar", "text-emerald-400", "daysPlayed", 100, 200, 400),
    a("days_365", "Year Player", "Play on 365 different days", "gameplay", "Calendar", "text-emerald-400", "daysPlayed", 365, 500, 1000, 25),
  ];
}

// =============================================
// Mastery (80) — 8 games × 10
// =============================================
function genMastery(): AchievementDef[] {
  const result: AchievementDef[] = [];
  const playTiers: [number, string, number, number][] = [
    [1, "First Try", 10, 20],
    [5, "Casual", 20, 40],
    [10, "Regular", 30, 60],
    [25, "Enthusiast", 50, 100],
    [50, "Devotee", 75, 150],
  ];
  const scoreTiers: [number, string, number, number][] = [
    [100, "Century", 25, 50],
    [500, "High Scorer", 50, 100],
    [1000, "Score Master", 100, 250],
  ];
  const starTiers: [number, string, number, number][] = [
    [1, "Star Player", 20, 40],
    [3, "Perfect Player", 50, 100],
  ];

  for (const game of GAMES) {
    for (const [threshold, label, xp, paws] of playTiers) {
      result.push(a(
        `mastery_${game.slug}_plays_${threshold}`,
        `${game.name} ${label}`,
        `Play ${game.name} ${threshold} time${threshold > 1 ? "s" : ""}`,
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
        `Earn ${threshold} star${threshold > 1 ? "s" : ""} in ${game.name}`,
        "mastery", "Star", "text-yellow-400",
        `stars:${game.slug}`, threshold, xp, paws,
      ));
    }
  }
  return result;
}

// =============================================
// Economy (55)
// =============================================
function genEconomy(): AchievementDef[] {
  return [
    ...tiers("economy", "Coins", "text-amber-400", "pawsEarned", [
      [10, "Pocket Change", "Earn 10 paws", 5, 0],
      [50, "Small Saver", "Earn 50 paws", 10, 0],
      [100, "Centenary", "Earn 100 paws", 15, 0],
      [250, "Quarterback", "Earn 250 paws", 20, 0],
      [500, "Half Grand", "Earn 500 paws", 30, 0],
      [1000, "Paw Thousand", "Earn 1,000 paws", 50, 0],
      [2000, "Paw Fortune", "Earn 2,000 paws", 75, 0],
      [5000, "Paw Tycoon", "Earn 5,000 paws", 100, 0],
      [10000, "Paw Magnate", "Earn 10,000 paws", 150, 0],
      [25000, "Paw Empire", "Earn 25,000 paws", 200, 0],
      [50000, "Paw Dynasty", "Earn 50,000 paws", 300, 0],
      [100000, "Paw God", "Earn 100,000 paws", 500, 0, 10],
    ]),
    ...tiers("economy", "Diamond", "text-cyan-400", "gemsEarned", [
      [1, "First Gem", "Earn your first gem", 10, 0],
      [5, "Gem Collector", "Earn 5 gems", 20, 0],
      [10, "Gem Hoarder", "Earn 10 gems", 30, 0],
      [25, "Gem Enthusiast", "Earn 25 gems", 50, 0],
      [50, "Gem Master", "Earn 50 gems", 75, 0],
      [100, "Gem Baron", "Earn 100 gems", 100, 0],
      [250, "Gem King", "Earn 250 gems", 200, 0],
      [500, "Gem Emperor", "Earn 500 gems", 500, 0, 10],
    ]),
    ...tiers("economy", "ShoppingBag", "text-pink-400", "totalSpent", [
      [100, "First Shopper", "Spend 100 paws", 10, 0],
      [500, "Regular Customer", "Spend 500 paws", 20, 0],
      [1000, "Big Spender", "Spend 1,000 paws", 50, 0],
      [5000, "VIP Shopper", "Spend 5,000 paws", 100, 0],
      [10000, "Whale", "Spend 10,000 paws", 200, 0, 5],
      [50000, "Mega Whale", "Spend 50,000 paws", 500, 0, 10],
    ]),
    ...tiers("economy", "Gift", "text-violet-400", "dailyBonuses", [
      [1, "First Bonus", "Claim your first daily bonus", 10, 0],
      [7, "Week of Bonuses", "Claim 7 daily bonuses", 30, 0],
      [14, "Fortnight Bonuses", "Claim 14 daily bonuses", 50, 0],
      [30, "Monthly Bonus", "Claim 30 daily bonuses", 75, 0],
      [60, "Bi-Monthly Bonus", "Claim 60 daily bonuses", 100, 0],
      [100, "Bonus Centurion", "Claim 100 daily bonuses", 150, 0],
      [365, "Year of Bonuses", "Claim 365 daily bonuses", 500, 0, 10],
    ]),
    ...tiers("economy", "ShoppingBag", "text-violet-400", "purchases", [
      [1, "First Purchase", "Make your first purchase", 10, 0],
      [5, "Frequent Buyer", "Make 5 purchases", 25, 0],
      [10, "Shopaholic", "Make 10 purchases", 50, 0],
      [25, "Collector", "Make 25 purchases", 75, 0],
      [50, "Power Buyer", "Make 50 purchases", 150, 0],
    ]),
    ...tiers("economy", "Coins", "text-yellow-400", "pawsBalance", [
      [100, "Hundred Paws", "Hold 100 paws at once", 10, 0],
      [500, "Five Hundred", "Hold 500 paws at once", 20, 0],
      [1000, "Paw Rich", "Hold 1,000 paws at once", 50, 0],
      [5000, "Paw Wealthy", "Hold 5,000 paws at once", 100, 0, 5],
      [10000, "Paw Millionaire", "Hold 10,000 paws at once", 200, 0, 10],
    ]),
    ...tiers("economy", "Diamond", "text-cyan-400", "gemsBalance", [
      [10, "Gem Saver", "Hold 10 gems at once", 20, 0],
      [50, "Gem Rich", "Hold 50 gems at once", 50, 0],
      [100, "Gem Wealthy", "Hold 100 gems at once", 100, 0, 5],
      [500, "Gem Tycoon", "Hold 500 gems at once", 300, 0, 10],
    ]),
  ];
}

// =============================================
// Progression (55)
// =============================================
function genProgression(): AchievementDef[] {
  return [
    ...tiers("progression", "Crown", "text-purple-400", "level", [
      [2, "First Level Up", "Reach level 2", 10, 20],
      [3, "Climbing", "Reach level 3", 15, 30],
      [5, "Rising Star", "Reach level 5", 30, 60],
      [8, "Skilled", "Reach level 8", 50, 100],
      [10, "Veteran", "Reach level 10", 75, 150],
      [12, "Expert", "Reach level 12", 100, 200],
      [15, "Master", "Reach level 15", 150, 300],
      [20, "Grandmaster", "Reach level 20", 200, 500],
      [25, "Champion", "Reach level 25", 300, 600],
      [30, "Hero", "Reach level 30", 400, 800],
      [50, "Mythic", "Reach level 50", 750, 1500, 20],
      [75, "Immortal", "Reach level 75", 1000, 2000, 30],
      [100, "Ascended", "Reach level 100", 2000, 5000, 50],
    ]),
    ...tiers("progression", "Zap", "text-yellow-400", "xp", [
      [100, "XP Novice", "Earn 100 XP", 10, 0],
      [500, "XP Apprentice", "Earn 500 XP", 20, 0],
      [1000, "XP Adept", "Earn 1,000 XP", 30, 0],
      [5000, "XP Expert", "Earn 5,000 XP", 50, 0],
      [10000, "XP Master", "Earn 10,000 XP", 75, 0],
      [25000, "XP Grandmaster", "Earn 25,000 XP", 100, 0],
      [50000, "XP Legend", "Earn 50,000 XP", 200, 0],
      [100000, "XP Mythic", "Earn 100,000 XP", 500, 0, 10],
      [250000, "XP God", "Earn 250,000 XP", 1000, 0, 25],
      [500000, "XP Titan", "Earn 500,000 XP", 2000, 0, 50],
      [1000000, "XP Eternal", "Earn 1,000,000 XP", 5000, 0, 100],
    ]),
    ...tiers("progression", "Clock", "text-blue-400", "playTime", [
      [3600, "One Hour", "Play for 1 hour total", 10, 20],
      [18000, "Five Hours", "Play for 5 hours total", 25, 50],
      [36000, "Ten Hours", "Play for 10 hours total", 50, 100],
      [90000, "Day Player", "Play for 25 hours total", 75, 150],
      [180000, "Time Invested", "Play for 50 hours total", 100, 250],
      [360000, "Centurion", "Play for 100 hours total", 200, 500],
      [720000, "Double Centurion", "Play for 200 hours total", 400, 800],
      [1800000, "Time Lord", "Play for 500 hours total", 1000, 2000, 25],
    ]),
    ...tiers("progression", "Flame", "text-orange-400", "longestStreak", [
      [3, "Three Day Streak", "Maintain a 3-day streak", 20, 40],
      [7, "Week Streak", "Maintain a 7-day streak", 50, 100],
      [14, "Fortnight Streak", "Maintain a 14-day streak", 75, 150],
      [30, "Monthly Streak", "Maintain a 30-day streak", 150, 300],
      [60, "Bi-Monthly Streak", "Maintain a 60-day streak", 250, 500],
      [100, "Centennial Streak", "Maintain a 100-day streak", 500, 1000, 15],
      [365, "Year Streak", "Maintain a 365-day streak", 2000, 5000, 50],
    ]),
    a("first_levelup", "First Promotion", "Level up for the first time", "progression", "Crown", "text-purple-400", "level", 2, 10, 20),
    a("fast_learner", "Fast Learner", "Reach level 5 in one day", "progression", "Rocket", "text-orange-400", "fastLearner", 1, 50, 100),
    a("devoted", "Devoted", "Play for 7 consecutive days", "progression", "Heart", "text-red-400", "streak", 7, 50, 100),
    a("playtime_1h", "One Hour Session", "Play for 1 hour in one session", "progression", "Clock", "text-blue-400", "maxSessionTime", 3600, 30, 60),
  ];
}

// =============================================
// Social (45)
// =============================================
function genSocial(): AchievementDef[] {
  return [
    ...tiers("social", "Users", "text-pink-400", "friendsCount", [
      [1, "First Friend", "Add your first friend", 10, 20],
      [3, "Social Circle", "Add 3 friends", 20, 40],
      [5, "Social Butterfly", "Add 5 friends", 30, 60],
      [10, "Popular", "Add 10 friends", 50, 100],
      [25, "Well-Connected", "Add 25 friends", 75, 150],
      [50, "Celebrity", "Add 50 friends", 100, 250],
      [100, "Influencer", "Add 100 friends", 200, 500],
      [250, "Social Legend", "Add 250 friends", 500, 1000, 15],
      [500, "Social God", "Add 500 friends", 1000, 2000, 30],
    ]),
    ...tiers("social", "Gift", "text-violet-400", "giftsSent", [
      [1, "Generous", "Send your first gift", 10, 0],
      [5, "Gift Giver", "Send 5 gifts", 20, 0],
      [10, "Philanthropist", "Send 10 gifts", 30, 0],
      [25, "Benefactor", "Send 25 gifts", 50, 0],
      [50, "Secret Santa", "Send 50 gifts", 75, 0],
      [100, "Patron", "Send 100 gifts", 150, 0, 5],
      [200, "Gift Legend", "Send 200 gifts", 300, 0, 10],
    ]),
    ...tiers("social", "Heart", "text-red-400", "giftsReceived", [
      [1, "Lucky", "Receive your first gift", 10, 0],
      [5, "Loved", "Receive 5 gifts", 20, 0],
      [10, "Adored", "Receive 10 gifts", 30, 0],
      [25, "Cherished", "Receive 25 gifts", 50, 0],
      [50, "Beloved", "Receive 50 gifts", 75, 0],
      [100, "Worshipped", "Receive 100 gifts", 150, 0, 5],
    ]),
    a("first_gift_sent", "First Gift", "Send your first gift", "social", "Gift", "text-violet-400", "giftsSent", 1, 10, 0),
    a("first_gift_received", "Surprise!", "Receive your first gift", "social", "Heart", "text-red-400", "giftsReceived", 1, 10, 0),
    a("gift_3_friends", "Spread the Love", "Gift 3 different friends", "social", "Users", "text-pink-400", "uniqueGiftRecipients", 3, 30, 60),
    a("gift_5_friends", "Generous Soul", "Gift 5 different friends", "social", "Users", "text-pink-400", "uniqueGiftRecipients", 5, 50, 100),
    a("gift_all_friends", "Everyone Gets a Gift", "Gift all your friends", "social", "PartyPopper", "text-fuchsia-400", "giftedAllFriends", 1, 100, 200),
    a("receive_10_gifts", "Popular", "Receive 10 gifts total", "social", "Heart", "text-red-400", "giftsReceived", 10, 30, 0),
    a("3_gifts_one_day", "Gift Spree", "Send 3 gifts in one day", "social", "Gift", "text-violet-400", "giftsOneDay", 3, 30, 60),
    a("first_friend_added", "Friendly", "Add your first friend", "social", "Users", "text-pink-400", "friendsCount", 1, 10, 20),
    a("social_25", "Well-Connected", "Have 25 friends", "social", "Users", "text-pink-400", "friendsCount", 25, 75, 150),
    a("social_50", "Popular Figure", "Have 50 friends", "social", "Users", "text-pink-400", "friendsCount", 50, 100, 250),
    a("social_100", "Celebrity", "Have 100 friends", "social", "Users", "text-pink-400", "friendsCount", 100, 200, 500),
  ];
}

// =============================================
// Collection (35)
// =============================================
function genCollection(): AchievementDef[] {
  return [
    ...tiers("collection", "Palette", "text-emerald-400", "bannersOwned", [
      [1, "First Banner", "Own your first banner", 10, 20],
      [3, "Banner Collector", "Own 3 banners", 20, 40],
      [5, "Banner Enthusiast", "Own 5 banners", 30, 60],
      [6, "Banner Aficionado", "Own 6 banners", 40, 80],
      [8, "Banner Master", "Own all 8 banners", 100, 250, 5],
    ]),
    ...tiers("collection", "Smile", "text-cyan-400", "avatarsUsed", [
      [1, "First Avatar", "Use your first avatar", 5, 10],
      [5, "Avatar Collector", "Use 5 different avatars", 15, 30],
      [10, "Avatar Enthusiast", "Use 10 different avatars", 25, 50],
      [15, "Avatar Master", "Use 15 different avatars", 40, 80],
      [20, "Avatar Legend", "Use all 20 avatars", 75, 150, 5],
    ]),
    ...tiers("collection", "Award", "text-amber-400", "titlesEarned", [
      [1, "First Title", "Earn your first title", 10, 20],
      [3, "Title Holder", "Earn 3 titles", 20, 40],
      [5, "Titled", "Earn 5 titles", 30, 60],
      [8, "Renowned", "Earn all 8 titles", 75, 150, 5],
    ]),
    a("first_bio", "Wordsmith", "Write your first bio", "collection", "Pencil", "text-blue-400", "bioWritten", 1, 10, 20),
    a("max_bio", "Storyteller", "Write a max-length bio", "collection", "BookOpen", "text-blue-400", "bioMaxLength", 1, 20, 40),
    a("custom_avatar", "Unique", "Set a custom avatar", "collection", "Camera", "text-purple-400", "customAvatar", 1, 30, 60),
    a("rainbow_banner", "Colorful", "Equip the Rainbow banner", "collection", "Palette", "text-rainbow", "rainbowBanner", 1, 50, 100),
    a("golden_banner", "Premium", "Equip the Golden banner", "collection", "Crown", "text-amber-400", "goldenBanner", 1, 50, 100),
    a("midnight_banner", "Dark Side", "Equip the Midnight banner", "collection", "Moon", "text-slate-400", "midnightBanner", 1, 40, 80),
    a("galaxy_banner", "Cosmic", "Equip the Galaxy banner", "collection", "Sparkles", "text-purple-400", "galaxyBanner", 1, 40, 80),
    a("profile_complete", "Complete Profile", "Set bio, banner, and title", "collection", "CheckCircle2", "text-emerald-400", "profileComplete", 1, 50, 100),
    a("country_set", "Global Citizen", "Set your country", "collection", "Globe", "text-blue-400", "countrySet", 1, 10, 20),
    a("avatar_changed", "New Look", "Change your avatar", "collection", "Smile", "text-cyan-400", "avatarChanged", 1, 10, 20),
    a("banner_changed", "New Background", "Change your banner", "collection", "Palette", "text-emerald-400", "bannerChanged", 1, 10, 20),
    a("pseudonym_changed", "Identity Change", "Change your pseudonym", "collection", "Pencil", "text-violet-400", "pseudonymChanged", 1, 20, 40),
    a("title_set", "Titled Player", "Set an active title", "collection", "Award", "text-amber-400", "titleSet", 1, 10, 20),
    a("dark_mode_user", "Night Mode", "Use dark mode", "collection", "Moon", "text-slate-400", "darkMode", 1, 10, 20),
  ];
}

// =============================================
// Special (25) — Hidden achievements
// =============================================
function genSpecial(): AchievementDef[] {
  const hidden: [string, string, string, number, number][] = [
    ["secret_midnight", "Midnight Gamer", "Play a game at midnight", 50, 100],
    ["secret_early_bird", "Early Bird", "Play a game before 7 AM", 50, 100],
    ["secret_night_owl", "Night Owl", "Play a game after 10 PM", 50, 100],
    ["secret_777", "Lucky Sevens", "Score exactly 777 in any game", 100, 200],
    ["secret_42", "The Answer", "Score exactly 42 in any game", 50, 100],
    ["secret_1337", "Elite", "Score exactly 1337 in any game", 100, 200, 10],
    ["secret_100", "Centurion Exact", "Score exactly 100 in any game", 30, 60],
    ["secret_comeback_7", "Comeback Kid", "Return after 7 days away", 50, 100],
    ["secret_comeback_30", "Phoenix", "Return after 30 days away", 100, 200],
    ["secret_10_session", "Marathon Session", "Play 10 games in one session", 50, 100],
    ["secret_25_session", "Iron Session", "Play 25 games in one session", 100, 200],
    ["secret_50_day", "Dedicated Day", "Play 50 games in one day", 100, 250],
    ["secret_weekend", "Weekend Warrior", "Play on a Saturday or Sunday", 30, 60],
    ["secret_holiday", "Festive Spirit", "Play on a holiday", 50, 100],
    ["secret_new_year", "New Year Gamer", "Play on January 1st", 100, 200, 5],
    ["secret_all_games_day", "Variety Pack", "Play all 8 games in one day", 200, 400, 10],
    ["secret_first_purchase", "First Buy", "Make your first store purchase", 20, 40],
    ["secret_all_purchases", "Shopaholic", "Buy every store item", 200, 500, 10],
    ["secret_no_spend_100", "Frugal", "Play 100 games without spending", 100, 200],
    ["secret_perfect_week", "Perfect Week", "Get 3 stars 7 days in a row", 200, 400, 10],
    ["secret_cat_lover", "Cat Lover", "Play 50 cat-themed games", 100, 200],
    ["secret_first_friend", "Social Starter", "Add your first friend", 20, 40],
    ["secret_first_gift", "Secret Santa", "Send your first gift", 20, 40],
    ["secret_100_achievements", "Achievement Hunter", "Unlock 100 achievements", 200, 500, 10],
    ["secret_half_achievements", "Dedicated Hunter", "Unlock 200 achievements", 500, 1000, 25],
  ];
  return hidden.map(([id, name, desc, xp, paws], i) =>
    a(id, name, desc, "special", "Sparkles", "text-fuchsia-400", `secret_${i}`, 1, xp, paws, undefined, true)
  );
}

// =============================================
// Misc (55) — Unique event achievements
// =============================================
function genMisc(): AchievementDef[] {
  return [
    ...tiers("special", "Award", "text-amber-400", "achievementsUnlocked", [
      [1, "First Achievement", "Unlock your first achievement", 10, 20],
      [10, "Achievement Hunter", "Unlock 10 achievements", 30, 60],
      [25, "Achievement Seeker", "Unlock 25 achievements", 50, 100],
      [50, "Achievement Collector", "Unlock 50 achievements", 75, 150],
      [75, "Achievement Master", "Unlock 75 achievements", 100, 250],
      [100, "Centennial Achiever", "Unlock 100 achievements", 150, 400],
      [150, "Achievement Legend", "Unlock 150 achievements", 200, 500],
      [200, "Achievement Hero", "Unlock 200 achievements", 300, 800],
      [250, "Achievement Grandmaster", "Unlock 250 achievements", 400, 1000],
      [300, "Achievement Mythic", "Unlock 300 achievements", 500, 1500, 10],
      [350, "Achievement God", "Unlock 350 achievements", 750, 2000, 25],
      [400, "Completionist", "Unlock 400 achievements", 2000, 5000, 100],
    ]),
    a("misc_cat_lover", "Cat Lover", "Play 10 cat-themed games", "special", "PawPrint", "text-orange-400", "catGamesPlayed", 10, 50, 100),
    a("misc_puzzle_lover", "Puzzle Solver", "Play 10 puzzle games", "special", "Puzzle", "text-blue-400", "puzzleGamesPlayed", 10, 50, 100),
    a("misc_arcade_lover", "Arcade Pro", "Play 10 arcade games", "special", "Gamepad2", "text-violet-400", "arcadeGamesPlayed", 10, 50, 100),
    a("misc_quiz_lover", "Brainiac", "Play 10 quiz games", "special", "Brain", "text-pink-400", "quizGamesPlayed", 10, 50, 100),
    a("misc_all_categories", "All-Rounder", "Play all game categories", "special", "Compass", "text-emerald-400", "categoriesPlayed", 4, 75, 150),
    a("misc_quick_draw", "Speed Demon", "Finish a game in under 30 seconds", "special", "Zap", "text-yellow-400", "quickDraw", 1, 30, 60),
    a("misc_marathon", "Marathon Runner", "Play a game for 30+ minutes", "special", "Clock", "text-blue-400", "marathonGamer", 1, 50, 100),
    a("misc_first_powerup", "Powered Up", "Use your first powerup", "special", "Zap", "text-violet-400", "powerupsUsed", 1, 20, 40),
    a("misc_powerup_10", "Power User", "Use 10 powerups", "special", "Zap", "text-violet-400", "powerupsUsed", 10, 30, 60),
    a("misc_powerup_50", "Power Master", "Use 50 powerups", "special", "Zap", "text-violet-400", "powerupsUsed", 50, 75, 150),
    a("misc_first_share", "Sharer", "Share your first result", "special", "Share2", "text-blue-400", "sharesCount", 1, 20, 40),
    a("misc_sharer_10", "Social Sharer", "Share 10 results", "special", "Share2", "text-blue-400", "sharesCount", 10, 30, 60),
    a("misc_first_feedback", "Voice", "Submit feedback", "special", "MessageSquare", "text-green-400", "feedbackGiven", 1, 20, 40),
    a("misc_3_in_row", "Triple Threat", "Play 3 games in a row", "special", "Flame", "text-orange-400", "gamesInRow", 3, 20, 40),
    a("misc_5_in_row", "Streak Player", "Play 5 games in a row", "special", "Flame", "text-red-400", "gamesInRow", 5, 30, 60),
    a("misc_10_in_row", "On a Roll", "Play 10 games in a row", "special", "Flame", "text-rose-400", "gamesInRow", 10, 50, 100),
    a("misc_first_screenshot", "Captured", "Take a screenshot", "special", "Camera", "text-purple-400", "screenshotsTaken", 1, 10, 20),
    a("misc_hub_visitor", "Home Base", "Visit the hub", "special", "Home", "text-violet-400", "hubVisited", 1, 5, 10),
    a("misc_store_visitor", "Window Shopper", "Visit the store", "special", "ShoppingBag", "text-pink-400", "storeVisited", 1, 5, 10),
    a("misc_rankings_viewer", "Competitor", "View the rankings", "special", "Trophy", "text-amber-400", "rankingsViewed", 1, 5, 10),
    a("misc_friends_viewer", "Socialite", "Visit the friends page", "special", "Users", "text-pink-400", "friendsViewed", 1, 5, 10),
    a("misc_settings_visitor", "Tinkerer", "Visit settings", "special", "Settings", "text-slate-400", "settingsVisited", 1, 5, 10),
    a("misc_profile_visitor", "Self Aware", "View your profile", "special", "User", "text-cyan-400", "profileViewed", 1, 5, 10),
    a("misc_game_visitor", "Player", "Visit a game page", "special", "Gamepad2", "text-violet-400", "gameVisited", 1, 5, 10),
    a("misc_all_games_played", "Jack of All Trades", "Play every game at least once", "special", "Compass", "text-emerald-400", "uniqueGames", 8, 100, 250, 5),
    a("misc_score_50_any", "Half Century", "Score 50+ in any game", "special", "Target", "text-blue-400", "anyHighScore", 50, 20, 40),
    a("misc_score_100_any", "Centurion", "Score 100+ in any game", "special", "Target", "text-violet-400", "anyHighScore", 100, 30, 60),
    a("misc_score_500_any", "High Roller", "Score 500+ in any game", "special", "Target", "text-amber-400", "anyHighScore", 500, 50, 100),
    a("misc_score_1000_any", "Score King", "Score 1000+ in any game", "special", "Trophy", "text-amber-400", "anyHighScore", 1000, 100, 250),
    a("misc_score_5000_any", "Mythic Score", "Score 5000+ in any game", "special", "Crown", "text-amber-400", "anyHighScore", 5000, 200, 500, 10),
    a("misc_play_5_games", "Casual Gamer", "Play 5 games total", "special", "Gamepad2", "text-violet-400", "gamesPlayed", 5, 15, 30),
    a("misc_play_25_games", "Active Gamer", "Play 25 games total", "special", "Gamepad2", "text-violet-400", "gamesPlayed", 25, 30, 60),
    a("misc_play_50_games", "Hardcore Gamer", "Play 50 games total", "special", "Gamepad2", "text-violet-400", "gamesPlayed", 50, 50, 100),
    a("misc_play_100_games", "Centurion Gamer", "Play 100 games total", "special", "Gamepad2", "text-violet-400", "gamesPlayed", 100, 75, 150),
    a("misc_earn_100_paws", "Paw Saver", "Earn 100 paws total", "special", "Coins", "text-amber-400", "pawsEarned", 100, 15, 30),
    a("misc_earn_500_paws", "Paw Collector", "Earn 500 paws total", "special", "Coins", "text-amber-400", "pawsEarned", 500, 30, 60),
    a("misc_level_5", "Rising Star", "Reach level 5", "special", "Star", "text-pink-400", "level", 5, 30, 60),
    a("misc_level_10", "Veteran", "Reach level 10", "special", "Crown", "text-purple-400", "level", 10, 75, 150),
    a("misc_level_20", "Grandmaster", "Reach level 20", "special", "Crown", "text-purple-400", "level", 20, 200, 500),
    a("misc_5_friends", "Social", "Add 5 friends", "special", "Users", "text-pink-400", "friendsCount", 5, 30, 60),
    a("misc_10_friends", "Popular", "Add 10 friends", "special", "Users", "text-pink-400", "friendsCount", 10, 50, 100),
    a("misc_3_banners", "Collector", "Own 3 banners", "special", "Palette", "text-emerald-400", "bannersOwned", 3, 20, 40),
    a("misc_5_banners", "Art Collector", "Own 5 banners", "special", "Palette", "text-emerald-400", "bannersOwned", 5, 30, 60),
    // Extra misc to reach 400+
    a("misc_play_3_games", "Getting Started", "Play 3 games", "special", "Gamepad2", "text-violet-400", "gamesPlayed", 3, 15, 30),
    a("misc_play_10_games", "Casual", "Play 10 games", "special", "Gamepad2", "text-violet-400", "gamesPlayed", 10, 20, 40),
    a("misc_earn_50_paws", "Small Saver", "Earn 50 paws", "special", "Coins", "text-amber-400", "pawsEarned", 50, 10, 20),
    a("misc_earn_1000_paws", "Paw Rich", "Earn 1,000 paws", "special", "Coins", "text-amber-400", "pawsEarned", 1000, 50, 100),
    a("misc_earn_5000_paws", "Paw Tycoon", "Earn 5,000 paws", "special", "Coins", "text-amber-400", "pawsEarned", 5000, 100, 200),
    a("misc_level_3", "Climbing", "Reach level 3", "special", "Star", "text-pink-400", "level", 3, 15, 30),
    a("misc_level_8", "Skilled", "Reach level 8", "special", "Crown", "text-purple-400", "level", 8, 50, 100),
    a("misc_level_15", "Master", "Reach level 15", "special", "Crown", "text-purple-400", "level", 15, 150, 300),
    a("misc_level_30", "Hero", "Reach level 30", "special", "Crown", "text-purple-400", "level", 30, 400, 800),
    a("misc_3_friends", "Social Circle", "Have 3 friends", "special", "Users", "text-pink-400", "friendsCount", 3, 20, 40),
    a("misc_25_friends", "Well-Connected", "Have 25 friends", "special", "Users", "text-pink-400", "friendsCount", 25, 75, 150),
    a("misc_gift_5", "Gift Giver", "Send 5 gifts", "special", "Gift", "text-violet-400", "giftsSent", 5, 20, 40),
    a("misc_gift_25", "Benefactor", "Send 25 gifts", "special", "Gift", "text-violet-400", "giftsSent", 25, 50, 100),
    a("misc_received_5", "Loved", "Receive 5 gifts", "special", "Heart", "text-red-400", "giftsReceived", 5, 20, 40),
    a("misc_received_25", "Cherished", "Receive 25 gifts", "special", "Heart", "text-red-400", "giftsReceived", 25, 50, 100),
    a("misc_1_banner", "First Banner", "Own 1 banner", "special", "Palette", "text-emerald-400", "bannersOwned", 1, 10, 20),
    a("misc_8_banners", "Banner Master", "Own all 8 banners", "special", "Palette", "text-emerald-400", "bannersOwned", 8, 100, 250, 5),
    a("misc_5_avatars", "Avatar Fan", "Use 5 avatars", "special", "Smile", "text-cyan-400", "avatarsUsed", 5, 15, 30),
    a("misc_10_avatars", "Avatar Pro", "Use 10 avatars", "special", "Smile", "text-cyan-400", "avatarsUsed", 10, 25, 50),
    a("misc_3_titles", "Titled", "Earn 3 titles", "special", "Award", "text-amber-400", "titlesEarned", 3, 20, 40),
    a("misc_5_titles", "Renowned", "Earn 5 titles", "special", "Award", "text-amber-400", "titlesEarned", 5, 30, 60),
    a("misc_stars_25", "Star Power", "Earn 25 stars", "special", "Star", "text-yellow-400", "totalStars", 25, 50, 100),
    a("misc_stars_50", "Radiant", "Earn 50 stars", "special", "Star", "text-yellow-400", "totalStars", 50, 75, 150),
    a("misc_stars_100", "Centennial Star", "Earn 100 stars", "special", "Star", "text-yellow-400", "totalStars", 100, 100, 250),
    a("misc_total_score_500", "Rising Score", "Earn 500 total points", "special", "TrendingUp", "text-cyan-400", "totalScore", 500, 20, 40),
    a("misc_total_score_5000", "Score Master", "Earn 5,000 total points", "special", "TrendingUp", "text-cyan-400", "totalScore", 5000, 50, 100),
    a("misc_total_score_50000", "Point Legend", "Earn 50,000 total points", "special", "TrendingUp", "text-cyan-400", "totalScore", 50000, 100, 250),
    a("misc_spent_500", "Regular Customer", "Spend 500 paws", "special", "ShoppingBag", "text-pink-400", "totalSpent", 500, 20, 40),
    a("misc_spent_5000", "VIP Shopper", "Spend 5,000 paws", "special", "ShoppingBag", "text-pink-400", "totalSpent", 5000, 100, 200),
    a("misc_daily_7", "Week of Bonuses", "Claim 7 daily bonuses", "special", "Gift", "text-violet-400", "dailyBonuses", 7, 30, 60),
    a("misc_daily_30", "Monthly Bonus", "Claim 30 daily bonuses", "special", "Gift", "text-violet-400", "dailyBonuses", 30, 75, 150),
    a("misc_purchases_5", "Frequent Buyer", "Make 5 purchases", "special", "ShoppingBag", "text-violet-400", "purchases", 5, 25, 50),
    a("misc_purchases_25", "Collector", "Make 25 purchases", "special", "ShoppingBag", "text-violet-400", "purchases", 25, 75, 150),
    a("misc_streak_14", "Fortnight Streak", "Maintain a 14-day streak", "special", "Flame", "text-orange-400", "longestStreak", 14, 75, 150),
    a("misc_streak_60", "Bi-Monthly Streak", "Maintain a 60-day streak", "special", "Flame", "text-red-400", "longestStreak", 60, 250, 500),
    a("misc_playtime_5h", "Five Hours", "Play for 5 hours total", "special", "Clock", "text-blue-400", "playTime", 18000, 25, 50),
    a("misc_playtime_50h", "Time Invested", "Play for 50 hours total", "special", "Clock", "text-blue-400", "playTime", 180000, 100, 250),
    a("misc_xp_1000", "XP Adept", "Earn 1,000 XP", "special", "Zap", "text-yellow-400", "xp", 1000, 30, 60),
    a("misc_xp_10000", "XP Master", "Earn 10,000 XP", "special", "Zap", "text-yellow-400", "xp", 10000, 75, 150),
    a("misc_xp_50000", "XP Legend", "Earn 50,000 XP", "special", "Zap", "text-yellow-400", "xp", 50000, 200, 400),
    // Daily challenge achievements
    a("misc_daily_chal_1", "Challenge Accepted", "Complete 1 daily challenge", "special", "Target", "text-violet-400", "dailyChallengesClaimed", 1, 10, 20),
    a("misc_daily_chal_10", "Challenger", "Complete 10 daily challenges", "special", "Target", "text-violet-400", "dailyChallengesClaimed", 10, 30, 60),
    a("misc_daily_chal_50", "Challenge Master", "Complete 50 daily challenges", "special", "Award", "text-purple-400", "dailyChallengesClaimed", 50, 75, 150),
    a("misc_daily_chal_100", "Challenge Legend", "Complete 100 daily challenges", "special", "Crown", "text-amber-400", "dailyChallengesClaimed", 100, 150, 300, 5),
    a("misc_daily_streak_3", "Hat Trick", "Complete all daily challenges 3 days in a row", "special", "Flame", "text-orange-400", "dailyStreak", 3, 50, 100),
    a("misc_daily_streak_7", "Week Warrior", "Complete all daily challenges 7 days in a row", "special", "Flame", "text-red-400", "dailyStreak", 7, 100, 200, 3),
    a("misc_daily_streak_30", "Unstoppable", "Complete all daily challenges 30 days in a row", "special", "Flame", "text-red-500", "dailyStreak", 30, 300, 600, 10),
  ];
}

// =============================================
// Multi-Color Fill (50)
// =============================================
function genMultiColorFill(): AchievementDef[] {
  return [
    a("mcf-first", "First Stroke", "Complete your first level", "gameplay", "Palette", "text-violet-400", "mcf-level", 1, 25, 0),
    a("mcf-level-5", "Color Apprentice", "Reach level 5", "gameplay", "Palette", "text-violet-400", "mcf-level", 5, 50, 0),
    a("mcf-level-10", "Color Enthusiast", "Reach level 10", "mastery", "Palette", "text-violet-400", "mcf-level", 10, 100, 0),
    a("mcf-level-15", "Color Master", "Reach level 15", "mastery", "Palette", "text-purple-400", "mcf-level", 15, 200, 0),
    a("mcf-level-30", "Color Grandmaster", "Reach level 30", "mastery", "Crown", "text-amber-400", "mcf-level", 30, 500, 3),
    a("mcf-three-star-5", "Perfectionist", "3-star 5 levels", "mastery", "Star", "text-yellow-400", "mcf-three-star", 5, 200, 0),
    a("mcf-three-star-10", "Perfect Artist", "3-star 10 levels", "mastery", "Star", "text-fuchsia-400", "mcf-three-star", 10, 400, 0),
    a("mcf-three-star-20", "Perfect Artist+", "3-star 20 levels", "mastery", "Trophy", "text-fuchsia-400", "mcf-three-star", 20, 1000, 5),
    a("mcf-no-hints-5", "Independent", "Complete 5 levels without hints", "mastery", "Lightbulb", "text-cyan-400", "mcf-no-hints", 5, 100, 0),
    a("mcf-no-hints-10", "No Help Needed", "Complete 10 levels without hints", "mastery", "Lightbulb", "text-cyan-400", "mcf-no-hints", 10, 200, 0),
    a("mcf-no-hints-20", "Path Master", "Complete 20 levels without hints", "mastery", "Lightbulb", "text-blue-400", "mcf-no-hints", 20, 500, 3),
    a("mcf-speed-30", "Quick Draw", "Complete a level in under 30 seconds", "mastery", "Zap", "text-yellow-400", "mcf-speed-30", 1, 150, 0),
    a("mcf-speed-15", "Lightning Artist", "Complete a level in under 15 seconds", "mastery", "Zap", "text-amber-400", "mcf-speed-15", 1, 500, 3),
    a("mcf-rainbow", "Rainbow", "Complete a level with 5+ colors", "mastery", "Palette", "text-fuchsia-400", "mcf-rainbow", 1, 300, 0),
    // Level milestones
    ...tiers("gameplay", "Palette", "text-violet-400", "mcf-level", [
      [2, "Double Stroke", "Complete 2 levels", 15, 30],
      [3, "Triple Stroke", "Complete 3 levels", 20, 40],
      [7, "Weekly Painter", "Complete 7 levels", 40, 80],
      [12, "Dedicated Painter", "Complete 12 levels", 60, 120],
      [20, "Color Veteran", "Complete 20 levels", 100, 200],
      [25, "Color Expert", "Complete 25 levels", 150, 300],
      [50, "Color Legend", "Complete 50 levels", 300, 600, 10],
    ]),
    // Play count
    ...tiers("gameplay", "Gamepad2", "text-violet-400", "plays:multi-color-fill", [
      [1, "First Try", "Play Multi-Color Fill once", 10, 20],
      [5, "Casual", "Play 5 times", 20, 40],
      [10, "Regular", "Play 10 times", 30, 60],
      [25, "Enthusiast", "Play 25 times", 50, 100],
      [50, "Devotee", "Play 50 times", 75, 150],
      [100, "Addicted", "Play 100 times", 100, 250],
    ]),
    // Score milestones
    ...tiers("mastery", "Target", "text-amber-400", "highScore:multi-color-fill", [
      [500, "Scorer", "Score 500+", 25, 50],
      [2000, "High Scorer", "Score 2,000+", 50, 100],
      [5000, "Score Master", "Score 5,000+", 75, 150],
      [10000, "Score Legend", "Score 10,000+", 100, 250, 3],
    ]),
    // Star milestones
    ...tiers("mastery", "Star", "text-yellow-400", "stars:multi-color-fill", [
      [1, "Star Player", "Earn 1 star", 20, 40],
      [3, "Perfect Player", "Earn 3 stars", 50, 100],
      [10, "Star Veteran", "Earn 10 stars", 75, 150],
      [30, "Star Legend", "Earn 30 stars", 150, 300, 5],
    ]),
    // Special
    a("mcf_all_levels", "Completionist", "Complete all 15 levels", "mastery", "Crown", "text-amber-400", "mcf-level", 15, 300, 5),
    a("mcf_speedrun", "Speedrunner", "Complete 5 levels in under 30s each", "mastery", "Zap", "text-yellow-400", "mcf-speed-30", 5, 300, 0),
  ];
}

// =============================================
// Paws Merge (50)
// =============================================
function genPawsMerge(): AchievementDef[] {
  return [
    a("pm-first", "First Drop", "Play Paws Merge for the first time", "gameplay", "PawPrint", "text-orange-400", "plays:paws-merge", 1, 25, 0),
    // Score milestones
    ...tiers("gameplay", "PawPrint", "text-orange-400", "pm-score", [
      [100, "Paw Starter", "Score 100", 10, 20],
      [500, "Paw Collector", "Score 500", 50, 0],
      [1000, "Paw Fan", "Score 1,000", 75, 0],
      [2000, "Paw Enthusiast", "Score 2,000", 200, 0],
      [5000, "Paw Pro", "Score 5,000", 300, 0],
      [10000, "Paw Master", "Score 10,000", 1000, 0, 5],
      [20000, "Paw Legend", "Score 20,000", 2000, 0, 10],
    ]),
    // Tier milestones
    a("pm-tier-2", "Tiny Pink", "Reach tier 2", "gameplay", "PawPrint", "text-pink-400", "pm-max-tier", 2, 15, 0),
    a("pm-tier-3", "Calico", "Reach tier 3", "gameplay", "PawPrint", "text-yellow-400", "pm-max-tier", 3, 20, 0),
    a("pm-tier-4", "Golden Lemon", "Reach tier 4", "gameplay", "PawPrint", "text-amber-400", "pm-max-tier", 4, 30, 0),
    a("pm-tier-5", "Peach Ginger", "Reach tier 5", "mastery", "PawPrint", "text-orange-400", "pm-max-tier", 5, 50, 0),
    a("pm-tier-6", "Purple Dusk", "Reach tier 6", "mastery", "PawPrint", "text-purple-400", "pm-max-tier", 6, 100, 0),
    a("pm-tier-7", "Cheetah Spot", "Reach tier 7", "mastery", "PawPrint", "text-amber-500", "pm-max-tier", 7, 200, 0),
    a("pm-tier-8", "Red Panda Paw", "Reach tier 8", "mastery", "PawPrint", "text-red-400", "pm-max-tier", 8, 300, 0),
    a("pm-tier-9", "Panther Paw", "Reach tier 9", "mastery", "PawPrint", "text-slate-400", "pm-max-tier", 9, 500, 0),
    a("pm-tier-10", "Lion Paw", "Reach tier 10", "mastery", "PawPrint", "text-amber-600", "pm-max-tier", 10, 1000, 5),
    a("pm-tier-11", "Mega Tiger Paw", "Reach tier 11", "mastery", "Crown", "text-orange-500", "pm-max-tier", 11, 2000, 10),
    // Play count
    ...tiers("gameplay", "Gamepad2", "text-violet-400", "plays:paws-merge", [
      [1, "First Try", "Play Paws Merge once", 10, 20],
      [5, "Casual", "Play 5 times", 20, 40],
      [10, "Regular", "Play 10 times", 30, 60],
      [25, "Enthusiast", "Play 25 times", 50, 100],
      [50, "Devotee", "Play 50 times", 75, 150],
      [100, "Addicted", "Play 100 times", 100, 250],
    ]),
    // High score
    ...tiers("mastery", "Target", "text-amber-400", "highScore:paws-merge", [
      [200, "Scorer", "Score 200+", 20, 40],
      [1000, "High Scorer", "Score 1,000+", 50, 100],
      [5000, "Score Master", "Score 5,000+", 100, 250],
      [15000, "Score Legend", "Score 15,000+", 200, 500, 5],
    ]),
    // Duster achievements
    ...tiers("mastery", "Sparkles", "text-cyan-400", "pm-duster", [
      [1, "Cleaner", "Use the duster once", 15, 30],
      [5, "Tidy Cat", "Use the duster 5 times", 30, 60],
      [10, "Clean Sweep", "Use the duster 10 times", 100, 0],
    ]),
    // Chain merges
    a("pm-chain-3", "Triple Threat", "Get a 3+ merge chain", "mastery", "Flame", "text-orange-400", "pm-chain-merge", 3, 150, 0),
    a("pm-chain-5", "Chain Reaction", "Get a 5+ merge chain", "mastery", "Flame", "text-red-400", "pm-chain-merge", 5, 1000, 5),
    a("pm-chain-10", "Chain Master", "Get a 10+ merge chain", "mastery", "Flame", "text-rose-500", "pm-chain-merge", 10, 2000, 10),
    // Stars
    ...tiers("mastery", "Star", "text-yellow-400", "stars:paws-merge", [
      [1, "Star Player", "Earn 1 star", 20, 40],
      [3, "Perfect Player", "Earn 3 stars", 50, 100],
      [10, "Star Veteran", "Earn 10 stars", 75, 150],
    ]),
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
  ...genMisc(),
  ...genMultiColorFill(),
  ...genPawsMerge(),
];

export const ACHIEVEMENT_MAP: Record<string, AchievementDef> = Object.fromEntries(
  ACHIEVEMENTS.map((a) => [a.id, a])
);

export const TOTAL_ACHIEVEMENTS = ACHIEVEMENTS.length;