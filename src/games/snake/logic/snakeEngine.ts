// =============================================
// SnakeGame — Pure logic engine (no UI)
// =============================================

export interface Point {
  x: number;
  y: number;
}

export type Direction = "up" | "down" | "left" | "right";

export interface SnakeState {
  snake: Point[];
  food: Point;
  direction: Direction;
  isGameOver: boolean;
}

const OPPOSITE: Record<Direction, Direction> = {
  up: "down",
  down: "up",
  left: "right",
  right: "left",
};

const DIRECTION_VECTORS: Record<Direction, Point> = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};

const POINTS_PER_FOOD = 10;

export class SnakeGame {
  readonly width: number;
  readonly height: number;

  private onScoreChange: (points: number) => void;
  private onGameOver: (score: number) => void;

  private _snake: Point[] = [];
  private _food: Point = { x: 0, y: 0 };
  private _direction: Direction = "right";
  private _isGameOver: boolean = false;
  private _score: number = 0;
  private _started: boolean = false;

  constructor(
    width: number,
    height: number,
    onScoreChange: (points: number) => void,
    onGameOver: (score: number) => void
  ) {
    this.width = width;
    this.height = height;
    this.onScoreChange = onScoreChange;
    this.onGameOver = onGameOver;
  }

  // =============================================
  // Getters — return defensive copies to prevent external mutation
  // =============================================

  get snake(): Point[] {
    return this._snake.map((p) => ({ ...p }));
  }

  get food(): Point {
    return { ...this._food };
  }

  get direction(): Direction {
    return this._direction;
  }

  get isGameOver(): boolean {
    return this._isGameOver;
  }

  get score(): number {
    return this._score;
  }

  get state(): SnakeState {
    return {
      snake: this.snake,
      food: this.food,
      direction: this._direction,
      isGameOver: this._isGameOver,
    };
  }

  // =============================================
  // Public API
  // =============================================

  /**
   * Initializes the snake at the center, places the first food, and resets state.
   * Can be called to restart after a game over.
   */
  start(): void {
    const cx = Math.floor(this.width / 2);
    const cy = Math.floor(this.height / 2);

    this._snake = [
      { x: cx, y: cy },
      { x: cx - 1, y: cy },
      { x: cx - 2, y: cy },
    ];
    this._direction = "right";
    this._isGameOver = false;
    this._score = 0;
    this._started = true;
    this._placeFood();
  }

  /**
   * Advances the game one step.
   * Moves the snake, checks wall/self collisions, checks food consumption.
   */
  tick(): void {
    if (!this._started || this._isGameOver) return;

    const head = this._snake[0];
    const vec = DIRECTION_VECTORS[this._direction];
    const newHead: Point = { x: head.x + vec.x, y: head.y + vec.y };

    // Wall collision
    if (
      newHead.x < 0 ||
      newHead.x >= this.width ||
      newHead.y < 0 ||
      newHead.y >= this.height
    ) {
      this._endGame();
      return;
    }

    // Self collision (exclude the tail — it will move away unless food is eaten)
    const willEatFood = newHead.x === this._food.x && newHead.y === this._food.y;
    const bodyToCheck = willEatFood
      ? this._snake // tail stays if eating
      : this._snake.slice(0, -1); // tail moves

    if (bodyToCheck.some((seg) => seg.x === newHead.x && seg.y === newHead.y)) {
      this._endGame();
      return;
    }

    // Move
    this._snake.unshift(newHead);

    if (willEatFood) {
      this._score += POINTS_PER_FOOD;
      this.onScoreChange(POINTS_PER_FOOD);
      this._placeFood();
    } else {
      this._snake.pop();
    }
  }

  /**
   * Changes direction. Ignores 180-degree reversals to prevent instant death.
   */
  changeDirection(newDir: Direction): void {
    if (!this._started || this._isGameOver) return;
    if (OPPOSITE[this._direction] === newDir) return;
    this._direction = newDir;
  }

  // =============================================
  // Private helpers
  // =============================================

  /**
   * Places food at a random cell not occupied by the snake.
   */
  private _placeFood(): void {
    const occupied = new Set(this._snake.map((p) => `${p.x},${p.y}`));
    const available: Point[] = [];

    for (let x = 0; x < this.width; x++) {
      for (let y = 0; y < this.height; y++) {
        if (!occupied.has(`${x},${y}`)) {
          available.push({ x, y });
        }
      }
    }

    if (available.length === 0) {
      // Board is full — player has won; treat as game over
      this._endGame();
      return;
    }

    const pick = available[Math.floor(Math.random() * available.length)];
    this._food = { ...pick };
  }

  private _endGame(): void {
    this._isGameOver = true;
    this.onGameOver(this._score);
  }
}