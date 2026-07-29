// =============================================
// SnakeGameEngine — Pure logic engine (no UI)
// Fixed-timestep tick with direction queue, interpolation
// support, grace window, and progressive speed.
// =============================================

export type Direction = "UP" | "DOWN" | "LEFT" | "RIGHT";
export type GameState = "idle" | "ready" | "playing" | "paused" | "gameover";

export interface SnakeSegment {
  x: number;
  y: number;
}

export interface SnakeGameConfig {
  gridWidth: number;
  gridHeight: number;
  initialSpeed: number;
  speedIncrement: number;
  minSpeed: number;
}

// =============================================
// Constants
// =============================================

const DEFAULT_CONFIG: SnakeGameConfig = {
  gridWidth: 20,
  gridHeight: 20,
  initialSpeed: 180,
  speedIncrement: 2,
  minSpeed: 85,
};

const DIRECTION_VECTORS: Record<Direction, SnakeSegment> = {
  UP: { x: 0, y: -1 },
  DOWN: { x: 0, y: 1 },
  LEFT: { x: -1, y: 0 },
  RIGHT: { x: 1, y: 0 },
};

const OPPOSITE: Record<Direction, Direction> = {
  UP: "DOWN",
  DOWN: "UP",
  LEFT: "RIGHT",
  RIGHT: "LEFT",
};

const FOODS_PER_LEVEL = 5;
const BASE_FOOD_POINTS = 10;

// =============================================
// SnakeGameEngine
// =============================================

export class SnakeGameEngine {
  readonly gridWidth: number;
  readonly gridHeight: number;

  // CALLBACKS
  onFoodEaten: ((score: number, level: number) => void) | null = null;
  onGameOver: ((finalScore: number, level: number) => void) | null = null;
  onLevelUp: ((newLevel: number) => void) | null = null;

  // Private mutable state
  private _snake: SnakeSegment[] = [];
  private _food: SnakeSegment = { x: 0, y: 0 };
  private _direction: Direction = "RIGHT";
  private _state: GameState = "idle";
  private _score: number = 0;
  private _level: number = 1;
  private _speed: number;
  private _foodEaten: number = 0;
  private _directionQueue: Direction[] = [];
  private _config: SnakeGameConfig;

  // Interpolation & animation state
  private _prevTail: SnakeSegment | null = null;
  private _lastTickTime: number = 0;
  private _eatPulseTime: number = 0;
  private _graceTicks: number = 0;
  private _hasTicked: boolean = false;

  constructor(config?: Partial<SnakeGameConfig>) {
    this._config = { ...DEFAULT_CONFIG, ...config };
    this.gridWidth = this._config.gridWidth;
    this.gridHeight = this._config.gridHeight;
    this._speed = this._config.initialSpeed;
  }

  // ——— Getters ———
  get snake(): SnakeSegment[] { return this._snake; }
  get food(): SnakeSegment { return this._food; }
  get direction(): Direction { return this._direction; }
  get state(): GameState { return this._state; }
  get score(): number { return this._score; }
  get level(): number { return this._level; }
  get speed(): number { return this._speed; }

  // =============================================
  // PUBLIC METHODS
  // =============================================

  /** Places snake and food; sets state to "ready" (awaiting countdown). */
  start(): void {
    const cx = Math.floor(this.gridWidth / 2);
    const cy = Math.floor(this.gridHeight / 2);

    this._snake = [
      { x: cx, y: cy },
      { x: cx - 1, y: cy },
      { x: cx - 2, y: cy },
    ];

    this._direction = "RIGHT";
    this._directionQueue = [];
    this._score = 0;
    this._level = 1;
    this._foodEaten = 0;
    this._speed = this._config.initialSpeed;
    this._prevTail = null;
    this._eatPulseTime = 0;
    this._graceTicks = 0;
    this._hasTicked = false;
    this._state = "ready";
    this._lastTickTime = performance.now();

    this.placeFood();
  }

  /** Transitions from "ready" to "playing" after the countdown. */
  beginPlay(): void {
    if (this._state === "ready") {
      this._state = "playing";
      this._lastTickTime = performance.now();
    }
  }

  pause(): void {
    if (this._state === "playing") this._state = "paused";
  }

  resume(): void {
    if (this._state === "paused") {
      this._state = "playing";
      this._lastTickTime = performance.now();
    }
  }

  reset(): void {
    this._snake = [];
    this._food = { x: 0, y: 0 };
    this._direction = "RIGHT";
    this._directionQueue = [];
    this._score = 0;
    this._level = 1;
    this._foodEaten = 0;
    this._speed = this._config.initialSpeed;
    this._prevTail = null;
    this._eatPulseTime = 0;
    this._graceTicks = 0;
    this._hasTicked = false;
    this._state = "idle";
  }

