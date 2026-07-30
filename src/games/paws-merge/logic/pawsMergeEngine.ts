// =============================================
// Paws Merge Engine — Suika-like 2D physics with merging
// =============================================

export type PawTier = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11;

export interface Paw {
  id: string;
  tier: PawTier;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  name: string;
  isResting: boolean;
  merged: boolean;
}

export type GameState = "aiming" | "dropping" | "merging" | "gameover";

interface TierDef {
  tier: PawTier;
  name: string;
  color: string;
  radius: number;
  points: number;
}

export const TIERS: TierDef[] = [
  { tier: 1, name: "Kitten Bean", color: "#93C5FD", radius: 16, points: 1 },
  { tier: 2, name: "Tiny Pink Paw", color: "#F9A8D4", radius: 20, points: 3 },
  { tier: 3, name: "Calico Paw", color: "#FDE68A", radius: 25, points: 6 },
  { tier: 4, name: "Golden Lemon Paw", color: "#FDE047", radius: 31, points: 10 },
  { tier: 5, name: "Peach Ginger Paw", color: "#FB923C", radius: 37, points: 15 },
  { tier: 6, name: "Purple Dusk Paw", color: "#C084FC", radius: 43, points: 21 },
  { tier: 7, name: "Cheetah Spot Paw", color: "#F59E0B", radius: 50, points: 28 },
  { tier: 8, name: "Red Panda Paw", color: "#EF4444", radius: 57, points: 36 },
  { tier: 9, name: "Panther Paw", color: "#1E293B", radius: 64, points: 45 },
  { tier: 10, name: "Lion Paw", color: "#D97706", radius: 72, points: 55 },
  { tier: 11, name: "Mega Tiger Paw", color: "#EA580C", radius: 80, points: 66 },
];

const GRAVITY = 600;
const DAMPING = 0.99;
const RESTITUTION = 0.3;
const FRICTION = 0.85;

let _idCounter = 0;

export class PawsMergeEngine {
  paws: Paw[] = [];
  containerWidth: number = 300;
  containerHeight: number = 500;
  currentPawTier: PawTier = 1;
  nextQueue: PawTier[] = [1, 1, 2];
  dropX: number = 150;
  state: GameState = "aiming";
  score: number = 0;
  highScore: number = 0;
  dusterUses: number = 2;
  undoStack: { paws: Paw[]; score: number; queue: PawTier[] }[] = [];
  warningLineY: number = 100;
  overflowTimer: number | null = null;
  maxTierReached: PawTier = 1;
  mergeChainCount: number = 0;

  constructor() {
    this.highScore = Number(localStorage.getItem("paws-merge-highscore") || 0);
  }

  startGame(): void {
    this.paws = [];
    this.score = 0;
    this.dusterUses = 2;
    this.undoStack = [];
    this.currentPawTier = 1;
    this.nextQueue = [1, 1, 2];
    this.dropX = this.containerWidth / 2;
    this.state = "aiming";
    this.overflowTimer = null;
    this.maxTierReached = 1;
    this.mergeChainCount = 0;
  }

  setDropX(x: number): void {
    const tier = this.currentPawTier;
    const radius = TIERS[tier - 1].radius;
    this.dropX = Math.max(radius + 4, Math.min(this.containerWidth - radius - 4, x));
  }

  drop(): void {
    if (this.state !== "aiming") return;

    // Save state for undo
    this.undoStack.push({
      paws: this.paws.map((p) => ({ ...p })),
      score: this.score,
      queue: [...this.nextQueue],
    });
    if (this.undoStack.length > 5) this.undoStack.shift();

    const tier = this.currentPawTier;
    const def = TIERS[tier - 1];
    const paw: Paw = {
      id: `paw_${++_idCounter}`,
      tier,
      x: this.dropX,
      y: def.radius + 5,
      vx: 0,
      vy: 0,
      radius: def.radius,
      color: def.color,
      name: def.name,
      isResting: false,
      merged: false,
    };
    this.paws.push(paw);
    this.score += def.points;

    // Advance queue
    this.currentPawTier = this.nextQueue.shift()!;
    this.nextQueue.push(this.getNextPawTier());

    this.state = "dropping";
    this.mergeChainCount = 0;
  }

