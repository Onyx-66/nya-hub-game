/**
 * Ad Service — placeholder implementation ready for real SDK (AdMob / Unity Ads).
 *
 * Interstitial rules:
 *   – not shown if ads removed
 *   – cooldown of 120s between interstitials
 *   – only shown every 3 game completions
 *
 * Rewarded rules:
 *   – user-initiated (always allowed unless ads removed)
 *   – returns reward details on success
 */
class AdService {
  private static instance: AdService;
  private adsRemoved: boolean = false;
  private interstitialCooldown: number = 0;
  private readonly COOLDOWN_SECONDS = 120;
  private gameCompletionsSinceLastAd: number = 0;
  private readonly GAMES_BETWEEN_ADS = 3;

  private config: {
    interstitialId?: string;
    rewardedId?: string;
    bannerId?: string;
  } = {};

  private constructor() {
    // Restore "remove ads" state from localStorage
    try {
      this.adsRemoved = localStorage.getItem("nya-ads-removed") === "true";
    } catch {
      /* ignore */
    }
  }

  static getInstance(): AdService {
    if (!AdService.instance) {
      AdService.instance = new AdService();
    }
    return AdService.instance;
  }

  /** Configure with real ad unit IDs when the SDK is integrated. */
  configure(config: {
    interstitialId?: string;
    rewardedId?: string;
    bannerId?: string;
  }): void {
    this.config = { ...this.config, ...config };
  }

  /** Mark ads as permanently removed (after purchase). */
  removeAds(): void {
    this.adsRemoved = true;
    try {
      localStorage.setItem("nya-ads-removed", "true");
    } catch {
      /* ignore */
    }
  }

  isAdRemoved(): boolean {
    return this.adsRemoved;
  }

  /**
   * Show an interstitial ad between games.
   * Returns true if an ad was (would have been) shown.
   */
  async showInterstitial(): Promise<boolean> {
    if (this.adsRemoved) return false;

    const now = Date.now();
    if (now < this.interstitialCooldown) return false;
    if (this.gameCompletionsSinceLastAd < this.GAMES_BETWEEN_ADS) return false;

    // TODO: call real SDK here, e.g. AdMob.showInterstitial(this.config.interstitialId)
    // For now, simulate a short ad delay
    await new Promise((r) => setTimeout(r, 300));

    this.interstitialCooldown = now + this.COOLDOWN_SECONDS * 1000;
    this.gameCompletionsSinceLastAd = 0;
    return true;
  }

  /**
   * Show a rewarded ad (user-initiated).
   * Returns reward details on completion.
   */
  async showRewarded(): Promise<{
    success: boolean;
    rewardType?: string;
    amount?: number;
  }> {
    if (this.adsRemoved) return { success: false };

    // TODO: call real SDK here, e.g. AdMob.showRewarded(this.config.rewardedId)
    // For now, simulate a short ad watch
    await new Promise((r) => setTimeout(r, 500));

    return { success: true, rewardType: "paws", amount: 25 };
  }

  /** Banner ads (persistent, for future use). */
  showBanner(): void {
    if (this.adsRemoved) return;
    // TODO: call real SDK
  }

  hideBanner(): void {
    // TODO: call real SDK
  }

  /** Track game completions for interstitial timing. */
  onGameCompleted(): void {
    this.gameCompletionsSinceLastAd++;
  }

  /** Reset all cooldowns / counters (for testing). */
  reset(): void {
    this.interstitialCooldown = 0;
    this.gameCompletionsSinceLastAd = 0;
  }
}

export const adService = AdService.getInstance();