  /**
   * Advances game by one tick. Returns flags describing what happened.
   * The component's setTimeout loop calls this at engine.getSpeed() intervals.
   */
  tick(): { moved: boolean; ate: boolean; died: boolean } {
    if (this._state !== "playing") {
      return { moved: false, ate: false, died: false };
    }

    // Apply first queued direction (allows pre-queued double-turns).
    if (this._directionQueue.length > 0) {
      this._direction = this._directionQueue.shift()!;
    }

    // Compute new head position.
    const head = this._snake[0];
    const vec = DIRECTION_VECTORS[this._direction];
    const newHead: SnakeSegment = { x: head.x + vec.x, y: head.y + vec.y };

    // Check collision (uses grace window).
    if (this.checkCollision(newHead)) {
      this._endGame();
      return { moved: false, ate: false, died: true };
    }

    // Decrement grace after collision check.
    if (this._graceTicks > 0) this._graceTicks--;

    // Check if food will be eaten.
    const willEat = newHead.x === this._food.x && newHead.y === this._food.y;

    // Store prevTail for interpolation (only if tail will be removed).
    if (!willEat && this._snake.length > 0) {
      this._prevTail = { ...this._snake[this._snake.length - 1] };
    } else {
      this._prevTail = null;
    }

    // Move snake.
    this._snake.unshift(newHead);
    if (!willEat) {
      this._snake.pop();
    }

    this._lastTickTime = performance.now();
    this._hasTicked = true;

    if (willEat) {
      const points = BASE_FOOD_POINTS * this._level;
      this._score += points;
      this._foodEaten += 1;

      // Gentle speed increase (clamped to minimum).
      this._speed = Math.max(
        this._config.minSpeed,
        this._speed - this._config.speedIncrement,
      );

      // Level up every FOODS_PER_LEVEL food eaten.
      const newLevel = Math.floor(this._foodEaten / FOODS_PER_LEVEL) + 1;
      if (newLevel > this._level) {
        this._level = newLevel;
        this.onLevelUp?.(this._level);
      }

      // Grace window: next tick is more forgiving.
      this._graceTicks = 1;
      this._eatPulseTime = performance.now();

      this.placeFood();
      this.onFoodEaten?.(this._score, this._level);

      return { moved: true, ate: true, died: false };
    }

    return { moved: true, ate: false, died: false };
  }

  /**
   * Queues a direction change. Uses a max-2 queue so quick double-turns
   * (e.g., UP then LEFT) don't cancel each other. Only blocks the direct
   * reverse of the LAST queued/committed direction.
   */
  changeDirection(newDir: Direction): boolean {
    if (this._state !== "playing" && this._state !== "ready") return false;

    const lastDir =
      this._directionQueue.length > 0
        ? this._directionQueue[this._directionQueue.length - 1]
        : this._direction;

    // Block direct reverse.
    if (OPPOSITE[lastDir] === newDir) return false;
    // No-op: same as last queued/committed direction.
    if (lastDir === newDir) return false;
    // Cap queue at 2 to prevent flooding.
    if (this._directionQueue.length >= 2) return false;

    this._directionQueue.push(newDir);
    return true;
  }

  getHead(): SnakeSegment { return this._snake[0]; }
  getState(): GameState { return this._state; }
  getScore(): number { return this._score; }
  getLevel(): number { return this._level; }
  getSpeed(): number { return this._speed; }
  getPrevTail(): SnakeSegment | null { return this._prevTail; }

  /** Returns 0-1 progress through the current tick, for smooth rendering. */
  getTickProgress(): number {
    if (this._state !== "playing" || !this._hasTicked || this._speed === 0) {
      return 1;
    }
    const elapsed = performance.now() - this._lastTickTime;
    return Math.min(1, Math.max(0, elapsed / this._speed));
  }

  /** Returns 0-1 eat-pulse intensity (fades over ~300ms after eating). */
  getEatPulse(): number {
    if (this._eatPulseTime === 0) return 0;
    const elapsed = performance.now() - this._eatPulseTime;
    const duration = 300;
    if (elapsed >= duration) return 0;
    return 1 - elapsed / duration;
  }

  // =============================================
  // PRIVATE METHODS
  // =============================================

  private placeFood(): void {
    const occupied = new Set(this._snake.map((s) => `${s.x},${s.y}`));
    const available: SnakeSegment[] = [];

    for (let x = 0; x < this.gridWidth; x++) {
      for (let y = 0; y < this.gridHeight; y++) {
        if (!occupied.has(`${x},${y}`)) {
          available.push({ x, y });
        }
      }
    }

    if (available.length === 0) {
      this._endGame();
      return;
    }

    const pick = available[Math.floor(Math.random() * available.length)];
    this._food = { ...pick };
  }

  /**
   * Returns true on wall or self collision.
   * During a grace tick (right after eating), excludes the last 2 segments
   * instead of just the tail, giving the player a brief forgiveness window.
   */
  private checkCollision(newHead: SnakeSegment): boolean {
    // Wall collision (always checked).
    if (
      newHead.x < 0 ||
      newHead.x >= this.gridWidth ||
      newHead.y < 0 ||
      newHead.y >= this.gridHeight
    ) {
      return true;
    }

    // Self collision.
    const willEat = newHead.x === this._food.x && newHead.y === this._food.y;

    let excludeCount: number;
    if (willEat) {
      excludeCount = 0; // Tail stays if eating.
    } else if (this._graceTicks > 0) {
      excludeCount = 2; // Grace: exclude last 2 segments.
    } else {
      excludeCount = 1; // Normal: tail moves away.
    }

    const bodyToCheck =
      excludeCount > 0
        ? this._snake.slice(0, this._snake.length - excludeCount)
        : this._snake;

    return bodyToCheck.some(
      (seg) => seg.x === newHead.x && seg.y === newHead.y,
    );
  }

  private _endGame(): void {
    this._state = "gameover";
    this.onGameOver?.(this._score, this._level);
  }
}

export default SnakeGameEngine;