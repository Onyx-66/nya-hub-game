/**
 * AudioService — procedural sound & music using the Web Audio API.
 * No external files needed; all sounds are synthesized at runtime.
 */

type SoundEffect =
  | "button-click" | "button-hover" | "modal-open" | "modal-close"
  | "toast-appear" | "tab-switch" | "toggle-on" | "toggle-off"
  | "paw-earn" | "paw-spend" | "gem-earn" | "gem-spend"
  | "purchase-success" | "purchase-fail" | "insufficient-funds"
  | "friend-request" | "friend-accept" | "gift-send" | "gift-receive"
  | "achievement-unlock" | "level-up" | "milestone-reached"
  | "game-start" | "game-over" | "game-win" | "game-lose"
  | "countdown-tick" | "countdown-end"
  | "correct-answer" | "wrong-answer"
  | "combo" | "cascade" | "perfect"
  | "block-place" | "block-clear" | "block-error"
  | "pour-liquid" | "tube-complete"
  | "number-place" | "number-error" | "hint-use"
  | "cat-launch" | "collision" | "structure-destroy"
  | "sword-charge" | "boss-hit" | "boss-defeat"
  | "candy-swap" | "candy-match" | "special-candy"
  | "color-fill" | "page-complete";

type MusicTrack =
  | "hub-ambient" | "hub-chill"
  | "snake-energetic" | "water-sort-calm"
  | "meowdoku-focus" | "furious-felines-action"
  | "quiz-sword-epic" | "block-blast-upbeat"
  | "nya-crush-happy" | "coloring-relaxing"
  | "landing-mystical" | "menu-soft";

const STORAGE_SFX = "nya-sfx-enabled";
const STORAGE_MUSIC = "nya-music-enabled";
const STORAGE_SFX_VOL = "nya-sfx-volume";
const STORAGE_MUSIC_VOL = "nya-music-volume";

// ── Note frequencies (Hz) ──
const NOTE: Record<string, number> = {
  C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.0, A4: 440.0, B4: 493.88,
  C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99, A5: 880.0, B5: 987.77,
  C6: 1046.5, D6: 1174.66, E6: 1318.51, G6: 1567.98,
};

class AudioService {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private sfxEnabled: boolean = true;
  private musicEnabled: boolean = true;
  private musicVolume: number = 0.35;
  private sfxVolume: number = 0.6;
  private musicNodes: { gain: GainNode; oscillators: OscillatorNode[] } | null = null;
  private currentMusic: MusicTrack | null = null;
  private musicTimer: ReturnType<typeof setInterval> | null = null;

  constructor() {
    this.sfxEnabled = this.loadBool(STORAGE_SFX, true);
    this.musicEnabled = this.loadBool(STORAGE_MUSIC, true);
    this.sfxVolume = this.loadNum(STORAGE_SFX_VOL, 0.6);
    this.musicVolume = this.loadNum(STORAGE_MUSIC_VOL, 0.35);
  }

  // ── Persistence helpers ──
  private loadBool(key: string, fallback: boolean): boolean {
    try { const v = localStorage.getItem(key); return v === null ? fallback : v === "true"; } catch { return fallback; }
  }
  private loadNum(key: string, fallback: number): number {
    try { const v = localStorage.getItem(key); return v === null ? fallback : Number(v) || fallback; } catch { return fallback; }
  }
  private save(key: string, val: string): void { try { localStorage.setItem(key, val); } catch { /* ignore */ } }

  // ── Lazy-init AudioContext (must be triggered by user gesture) ──
  private ensureContext(): AudioContext | null {
    if (this.ctx) return this.ctx;
    try {
      const Ctx = window.AudioContext || (window as any).webkitAudioContext;
      if (!Ctx) return null;
      this.ctx = new Ctx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = 1;
      this.masterGain.connect(this.ctx.destination);
      if (this.ctx.state === "suspended") this.ctx.resume();
    } catch { return null; }
    return this.ctx;
  }

