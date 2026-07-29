/**
 * Payment Service — placeholder ready for Stripe / Google Play / Apple integration.
 *
 * Flow when integrated:
 *   1. initialize(provider) — set up the payment SDK
 *   2. getProducts() — fetch localized prices
 *   3. purchase(itemId) — initiate checkout
 *   4. verifyReceipt(receipt) — validate with backend
 *   5. restorePurchases() — sync previously bought items
 */
class PaymentService {
  private static instance: PaymentService;
  private provider: "stripe" | "google-play" | "apple" | null = null;
  private initialized = false;
  private ownedItems: Set<string> = new Set();

  private constructor() {
    // Restore owned items from localStorage
    try {
      const stored = localStorage.getItem("nya-owned-items");
      if (stored) {
        JSON.parse(stored).forEach((id: string) => this.ownedItems.add(id));
      }
    } catch {
      /* ignore */
    }
  }

  static getInstance(): PaymentService {
    if (!PaymentService.instance) {
      PaymentService.instance = new PaymentService();
    }
    return PaymentService.instance;
  }

  /** Initialize with the target payment provider. */
  async initialize(
    provider: "stripe" | "google-play" | "apple",
  ): Promise<void> {
    this.provider = provider;
    // TODO: initialize real SDK (Stripe.js / Google Play Billing / StoreKit)
    this.initialized = true;
  }

  /**
   * Purchase an item.
   * Returns success + transaction ID on completion.
   */
  async purchase(
    itemId: string,
  ): Promise<{ success: boolean; transactionId?: string }> {
    if (!this.initialized) {
      // For now: simulate a failed purchase (SDK not configured)
      return { success: false };
    }

    // TODO: call real SDK
    // 1. Call payment processor
    // 2. Verify receipt with backend
    // 3. Grant items via economyStore
    await new Promise((r) => setTimeout(r, 500));

    const transactionId = `tx_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
    this.ownedItems.add(itemId);
    this.persistOwned();

    return { success: true, transactionId };
  }

  /** Verify a receipt with the backend. */
  async verifyReceipt(receipt: string): Promise<boolean> {
    // TODO: POST receipt to backend for validation
    if (!receipt) return false;
    return true;
  }

  /** Restore previously purchased items. Returns list of owned item IDs. */
  async restorePurchases(): Promise<string[]> {
    // TODO: call real SDK restore
    return Array.from(this.ownedItems);
  }

  /** Get localized product prices. */
  async getProducts(): Promise<
    Map<string, { price: string; currency: string }>
  > {
    // TODO: fetch from real SDK
    return new Map();
  }

  /** Check if an item is already owned. */
  isOwned(itemId: string): boolean {
    return this.ownedItems.has(itemId);
  }

  private persistOwned(): void {
    try {
      localStorage.setItem(
        "nya-owned-items",
        JSON.stringify(Array.from(this.ownedItems)),
      );
    } catch {
      /* ignore */
    }
  }
}

export const paymentService = PaymentService.getInstance();