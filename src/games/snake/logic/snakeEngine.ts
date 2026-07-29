// =============================================
// SnakeGameEngine — Pure logic engine (no UI)
// =============================================

export type Direction = "UP" | "DOWN" | "LEFT" | "RIGHT";
export type GameState = "idle" | "playing" | "paused" | "gameover";

export interface SnakeSegment {
  x: number;
  y: number;
}

export interface SnakeGameConfig {
  gridWidth: number; // Number of cells horizontally (default 20)
  gridHeight: number; // Number of cells vertically (default 20)
  initialSpeed: number; // Milliseconds per tick (default 150)
  speedIncrement: number; // Speed increase per food eaten (default 2ms)
  minSpeed: number; // Fastest possible speed (default 80ms)
}

// =============================================
// Constants
// =============================================

const DEFAULT_CONFIG: SnakeGameConfig = {
  gridWidth: 20,
  gridHeight: 20,
  initialSpeed: 150,
  speedIncrement: 2,
  minSpeed: 80,
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
  // PUBLIC PROPERTIES (readonly) — gridWidth/gridHeight are assigned in ctor;
  // the rest are exposed via getters below backed by private mutable state.
  readonly gridWidth: number;
  readonly gridHeight: number;

  // CALLBACKS (set these from outside)
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
  private _bufferedDirection: Direction | null = null;

  private _config: SnakeGameConfig;

  // CONSTRUCTOR
  constructor(config?: Partial<SnakeGameConfig>) {
    this._config = { ...DEFAULT_CONFIG, ...config };
    this.gridWidth = this._config.gridWidth;
    this.gridHeight = this._config.gridHeight;
    this._speed = this._config.initialSpeed;

    // Initialize readonly refs to point at mutable storage — they stay in sync
    // because getters below return the live values. We expose them as readonly
    // arrays/objects but internally they reference the mutable fields.
    // (See getter implementations below.)
    // Note: `readonly` on class fields is a compile-time constraint; we bind
    // these to the backing fields via getters in the class body.
  }

  // ——— Getters that back the readonly public properties ———
  get snake(): SnakeSegment[] {
    return this._snake;
  }
  get food(): SnakeSegment {
    return this._food;
  }
  get direction(): Direction {
    return this._direction;
  }
  get state(): GameState {
    return this._state;
  }
  get score(): number {
    return this._score;
  }
  get level(): number {
    return this._level;
  }
  get speed(): number {
    return this._speed;
  }

  // =============================================
  // PUBLIC METHODS
  // =============================================

  /** Begins game, places initial food. */
  start(): void {
    const cx = Math.floor(this.gridWidth / 2);
    const cy = Math.floor(this.gridHeight / 2);

    // Snake starts length 3 in the center, moving RIGHT.
    this._snake = [
      { x: cx, y: cy },
      { x: cx - 1, y: cy },
      { x: cx - 2, y: cy },
    ];

    this._direction = "RIGHT";
    this._bufferedDirection = null;
    this._score = 0;
    this._level = 1;
    this._foodEaten = 0;
    this._speed = this._config.initialSpeed;
    this._state = "playing";

    this.placeFood();
  }

  /** Toggles pause state. */
  pause(): void {
    if (this._state === "playing") {
      this._state = "paused";
    }
  }

  /** Resumes from pause. */
  resume(): void {
    if (this._state === "paused") {
      this._state = "playing";
    }
  }

  /** Full reset to initial state. */
  reset(): void {
    this._snake = [];
    this._food = { x: 0, y: 0 };
    this._direction = "RIGHT";
    this._bufferedDirection = null;
    this._score = 0;
    this._level = 1;
    this._foodEaten = 0;
    this._speed = this._config.initialSpeed;
    this._state = "idle";
  }

  /**
   * Advances game by one step.
   * Returns flags describing what happened this tick.
   */
  tick(): { moved: boolean; ate: boolean; died: boolean } {
    if (this._state !== "playing") {
      return { moved: false, ate: false, died: false };
    }

    // Apply buffered direction at the start of the tick.
    if (this._bufferedDirection !== null) {
      if (this.isValidDirection(this._bufferedDirection)) {
        this._direction = this._bufferedDirection;
      }
      this._bufferedDirection = null;
    }

    // Compute new head position.
    const head = this._snake[0];
    const vec = DIRECTION_VECTORS[this._direction];
    const newHead: SnakeSegment = { x: head.x + vec.x, y: head.y + vec.y };

    // Check collision before moving.
    if (this.checkCollision()) {
      this._endGame();
      return { moved: false, ate: false, died: true };
    }

    // Check if food will be eaten.
    const willEat = newHead.x === this._food.x && newHead.y === this._food.y;

    this.moveSnake();

    if (willEat) {
      // Score scales with current level.
      const points = BASE_FOOD_POINTS * this._level;
      this._score += points;
      this._foodEaten += 1;

      // Speed up (clamped to minimum).
      this._speed = Math.max(
        this._config.minSpeed,
        this._speed - this._config.speedIncrement,
      );

      // Level up every FOODS_PER_LEVEL food eaten.
      const newLevel = Math.floor(this._foodEaten / FOODS_PER_LEVEL) + 1;
      if (newLevel > this._level) {
        this._level = newLevel;
        if (this.onLevelUp) this.onLevelUp(this._level);
      }

      this.placeFood();

      if (this.onFoodEaten) this.onFoodEaten(this._score, this._level);

      return { moved: true, ate: true, died: false };
    }

    return { moved: true, ate: false, died: false };
  }

  /**
   * Queues a direction change. Returns false if the direction is a 180°
   * reversal of the current (committed) direction. The change is applied
   * on the next tick to prevent fast-turn exploits.
   */
  changeDirection(newDir: Direction): boolean {
    if (this._state !== "playing") return false;
    if (!this.isValidDirection(newDir)) return false;

    this._bufferedDirection = newDir;
    return true;
  }

  /** Returns snake[0]. */
  getHead(): SnakeSegment {
    return this._snake[0];
  }

  getState(): GameState {
    return this._state;
  }

  getScore(): number {
    return this._score;
  }

  /** Increases every 5 food eaten. */
  getLevel(): number {
    return this._level;
  }

  /** Current tick interval in ms. */
  getSpeed(): number {
    return this._speed;
  }

  // =============================================
  // PRIVATE METHODS
  // =============================================

  /** Places food on a random empty cell. */
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
      // Board full — treat as game over (victory).
      this._endGame();
      return;
    }

    const pick = available[Math.floor(Math.random() * available.length)];
    this._food = { ...pick };
  }

  /** Returns true on wall or self collision. */
  private checkCollision(): boolean {
    const head = this._snake[0];
    const vec = DIRECTION_VECTORS[this._direction];
    const newHead: SnakeSegment = { x: head.x + vec.x, y: head.y + vec.y };

    // Wall collision.
    if (
      newHead.x < 0 ||
      newHead.x >= this.gridWidth ||
      newHead.y < 0 ||
      newHead.y >= this.gridHeight
    ) {
      return true;
    }

    // Self collision. The tail will move away unless food is eaten this tick,
    // so exclude it from collision check when not eating.
    const willEat = newHead.x === this._food.x && newHead.y === this._food.y;
    const bodyToCheck = willEat
      ? this._snake // tail stays if eating
      : this._snake.slice(0, -1); // tail moves away

    return bodyToCheck.some(
      (seg) => seg.x === newHead.x && seg.y === newHead.y,
    );
  }

  /** Moves the head forward; grows by 1 segment if food is eaten. */
  private moveSnake(): void {
    const head = this._snake[0];
    const vec = DIRECTION_VECTORS[this._direction];
    const newHead: SnakeSegment = { x: head.x + vec.x, y: head.y + vec.y };

    const willEat = newHead.x === this._food.x && newHead.y === this._food.y;

    this._snake.unshift(newHead);

    if (!willEat) {
      this._snake.pop();
    }
  }

  /** A direction is valid if it is not a 180° reversal of the current direction. */
  private isValidDirection(dir: Direction): boolean {
    return OPPOSITE[this._direction] !== dir;
  }

  /** Ends the game and fires the onGameOver callback. */
  private _endGame(): void {
    this._state = "gameover";
    if (this.onGameOver) this.onGameOver(this._score, this._level);
  }
}

export default SnakeGameEngine;