  update(deltaTime: number): void {
    if (this.state === "gameover") return;
    const dt = Math.min(deltaTime, 1 / 30); // clamp to prevent physics explosion

    // Apply gravity and update positions
    for (const paw of this.paws) {
      if (paw.merged) continue;
      paw.vy += GRAVITY * dt;
      paw.vx *= Math.pow(DAMPING, dt * 60);
      paw.vy *= Math.pow(DAMPING, dt * 60);
      paw.x += paw.vx * dt;
      paw.y += paw.vy * dt;

      // Floor collision
      const floorY = this.containerHeight - paw.radius;
      if (paw.y > floorY) {
        paw.y = floorY;
        paw.vy *= -RESTITUTION;
        paw.vx *= FRICTION;
        if (Math.abs(paw.vy) < 20) paw.vy = 0;
        paw.isResting = Math.abs(paw.vx) < 5 && Math.abs(paw.vy) < 5;
      }

      // Wall collisions
      if (paw.x - paw.radius < 0) {
        paw.x = paw.radius;
        paw.vx *= -RESTITUTION;
      }
      if (paw.x + paw.radius > this.containerWidth) {
        paw.x = this.containerWidth - paw.radius;
        paw.vx *= -RESTITUTION;
      }
    }

    // Circle-circle collision resolution
    for (let i = 0; i < this.paws.length; i++) {
      for (let j = i + 1; j < this.paws.length; j++) {
        const a = this.paws[i];
        const b = this.paws[j];
        if (a.merged || b.merged) continue;

        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const minDist = a.radius + b.radius;

        if (dist < minDist && dist > 0) {
          const overlap = (minDist - dist) / 2;
          const nx = dx / dist;
          const ny = dy / dist;

          // Push apart
          a.x -= nx * overlap;
          a.y -= ny * overlap;
          b.x += nx * overlap;
          b.y += ny * overlap;

          // Bounce velocities
          const rvx = b.vx - a.vx;
          const rvy = b.vy - a.vy;
          const velAlongNormal = rvx * nx + rvy * ny;
          if (velAlongNormal < 0) {
            const impulse = -(1 + RESTITUTION) * velAlongNormal / 2;
            a.vx -= impulse * nx;
            a.vy -= impulse * ny;
            b.vx += impulse * nx;
            b.vy += impulse * ny;
          }

          // Friction when resting
          if (a.isResting || b.isResting) {
            a.vx *= FRICTION;
            b.vx *= FRICTION;
          }
        }
      }
    }

    // Check merges
    this.checkMerges();

    // Remove merged paws
    this.paws = this.paws.filter((p) => !p.merged);

    // State transitions
    if (this.state === "dropping") {
      const allResting = this.paws.every((p) => p.isResting || Math.abs(p.vy) < 15);
      if (allResting || this.paws.length === 0) {
        this.state = "aiming";
      }
    }

    // Check game over
    this.checkGameOver();
  }

  checkMerges(): void {
    const toMerge: [Paw, Paw][] = [];
    const mergedSet = new Set<string>();

    for (let i = 0; i < this.paws.length; i++) {
      for (let j = i + 1; j < this.paws.length; j++) {
        const a = this.paws[i];
        const b = this.paws[j];
        if (a.merged || b.merged) continue;
        if (a.tier !== b.tier) continue;
        if (a.tier >= 11) continue; // max tier

        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        // Threshold must be >= collision distance (a.radius + b.radius)
        // because the collision resolver pushes paws to exactly that distance.
        // A small tolerance ensures merges trigger when paws are touching.
        const threshold = a.radius + b.radius + 2;

        if (dist < threshold) {
          if (!mergedSet.has(a.id) && !mergedSet.has(b.id)) {
            toMerge.push([a, b]);
            mergedSet.add(a.id);
            mergedSet.add(b.id);
          }
        }
      }
    }

    for (const [a, b] of toMerge) {
      a.merged = true;
      b.merged = true;
      const newTier = (a.tier + 1) as PawTier;
      const def = TIERS[newTier - 1];
      const newPaw: Paw = {
        id: `paw_${++_idCounter}`,
        tier: newTier,
        x: (a.x + b.x) / 2,
        y: (a.y + b.y) / 2,
        vx: 0,
        vy: -80, // slight upward pop
        radius: def.radius,
        color: def.color,
        name: def.name,
        isResting: false,
        merged: false,
      };
      this.paws.push(newPaw);
      this.score += def.points;
      this.mergeChainCount++;
      if (newTier > this.maxTierReached) {
        this.maxTierReached = newTier;
      }
    }
  }

  checkGameOver(): boolean {
    if (this.state === "gameover") return true;

    const anyOverflow = this.paws.some(
      (p) => p.y - p.radius < this.warningLineY,
    );

    if (anyOverflow) {
      if (this.overflowTimer === null) {
        this.overflowTimer = Date.now();
      }
      const elapsed = (Date.now() - this.overflowTimer) / 1000;
      if (elapsed > 3) {
        this.state = "gameover";
        if (this.score > this.highScore) {
          this.highScore = this.score;
          localStorage.setItem("paws-merge-highscore", String(this.highScore));
        }
        return true;
      }
    } else {
      this.overflowTimer = null;
    }
    return false;
  }

  useDuster(pawId: string): void {
    if (this.dusterUses <= 0) return;
    const paw = this.paws.find((p) => p.id === pawId);
    if (!paw) return;
    paw.merged = true;
    this.paws = this.paws.filter((p) => !p.merged);
    this.dusterUses--;
  }

  undo(): void {
    const prev = this.undoStack.pop();
    if (!prev) return;
    this.paws = prev.paws;
    this.score = prev.score;
    this.nextQueue = prev.queue;
    this.state = "aiming";
  }

  getNextPawTier(): PawTier {
    // Scale with current max tier — higher tiers unlocked → bigger drops
    const maxTier = this.maxTierReached;
    const maxDropTier = Math.min(Math.floor(maxTier * 0.6) + 1, 5);
    const tier = Math.floor(Math.random() * maxDropTier) + 1;
    return tier as PawTier;
  }

  getState(): GameState {
    return this.state;
  }

  getPaws(): Paw[] {
    return this.paws;
  }

  getScore(): number {
    return this.score;
  }

  getOverflowProgress(): number {
    if (this.overflowTimer === null) return 0;
    return Math.min(1, (Date.now() - this.overflowTimer) / 3000);
  }
}