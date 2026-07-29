// =============================================
// SoundManager — Lightweight Web Audio sound effects + haptics.
// No external assets; synthesizes tones on the fly.
// =============================================

export class SoundManager {
  private ctx: AudioContext | null = null;
  private muted = false;

  setMuted(muted: boolean): void {
    this.muted = muted;
  }

  isMuted(): boolean {
    return this.muted;
  }

  private ensureCtx(): AudioContext | null {
    if (this.muted) return null;
    if (typeof window === "undefined") return null;
    if (!this.ctx) {
      const AC =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;
      if (!AC) return null;
      try {
        this.ctx = new AC();
      } catch {
        return null;
      }
    }
    if (this.ctx.state === "suspended") {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  private tone(
    freq: number,
    duration: number,
    type: OscillatorType = "sine",
    volume = 0.12,
    delay = 0,
  ): void {
    const ctx = this.ensureCtx();
    if (!ctx) return;
    const now = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    gain.gain.setValueAtTime(volume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + duration);
  }

  /** Pleasant two-note chirp when eating food. */
  playEat(): void {
    this.tone(880, 0.08, "square", 0.1);
    this.tone(1100, 0.06, "square", 0.08, 0.04);
  }

  /** Short click on direction change. */
  playTurn(): void {
    this.tone(500, 0.03, "square", 0.04);
  }

  /** Descending tones on game over. */
  playGameOver(): void {
    this.tone(400, 0.15, "sawtooth", 0.12);
    this.tone(300, 0.15, "sawtooth", 0.12, 0.12);
    this.tone(200, 0.3, "sawtooth", 0.12, 0.24);
  }

  /** Single beep for countdown ticks. */
  playCountdown(): void {
    this.tone(600, 0.1, "sine", 0.1);
  }

  /** Rising two-note for "GO!" / start. */
  playStart(): void {
    this.tone(660, 0.1, "sine", 0.1);
    this.tone(880, 0.15, "sine", 0.1, 0.08);
  }

  /** Haptic vibration (no-op on unsupported devices). */
  vibrate(pattern: number | number[]): void {
    if (this.muted) return;
    if (typeof navigator !== "undefined" && typeof navigator.vibrate === "function") {
      try {
        navigator.vibrate(pattern);
      } catch {
        // no-op
      }
    }
  }
}

export default SoundManager;