  // ── Core: play a single tone ──
  private tone(
    freq: number,
    start: number,
    duration: number,
    type: OscillatorType = "sine",
    gain: number = 0.5,
    dest: GainNode | null = null,
  ): { osc: OscillatorNode; gain: GainNode } | null {
    const ctx = this.ensureContext();
    if (!ctx || !this.masterGain) return null;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime + start);
    g.gain.setValueAtTime(0, ctx.currentTime + start);
    g.gain.linearRampToValueAtTime(gain, ctx.currentTime + start + 0.01);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + duration);
    osc.connect(g);
    g.connect(dest || this.masterGain);
    osc.start(ctx.currentTime + start);
    osc.stop(ctx.currentTime + start + duration + 0.05);
    return { osc, gain: g };
  }

  // ── Frequency sweep ──
  private sweep(
    from: number,
    to: number,
    start: number,
    duration: number,
    type: OscillatorType = "sine",
    gain: number = 0.4,
  ): void {
    const ctx = this.ensureContext();
    if (!ctx || !this.masterGain) return;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(from, ctx.currentTime + start);
    osc.frequency.exponentialRampToValueAtTime(Math.max(1, to), ctx.currentTime + start + duration);
    g.gain.setValueAtTime(0, ctx.currentTime + start);
    g.gain.linearRampToValueAtTime(gain, ctx.currentTime + start + 0.02);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + duration);
    osc.connect(g);
    g.connect(this.masterGain);
    osc.start(ctx.currentTime + start);
    osc.stop(ctx.currentTime + start + duration + 0.05);
  }

  // ── Noise burst (for clicks, percussive sounds) ──
  private noiseBurst(start: number, duration: number, gain: number = 0.3): void {
    const ctx = this.ensureContext();
    if (!ctx || !this.masterGain) return;
    const bufferSize = Math.floor(ctx.sampleRate * duration);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    const g = ctx.createGain();
    g.gain.value = gain;
    src.connect(g);
    g.connect(this.masterGain);
    src.start(ctx.currentTime + start);
  }

  // ── Play a sequence of notes (arpeggio/melody) ──
  private melody(notes: number[], start: number, noteDur: number, type: OscillatorType, gain: number): void {
    notes.forEach((f, i) => this.tone(f, start + i * noteDur, noteDur, type, gain));
  }

  // ════════════════════════════════════════════════
  //  Sound Effects
  // ════════════════════════════════════════════════
  playSFX(name: SoundEffect): void {
    if (!this.sfxEnabled) return;
    const ctx = this.ensureContext();
    if (!ctx) return;
    if (ctx.state === "suspended") ctx.resume();

    const vol = this.sfxVolume;

    switch (name) {
      case "button-click":
        this.tone(800, 0, 0.05, "sine", 0.4 * vol);
        this.noiseBurst(0, 0.01, 0.15 * vol);
        break;
      case "button-hover":
        this.tone(1200, 0, 0.03, "sine", 0.12 * vol);
        break;
      case "modal-open":
        this.sweep(400, 800, 0, 0.15, "sine", 0.3 * vol);
        break;
      case "modal-close":
        this.sweep(800, 400, 0, 0.15, "sine", 0.3 * vol);
        break;
      case "toast-appear":
        this.melody([NOTE.C5, NOTE.E5, NOTE.G5], 0, 0.06, "sine", 0.3 * vol);
        break;
      case "tab-switch":
        this.tone(600, 0, 0.04, "triangle", 0.25 * vol);
        break;
      case "toggle-on":
        this.melody([NOTE.C5, NOTE.G5], 0, 0.05, "sine", 0.3 * vol);
        break;
      case "toggle-off":
        this.melody([NOTE.G5, NOTE.C5], 0, 0.05, "sine", 0.3 * vol);
        break;
      case "paw-earn":
        this.melody([NOTE.C5, NOTE.E5, NOTE.G5], 0, 0.07, "sine", 0.35 * vol);
        break;
      case "paw-spend":
        this.tone(300, 0, 0.1, "triangle", 0.3 * vol);
        break;
      case "gem-earn":
        this.melody([NOTE.C6, NOTE.E6, NOTE.G6], 0, 0.08, "sine", 0.25 * vol);
        break;
      case "gem-spend":
        this.tone(200, 0, 0.1, "triangle", 0.25 * vol);
        break;
      case "purchase-success":
        this.melody([NOTE.C5, NOTE.E5, NOTE.G5, NOTE.C6], 0, 0.08, "sine", 0.35 * vol);
        break;
      case "purchase-fail":
      case "insufficient-funds":
        this.tone(150, 0, 0.15, "square", 0.3 * vol);
        this.tone(120, 0.1, 0.15, "square", 0.25 * vol);
        break;
      case "friend-request":
        this.melody([NOTE.E5, NOTE.C5], 0, 0.08, "sine", 0.3 * vol);
        break;
      case "friend-accept":
        this.melody([NOTE.C5, NOTE.E5, NOTE.G5], 0, 0.07, "sine", 0.35 * vol);
        break;
      case "gift-send":
        this.sweep(500, 1000, 0, 0.2, "sine", 0.3 * vol);
        break;
      case "gift-receive":
        this.melody([NOTE.G5, NOTE.C6, NOTE.E6], 0, 0.08, "sine", 0.3 * vol);
        break;
      case "achievement-unlock":
        this.melody([NOTE.C5, NOTE.E5, NOTE.G5, NOTE.C6], 0, 0.1, "sine", 0.4 * vol);
        this.tone(NOTE.E6, 0.4, 0.3, "sine", 0.2 * vol);
        break;
      case "level-up":
        this.sweep(200, 800, 0, 0.4, "sine", 0.35 * vol);
        this.melody([NOTE.C5, NOTE.G5, NOTE.C6], 0.2, 0.1, "sine", 0.3 * vol);
        break;
      case "milestone-reached":
        this.melody([NOTE.G5, NOTE.C6, NOTE.E6, NOTE.G6], 0, 0.1, "sine", 0.35 * vol);
        break;
      case "game-start":
        this.melody([NOTE.C5, NOTE.G5, NOTE.C6], 0, 0.08, "triangle", 0.3 * vol);
        break;
      case "game-over":
        this.melody([NOTE.G5, NOTE.F5, NOTE.E5, NOTE.D5, NOTE.C5], 0, 0.1, "triangle", 0.3 * vol);
        break;
      case "game-win":
        this.melody([NOTE.C5, NOTE.D5, NOTE.E5, NOTE.F5, NOTE.G5, NOTE.A5, NOTE.B5, NOTE.C6], 0, 0.08, "sine", 0.35 * vol);
        break;
      case "game-lose":
        this.melody([NOTE.C5, NOTE.B4, NOTE.A4, NOTE.G4, NOTE.F4, NOTE.E4, NOTE.D4, NOTE.C4], 0, 0.08, "triangle", 0.3 * vol);
        break;
      case "countdown-tick":
        this.tone(800, 0, 0.05, "square", 0.2 * vol);
        break;
      case "countdown-end":
        this.tone(1200, 0, 0.3, "sine", 0.35 * vol);
        break;
      case "correct-answer":
        this.tone(NOTE.C6, 0, 0.15, "sine", 0.35 * vol);
        break;
      case "wrong-answer":
        this.tone(100, 0, 0.3, "square", 0.3 * vol);
        break;
      case "combo":
        this.melody([NOTE.C5, NOTE.E5, NOTE.G5, NOTE.C6], 0, 0.04, "sine", 0.3 * vol);
        break;
      case "cascade":
        this.sweep(400, 1600, 0, 0.3, "sine", 0.3 * vol);
        break;
      case "perfect":
        this.melody([NOTE.C6, NOTE.E6, NOTE.G6, NOTE.C6], 0, 0.08, "sine", 0.4 * vol);
        break;
      case "block-place":
        this.tone(300, 0, 0.08, "square", 0.25 * vol);
        break;
      case "block-clear":
        this.melody([NOTE.E5, NOTE.G5], 0, 0.05, "sine", 0.3 * vol);
        break;
      case "block-error":
        this.tone(120, 0, 0.15, "square", 0.25 * vol);
        break;
      case "pour-liquid":
        this.sweep(600, 300, 0, 0.3, "sine", 0.2 * vol);
        break;
      case "tube-complete":
        this.melody([NOTE.C5, NOTE.E5, NOTE.G5], 0, 0.06, "sine", 0.3 * vol);
        break;
      case "number-place":
        this.tone(600, 0, 0.05, "sine", 0.25 * vol);
        break;
      case "number-error":
        this.tone(150, 0, 0.15, "square", 0.25 * vol);
        break;
      case "hint-use":
        this.tone(800, 0, 0.1, "triangle", 0.25 * vol);
        break;
      case "cat-launch":
        this.sweep(300, 900, 0, 0.25, "sine", 0.3 * vol);
        break;
      case "collision":
        this.tone(80, 0, 0.2, "square", 0.4 * vol);
        this.noiseBurst(0, 0.1, 0.2 * vol);
        break;
      case "structure-destroy":
        this.tone(60, 0, 0.3, "square", 0.3 * vol);
        this.noiseBurst(0, 0.2, 0.25 * vol);
        break;
      case "sword-charge":
        this.sweep(100, 500, 0, 0.5, "sawtooth", 0.25 * vol);
        break;
      case "boss-hit":
        this.tone(200, 0, 0.1, "square", 0.35 * vol);
        this.noiseBurst(0, 0.05, 0.15 * vol);
        break;
      case "boss-defeat":
        this.melody([NOTE.G5, NOTE.C6, NOTE.E6, NOTE.G6], 0, 0.1, "sine", 0.4 * vol);
        this.tone(100, 0.2, 0.4, "square", 0.2 * vol);
        break;
      case "candy-swap":
        this.tone(700, 0, 0.06, "sine", 0.25 * vol);
        break;
      case "candy-match":
        this.melody([NOTE.C5, NOTE.G5], 0, 0.05, "sine", 0.3 * vol);
        break;
      case "special-candy":
        this.melody([NOTE.C6, NOTE.E6, NOTE.G6], 0, 0.07, "sine", 0.35 * vol);
        break;
      case "color-fill":
        this.tone(500, 0, 0.08, "sine", 0.2 * vol);
        break;
      case "page-complete":
        this.melody([NOTE.C5, NOTE.E5, NOTE.G5, NOTE.C6], 0, 0.1, "sine", 0.35 * vol);
        break;
      default:
        break;
    }
  }

  // ════════════════════════════════════════════════
  //  Music — procedural loopable tracks
  // ════════════════════════════════════════════════
  playMusic(track: MusicTrack, fadeIn: boolean = true): void {
    if (this.currentMusic === track && this.musicNodes) return;
    this.stopMusic(true);
    if (!this.musicEnabled) return;

    const ctx = this.ensureContext();
    if (!ctx || !this.masterGain) return;
    if (ctx.state === "suspended") ctx.resume();

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(fadeIn ? 0 : this.musicVolume, ctx.currentTime);
    if (fadeIn) gain.gain.linearRampToValueAtTime(this.musicVolume, ctx.currentTime + 0.8);
    gain.connect(this.masterGain);

    // Define chord progressions per track
    const trackDef = this.getMusicDef(track);
    const oscillators: OscillatorNode[] = [];
    let beatIndex = 0;

    const playBeat = () => {
      if (!this.ctx || !this.musicNodes) return;
      const t = this.ctx.currentTime;
      const beat = trackDef[beatIndex % trackDef.length];

      // Pad chord
      beat.chord.forEach((f) => {
        const osc = this.ctx!.createOscillator();
        const g = this.ctx!.createGain();
        osc.type = beat.padType || "sine";
        osc.frequency.value = f;
        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(0.12, t + 0.1);
        g.gain.exponentialRampToValueAtTime(0.001, t + beat.dur);
        osc.connect(g);
        g.connect(gain);
        osc.start(t);
        osc.stop(t + beat.dur + 0.1);
        oscillators.push(osc);
      });

      // Melody note
      if (beat.melody) {
        const osc = this.ctx!.createOscillator();
        const g = this.ctx!.createGain();
        osc.type = beat.melodyType || "triangle";
        osc.frequency.value = beat.melody;
        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(0.08, t + 0.05);
        g.gain.exponentialRampToValueAtTime(0.001, t + beat.melodyDur || 0.5);
        osc.connect(g);
        g.connect(gain);
        osc.start(t);
        osc.stop(t + (beat.melodyDur || 0.5) + 0.1);
        oscillators.push(osc);
      }

      beatIndex++;
    };

    playBeat();
    this.musicTimer = setInterval(playBeat, 1500);
    this.currentMusic = track;
    this.musicNodes = { gain, oscillators };
  }

  private getMusicDef(track: MusicTrack): MusicBeat[] {
    const defs: Record<MusicTrack, MusicBeat[]> = {
      "hub-ambient": [
        { chord: [NOTE.C4, NOTE.E4, NOTE.G4], dur: 2, melody: NOTE.C5, melodyDur: 1, melodyType: "sine" },
        { chord: [NOTE.A4, NOTE.C5, NOTE.E5], dur: 2, melody: NOTE.E5, melodyDur: 1, melodyType: "sine" },
        { chord: [NOTE.F4, NOTE.A4, NOTE.C5], dur: 2, melody: NOTE.A5, melodyDur: 1, melodyType: "sine" },
        { chord: [NOTE.G4, NOTE.B4, NOTE.D5], dur: 2, melody: NOTE.G5, melodyDur: 1, melodyType: "sine" },
      ],
      "hub-chill": [
        { chord: [NOTE.C4, NOTE.E4, NOTE.G4, NOTE.B4], dur: 3, melody: NOTE.E5, melodyDur: 1.5, melodyType: "triangle" },
        { chord: [NOTE.F4, NOTE.A4, NOTE.C5], dur: 3, melody: NOTE.A5, melodyDur: 1.5, melodyType: "triangle" },
      ],
      "snake-energetic": [
        { chord: [NOTE.A4], dur: 0.4, melody: NOTE.A5, melodyDur: 0.35, melodyType: "square", padType: "sawtooth" },
        { chord: [NOTE.A4], dur: 0.4, melody: NOTE.C6, melodyDur: 0.35, melodyType: "square", padType: "sawtooth" },
        { chord: [NOTE.E4], dur: 0.4, melody: NOTE.E5, melodyDur: 0.35, melodyType: "square", padType: "sawtooth" },
        { chord: [NOTE.G4], dur: 0.4, melody: NOTE.G5, melodyDur: 0.35, melodyType: "square", padType: "sawtooth" },
      ],
      "water-sort-calm": [
        { chord: [NOTE.C4, NOTE.G4], dur: 2.5, melody: NOTE.E5, melodyDur: 2, melodyType: "sine", padType: "sine" },
        { chord: [NOTE.D4, NOTE.A4], dur: 2.5, melody: NOTE.F5, melodyDur: 2, melodyType: "sine", padType: "sine" },
      ],
      "meowdoku-focus": [
        { chord: [NOTE.C4, NOTE.E4], dur: 2, melody: NOTE.G5, melodyDur: 0.8, melodyType: "triangle", padType: "sine" },
        { chord: [NOTE.A4, NOTE.C5], dur: 2, melody: NOTE.E5, melodyDur: 0.8, melodyType: "triangle", padType: "sine" },
      ],
      "furious-felines-action": [
        { chord: [NOTE.E4], dur: 0.5, melody: NOTE.E5, melodyDur: 0.4, melodyType: "square", padType: "sawtooth" },
        { chord: [NOTE.E4], dur: 0.5, melody: NOTE.G5, melodyDur: 0.4, melodyType: "square", padType: "sawtooth" },
        { chord: [NOTE.C4], dur: 0.5, melody: NOTE.C5, melodyDur: 0.4, melodyType: "square", padType: "sawtooth" },
        { chord: [NOTE.D4], dur: 0.5, melody: NOTE.D5, melodyDur: 0.4, melodyType: "square", padType: "sawtooth" },
      ],
      "quiz-sword-epic": [
        { chord: [NOTE.A4, NOTE.E5], dur: 2, melody: NOTE.A5, melodyDur: 1, melodyType: "triangle", padType: "sawtooth" },
        { chord: [NOTE.F4, NOTE.C5], dur: 2, melody: NOTE.F5, melodyDur: 1, melodyType: "triangle", padType: "sawtooth" },
        { chord: [NOTE.G4, NOTE.D5], dur: 2, melody: NOTE.G5, melodyDur: 1, melodyType: "triangle", padType: "sawtooth" },
      ],
      "block-blast-upbeat": [
        { chord: [NOTE.C4, NOTE.E4], dur: 0.6, melody: NOTE.G5, melodyDur: 0.5, melodyType: "square", padType: "sine" },
        { chord: [NOTE.C4, NOTE.E4], dur: 0.6, melody: NOTE.C6, melodyDur: 0.5, melodyType: "square", padType: "sine" },
        { chord: [NOTE.F4, NOTE.A4], dur: 0.6, melody: NOTE.A5, melodyDur: 0.5, melodyType: "square", padType: "sine" },
        { chord: [NOTE.G4, NOTE.B4], dur: 0.6, melody: NOTE.B5, melodyDur: 0.5, melodyType: "square", padType: "sine" },
      ],
      "nya-crush-happy": [
        { chord: [NOTE.C4, NOTE.E4, NOTE.G4], dur: 1, melody: NOTE.C5, melodyDur: 0.8, melodyType: "triangle" },
        { chord: [NOTE.F4, NOTE.A4, NOTE.C5], dur: 1, melody: NOTE.A5, melodyDur: 0.8, melodyType: "triangle" },
      ],
      "coloring-relaxing": [
        { chord: [NOTE.C4, NOTE.G4], dur: 3, melody: NOTE.E5, melodyDur: 2.5, melodyType: "sine", padType: "sine" },
        { chord: [NOTE.D4, NOTE.A4], dur: 3, melody: NOTE.F5, melodyDur: 2.5, melodyType: "sine", padType: "sine" },
      ],
      "landing-mystical": [
        { chord: [NOTE.C4, NOTE.E4, NOTE.G4, NOTE.B4], dur: 3, melody: NOTE.E5, melodyDur: 2, melodyType: "sine" },
        { chord: [NOTE.A4, NOTE.C5, NOTE.E5], dur: 3, melody: NOTE.A5, melodyDur: 2, melodyType: "sine" },
      ],
      "menu-soft": [
        { chord: [NOTE.C4, NOTE.E4, NOTE.G4], dur: 2, melody: NOTE.G5, melodyDur: 1.5, melodyType: "triangle" },
        { chord: [NOTE.F4, NOTE.A4, NOTE.C5], dur: 2, melody: NOTE.A5, melodyDur: 1.5, melodyType: "triangle" },
      ],
    };
    return defs[track];
  }

  stopMusic(fadeOut: boolean = true): void {
    if (!this.musicNodes || !this.ctx) {
      this.currentMusic = null;
      this.musicNodes = null;
      if (this.musicTimer) { clearInterval(this.musicTimer); this.musicTimer = null; }
      return;
    }
    const { gain } = this.musicNodes;
    if (fadeOut) {
      gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.3);
    }
    setTimeout(() => {
      if (this.musicTimer) { clearInterval(this.musicTimer); this.musicTimer = null; }
      this.musicNodes = null;
      this.currentMusic = null;
    }, fadeOut ? 350 : 0);
  }

  pauseMusic(): void { this.stopMusic(false); }
  resumeMusic(): void { if (this.currentMusic) this.playMusic(this.currentMusic, true); }

  setMusicVolume(volume: number): void {
    this.musicVolume = Math.max(0, Math.min(1, volume));
    this.save(STORAGE_MUSIC_VOL, String(this.musicVolume));
    if (this.musicNodes) this.musicNodes.gain.gain.value = this.musicVolume;
  }
  setSFXVolume(volume: number): void {
    this.sfxVolume = Math.max(0, Math.min(1, volume));
    this.save(STORAGE_SFX_VOL, String(this.sfxVolume));
  }

  toggleSFX(): boolean {
    this.sfxEnabled = !this.sfxEnabled;
    this.save(STORAGE_SFX, String(this.sfxEnabled));
    return this.sfxEnabled;
  }
  toggleMusic(): boolean {
    this.musicEnabled = !this.musicEnabled;
    this.save(STORAGE_MUSIC, String(this.musicEnabled));
    if (!this.musicEnabled) this.stopMusic(true);
    return this.musicEnabled;
  }

  isSFXEnabled(): boolean { return this.sfxEnabled; }
  isMusicEnabled(): boolean { return this.musicEnabled; }
  getMusicVolume(): number { return this.musicVolume; }
  getSFXVolume(): number { return this.sfxVolume; }

  getCurrentMusic(): MusicTrack | null { return this.currentMusic; }
}

interface MusicBeat {
  chord: number[];
  dur: number;
  melody?: number;
  melodyDur?: number;
  melodyType?: OscillatorType;
  padType?: OscillatorType;
}

export const audioService = new AudioService();
export { AudioService };
export type { SoundEffect, MusicTrack };