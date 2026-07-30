/**
 * Daily reward logic — true 24-hour cooldown from last claim.
 * Shared by the DailyBonus popup and the Profile reward card.
 */

const STORAGE_KEY = "nya-daily-bonus-claimed-at";
const COOLDOWN_MS = 24 * 60 * 60 * 1000; // 24 hours

export const DAILY_BASE_REWARD = 50;
export const DAILY_AD_REWARD = 150;

export interface DailyRewardStatus {
  canClaim: boolean;
  msUntilNext: number; // 0 when claimable
  lastClaimedAt: number | null; // epoch ms, null if never
}

export function getDailyStatus(): DailyRewardStatus {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { canClaim: true, msUntilNext: 0, lastClaimedAt: null };
    }
    const last = Number(raw);
    if (Number.isNaN(last)) {
      return { canClaim: true, msUntilNext: 0, lastClaimedAt: null };
    }
    const elapsed = Date.now() - last;
    if (elapsed >= COOLDOWN_MS) {
      return { canClaim: true, msUntilNext: 0, lastClaimedAt: last };
    }
    return { canClaim: false, msUntilNext: COOLDOWN_MS - elapsed, lastClaimedAt: last };
  } catch {
    return { canClaim: true, msUntilNext: 0, lastClaimedAt: null };
  }
}

export function markDailyClaimed(): void {
  try {
    localStorage.setItem(STORAGE_KEY, String(Date.now()));
  } catch {
    /* ignore */
  }
}

export function formatCountdown(ms: number): string {
  if (ms <= 0) return "Ready!";
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${hours}h ${minutes}m ${seconds}s`;
}