// =============================================
// BlockBlastEngine — Pure logic for Block Blast.
// 8x8 grid, drag-and-drop blocks, line clearing, combo scoring.
// =============================================

export interface Position {
  row: number;
  col: number;
}

export interface Block {
  id: string;
  shape: number[][];
  color: string;
}

export interface BoardCell {
  filled: boolean;
  color: string | null;
}

export type BlockBlastState = "idle" | "playing" | "gameover";

// ── 12 predefined shapes ──
const SHAPES: number[][][] = [
  [[1]],                      // 1x1 dot
  [[1, 1]],                   // 1x2 horizontal
  [[1], [1]],                 // 2x1 vertical
  [[1, 1], [1, 1]],           // 2x2 square
  [[1, 1, 1]],               // 3x1 horizontal
  [[1], [1], [1]],           // 1x3 vertical
  [[1, 0], [1, 0], [1, 1]],  // L-shape
  [[0, 1], [0, 1], [1, 1]],  // Reverse L
  [[1, 1, 1], [0, 1, 0]],    // T-shape
  [[0, 1, 1], [1, 1, 0]],    // S-shape
  [[1, 1, 0], [0, 1, 1]],    // Z-shape
  [[1, 1, 1], [1, 1, 1]],    // 2x3 rectangle
];

const COLORS = [
  "#FF6B9D",
  "#C084FC",
  "#60A5FA",
  "#34D399",
  "#FBBF24",
  "#F87171",
];

function randomId(): string {
  return `blk_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function randomShape(): number[][] {
  return SHAPES[Math.floor(Math.random() * SHAPES.length)];
}

function randomColor(): string {
  return COLORS[Math.floor(Math.random() * COLORS.length)];
}

function createBlock(): Block {
  return { id: randomId(), shape: randomShape(), color: randomColor() };
}

function createEmptyBoard(rows: number, cols: number): BoardCell[][] {
  return Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => ({ filled: false, color: null })),
  );
}

export class BlockBlastEngine {
  readonly rows: number;
  readonly cols: number;
  board: BoardCell[][];
  availableBlocks: (Block | null)[];
  state: BlockBlastState;
  score: number;
  combo: number;

  onScoreChange: ((score: number, combo: number) => void) | null = null;
  onGameOver: (() => void) | null = null;
  onBoardUpdate: (() => void) | null = null;

  constructor(config: { rows?: number; cols?: number } = {}) {
    this.rows = config.rows ?? 8;
    this.cols = config.cols ?? 8;
    this.board = createEmptyBoard(this.rows, this.cols);
    this.availableBlocks = [null, null, null];
    this.state = "idle";
    this.score = 0;
    this.combo = 0;
  }

  start(): void {
    this.state = "playing";
    this.score = 0;
    this.combo = 0;
    this.board = createEmptyBoard(this.rows, this.cols);
    this.generateBlocks();
    this.onScoreChange?.(this.score, this.combo);
    this.onBoardUpdate?.();
  }

  reset(): void {
    this.start();
  }

  generateBlocks(): void {
    this.availableBlocks = [createBlock(), createBlock(), createBlock()];
  }

  canPlaceBlock(block: Block, position: Position): boolean {
    for (let r = 0; r < block.shape.length; r++) {
      for (let c = 0; c < block.shape[r].length; c++) {
        if (block.shape[r][c] === 0) continue;
        const row = position.row + r;
        const col = position.col + c;
        if (row < 0 || row >= this.rows || col < 0 || col >= this.cols) return false;
        if (this.board[row][col].filled) return false;
      }
    }
    return true;
  }

  canPlaceAnyBlock(): boolean {
    for (const block of this.availableBlocks) {
      if (!block) continue;
      for (let r = 0; r < this.rows; r++) {
        for (let c = 0; c < this.cols; c++) {
          if (this.canPlaceBlock(block, { row: r, col: c })) return true;
        }
      }
    }
    return false;
  }

  placeBlock(blockIndex: number, position: Position): boolean {
    const block = this.availableBlocks[blockIndex];
    if (!block || this.state !== "playing") return false;
    if (!this.canPlaceBlock(block, position)) return false;

    // Place block cells onto board
    for (let r = 0; r < block.shape.length; r++) {
      for (let c = 0; c < block.shape[r].length; c++) {
        if (block.shape[r][c] === 1) {
          this.board[position.row + r][position.col + c] = {
            filled: true,
            color: block.color,
          };
        }
      }
    }

    // Check and clear lines
    const linesCleared = this.checkAndClearLines();

    // Update combo + score
    if (linesCleared > 0) {
      this.combo += 1;
    } else {
      this.combo = 0;
    }
    this.score += this.getClearScore(linesCleared);

    // Generate replacement block (always maintain 3)
    this.availableBlocks[blockIndex] = createBlock();

    this.onScoreChange?.(this.score, this.combo);
    this.onBoardUpdate?.();

    // Check game over
    if (!this.canPlaceAnyBlock()) {
      this.state = "gameover";
      this.onGameOver?.();
    }

    return true;
  }

  checkAndClearLines(): number {
    const rowsToClear: number[] = [];
    const colsToClear: number[] = [];

    for (let r = 0; r < this.rows; r++) {
      if (this.board[r].every((cell) => cell.filled)) rowsToClear.push(r);
    }
    for (let c = 0; c < this.cols; c++) {
      let full = true;
      for (let r = 0; r < this.rows; r++) {
        if (!this.board[r][c].filled) { full = false; break; }
      }
      if (full) colsToClear.push(c);
    }

    const cleared = rowsToClear.length + colsToClear.length;

    for (const r of rowsToClear) {
      for (let c = 0; c < this.cols; c++) {
        this.board[r][c] = { filled: false, color: null };
      }
    }
    for (const c of colsToClear) {
      for (let r = 0; r < this.rows; r++) {
        this.board[r][c] = { filled: false, color: null };
      }
    }

    return cleared;
  }

  getClearScore(linesCleared: number): number {
    const scores = [0, 100, 300, 600, 1000, 1500];
    if (linesCleared >= 6) return 2000;
    return scores[linesCleared] ?? 0;
  }
}

export default BlockBlastEngine;