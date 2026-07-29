export const APP_NAME = "Nya Hub";
export const APP_VERSION = "1.0.0";

export const MAX_PSEUDONYM_LENGTH = 20;
export const MIN_PSEUDONYM_LENGTH = 3;

export const DAILY_BONUS_PAWS = 50;
export const AD_REWARD_PAWS = 25;

export const PAWS_PER_GAME_MAX = 100;
export const PAWS_PER_SCORE_DIVISOR = 50;

export const HIGH_SCORE_BONUS_PAWS = 25;
export const HIGH_SCORE_BONUS_GEMS = 1;

export const STORAGE_PREFIX = "nya-";
export const MAX_TRANSACTIONS_HISTORY = 100;

export const DIFFICULTY_COLORS: Record<string, string> = {
  easy: "#4ADE80",
  medium: "#FBBF24",
  hard: "#F87171",
  expert: "#F87171",
};

export const SUPPORTED_LANGUAGES = ["en", "ar"] as const;