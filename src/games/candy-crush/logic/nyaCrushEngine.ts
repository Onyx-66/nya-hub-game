// =============================================
// NyaCrushEngine — Pure TypeScript match-3 engine.
// 8x8 grid, swap adjacent candies, cascade matches, special candies.
// Specials: striped (row+col clear), bomb (3×3 explosion), rainbow (clear all of type)
// =============================================

export type CandyType = 'red' | 'orange' | 'yellow' | 'green' | 'blue' | 'purple';
export type SpecialType = 'striped' | 'rainbow' | 'bomb';

export interface Candy {
  type: CandyType;
  id: string;
  isSpecial: boolean;
  specialType?: SpecialType;
}

export interface Position { row: number; col: number; }
export interface SwapResult { valid: boolean; matches: Position[][]; cascaded: boolean; }
export interface ClearedCandy { row: number; col: number; type: CandyType; }

export type NyaCrushState = 'idle' | 'playing' | 'swapping' | 'gameover' | 'levelcomplete';

const CANDY_TYPES: CandyType[] = ['red', 'orange', 'yellow', 'green', 'blue', 'purple'];

const LEVEL_CONFIGS = [
  { targetScore: 1000, maxMoves: 30 },
  { targetScore: 2000, maxMoves: 25 },
  { targetScore: 3000, maxMoves: 25 },
  { targetScore: 5000, maxMoves: 20 },
  { targetScore: 8000, maxMoves: 20 },
];

function randomId(): string {
  return `candy_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function randomCandyType(): CandyType {
  return CANDY_TYPES[Math.floor(Math.random() * CANDY_TYPES.length)];
}

function createCandy(type?: CandyType): Candy {
  return { type: type ?? randomCandyType(), id: randomId(), isSpecial: false };
}

export class NyaCrushEngine {
  readonly ROWS = 8;
  readonly COLS = 8;
  board: (Candy | null)[][];
  score: number;
  moves: number;
  maxMoves: number;
  state: NyaCrushState;
  selectedCell: Position | null;
  targetScore: number;
  level: number;

  onScoreChange: ((score: number) => void) | null = null;
  onBoardUpdate: (() => void) | null = null;
  onGameOver: ((finalScore: number) => void) | null = null;
  onLevelComplete: ((score: number, stars: number) => void) | null = null;
  onCandiesCleared: ((cleared: ClearedCandy[]) => void) | null = null;

  constructor(level: number = 1) {
    this.level = level;
    const config = LEVEL_CONFIGS[Math.min(level - 1, LEVEL_CONFIGS.length - 1)];
    this.maxMoves = config.maxMoves;
    this.targetScore = config.targetScore;
    this.board = this.createEmptyBoard();
    this.score = 0;
    this.moves = this.maxMoves;
    this.state = 'idle';
    this.selectedCell = null;
  }

  private createEmptyBoard(): (Candy | null)[][] {
    return Array.from({ length: this.ROWS }, () =>
      Array.from({ length: this.COLS }, () => null),
    );
  }

  start(): void {
    this.state = 'playing';
    this.score = 0;
    this.moves = this.maxMoves;
    this.selectedCell = null;
    this.generateBoard();
    this.onScoreChange?.(this.score);
    this.onBoardUpdate?.();
  }

  reset(): void {
    this.start();
  }

  private generateBoard(): void {
    this.board = this.createEmptyBoard();
    for (let r = 0; r < this.ROWS; r++) {
      for (let c = 0; c < this.COLS; c++) {
        let candy: Candy;
        let attempts = 0;
        do {
          candy = createCandy();
          attempts++;
        } while (this.wouldCreateMatch(r, c, candy.type) && attempts < 20);
        this.board[r][c] = candy;
      }
    }
    if (!this.hasPossibleMoves()) {
      this.generateBoard();
    }
  }

  private wouldCreateMatch(row: number, col: number, type: CandyType): boolean {
    if (col >= 2 && this.board[row][col - 1]?.type === type && this.board[row][col - 2]?.type === type) return true;
    if (row >= 2 && this.board[row - 1][col]?.type === type && this.board[row - 2][col]?.type === type) return true;
    return false;
  }

  hasPossibleMoves(): boolean {
    for (let r = 0; r < this.ROWS; r++) {
      for (let c = 0; c < this.COLS; c++) {
        if (c < this.COLS - 1) {
          this.swapRaw(r, c, r, c + 1);
          const has = this.findMatches().length > 0;
          this.swapRaw(r, c, r, c + 1);
          if (has) return true;
        }
        if (r < this.ROWS - 1) {
          this.swapRaw(r, c, r + 1, c);
          const has = this.findMatches().length > 0;
          this.swapRaw(r, c, r + 1, c);
          if (has) return true;
        }
      }
    }
    return false;
  }

  private swapRaw(r1: number, c1: number, r2: number, c2: number): void {
    const temp = this.board[r1][c1];
    this.board[r1][c1] = this.board[r2][c2];
    this.board[r2][c2] = temp;
  }

  selectCell(row: number, col: number): void {
    if (this.state !== 'playing') return;

    if (!this.selectedCell) {
      this.selectedCell = { row, col };
      this.onBoardUpdate?.();
      return;
    }

    if (this.selectedCell.row === row && this.selectedCell.col === col) {
      this.selectedCell = null;
      this.onBoardUpdate?.();
      return;
    }

    if (this.isAdjacent(this.selectedCell, { row, col })) {
      this.swapCells(this.selectedCell, { row, col });
      this.selectedCell = null;
      return;
    }

    this.selectedCell = { row, col };
    this.onBoardUpdate?.();
  }

  swapCells(pos1: Position, pos2: Position): SwapResult {
    if (this.state !== 'playing' && this.state !== 'swapping') {
      return { valid: false, matches: [], cascaded: false };
    }

    this.state = 'swapping';
    this.swapRaw(pos1.row, pos1.col, pos2.row, pos2.col);

    const matches = this.findMatches();

    if (matches.length === 0) {
      this.swapRaw(pos1.row, pos1.col, pos2.row, pos2.col);
      this.state = 'playing';
      this.onBoardUpdate?.();
      return { valid: false, matches: [], cascaded: false };
    }

    const cascades = this.processBoard();
    this.moves--;

    if (this.score >= this.targetScore) {
      const stars = this.getStars();
      this.state = 'levelcomplete';
      this.onLevelComplete?.(this.score, stars);
    } else if (this.moves <= 0) {
      this.state = 'gameover';
      this.onGameOver?.(this.score);
    } else {
      this.state = 'playing';
    }

    this.onBoardUpdate?.();
    return { valid: true, matches, cascaded: cascades > 1 };
  }

  findMatches(): Position[][] {
    const matches: Position[][] = [];

    // Horizontal matches
    for (let r = 0; r < this.ROWS; r++) {
      let c = 0;
      while (c < this.COLS) {
        const candy = this.board[r][c];
        if (!candy) { c++; continue; }
        let end = c + 1;
        while (end < this.COLS && this.board[r][end]?.type === candy.type) end++;
        if (end - c >= 3) {
          const group: Position[] = [];
          for (let i = c; i < end; i++) group.push({ row: r, col: i });
          matches.push(group);
        }
        c = end;
      }
    }

    // Vertical matches
    for (let c = 0; c < this.COLS; c++) {
      let r = 0;
      while (r < this.ROWS) {
        const candy = this.board[r][c];
        if (!candy) { r++; continue; }
        let end = r + 1;
        while (end < this.ROWS && this.board[end][c]?.type === candy.type) end++;
        if (end - r >= 3) {
          const group: Position[] = [];
          for (let i = r; i < end; i++) group.push({ row: i, col: c });
          matches.push(group);
        }
        r = end;
      }
    }

    return matches;
  }

  removeMatches(matches: Position[][]): number {
    const toRemove = new Set<string>();
    const toCreateSpecial = new Map<string, SpecialType>();

    // Build position → orientation map to detect L/T intersections
    const posOrientations = new Map<string, Set<'h' | 'v'>>();
    for (const group of matches) {
      if (group.length < 2) continue;
      const isHorizontal = group[0].row === group[1].row;
      for (const pos of group) {
        const key = `${pos.row},${pos.col}`;
        if (!posOrientations.has(key)) posOrientations.set(key, new Set());
        posOrientations.get(key)!.add(isHorizontal ? 'h' : 'v');
      }
    }

    // Find intersection cells (in both horizontal and vertical matches = L/T shape)
    const intersections = new Set<string>();
    for (const [key, orientations] of posOrientations) {
      if (orientations.size >= 2) intersections.add(key);
    }

    // Create specials based on match shape
    for (const group of matches) {
      const len = group.length;
      const intersectionPos = group.find(pos => intersections.has(`${pos.row},${pos.col}`));

      if (intersectionPos && len >= 3) {
        // L/T shape → bomb at intersection
        toCreateSpecial.set(`${intersectionPos.row},${intersectionPos.col}`, 'bomb');
      } else if (len >= 5) {
        const center = group[Math.floor(len / 2)];
        toCreateSpecial.set(`${center.row},${center.col}`, 'rainbow');
      } else if (len >= 4) {
        const center = group[Math.floor(len / 2)];
        toCreateSpecial.set(`${center.row},${center.col}`, 'striped');
      }

      for (const pos of group) toRemove.add(`${pos.row},${pos.col}`);
    }

    // Chain reaction: process specials already on the board
    const processed = new Set<string>();
    const queue = [...toRemove];
    while (queue.length > 0) {
      const key = queue.shift()!;
      if (processed.has(key)) continue;
      processed.add(key);
      const [r, c] = key.split(',').map(Number);
      const candy = this.board[r][c];
      if (candy?.isSpecial) {
        if (candy.specialType === 'striped') {
          // Clear entire row + column
          for (let i = 0; i < this.COLS; i++) {
            const k = `${r},${i}`;
            if (!toRemove.has(k)) { toRemove.add(k); queue.push(k); }
          }
          for (let i = 0; i < this.ROWS; i++) {
            const k = `${i},${c}`;
            if (!toRemove.has(k)) { toRemove.add(k); queue.push(k); }
          }
        } else if (candy.specialType === 'bomb') {
          // Explode 3×3 area
          for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
              const nr = r + dr;
              const nc = c + dc;
              if (nr >= 0 && nr < this.ROWS && nc >= 0 && nc < this.COLS) {
                const k = `${nr},${nc}`;
                if (!toRemove.has(k)) { toRemove.add(k); queue.push(k); }
              }
            }
          }
        } else if (candy.specialType === 'rainbow') {
          // Clear all of the same type
          const targetType = candy.type;
          for (let rr = 0; rr < this.ROWS; rr++) {
            for (let cc = 0; cc < this.COLS; cc++) {
              if (this.board[rr][cc]?.type === targetType) {
                const k = `${rr},${cc}`;
                if (!toRemove.has(k)) { toRemove.add(k); queue.push(k); }
              }
            }
          }
        }
      }
    }

    // Actual removal + collect cleared candies for particle effects
    const clearedCandies: ClearedCandy[] = [];
    let count = 0;
    for (const key of toRemove) {
      const [r, c] = key.split(',').map(Number);
      if (toCreateSpecial.has(key)) {
        const specialType = toCreateSpecial.get(key)!;
        const oldType = this.board[r][c]?.type ?? randomCandyType();
        this.board[r][c] = { type: oldType, id: randomId(), isSpecial: true, specialType };
      } else {
        const candy = this.board[r][c];
        if (candy) clearedCandies.push({ row: r, col: c, type: candy.type });
        this.board[r][c] = null;
        count++;
      }
    }

    if (clearedCandies.length > 0) {
      this.onCandiesCleared?.(clearedCandies);
    }

    return count;
  }

  applyGravity(): boolean {
    let moved = false;
    for (let c = 0; c < this.COLS; c++) {
      let writeRow = this.ROWS - 1;
      for (let r = this.ROWS - 1; r >= 0; r--) {
        if (this.board[r][c] !== null) {
          if (r !== writeRow) {
            this.board[writeRow][c] = this.board[r][c];
            this.board[r][c] = null;
            moved = true;
          }
          writeRow--;
        }
      }
    }
    return moved;
  }

  fillEmpty(): void {
    for (let r = 0; r < this.ROWS; r++) {
      for (let c = 0; c < this.COLS; c++) {
        if (this.board[r][c] === null) {
          this.board[r][c] = createCandy();
        }
      }
    }
  }

  processBoard(): number {
    let cascades = 0;
    let matches = this.findMatches();
    while (matches.length > 0) {
      const cascadeLevel = cascades;
      let cascadeScore = 0;
      for (const group of matches) {
        cascadeScore += this.getScoreForMatches(group.length, cascadeLevel);
      }
      this.score += cascadeScore;
      this.onScoreChange?.(this.score);
      this.removeMatches(matches);
      this.applyGravity();
      this.fillEmpty();
      cascades++;
      matches = this.findMatches();
    }
    return cascades;
  }

  isAdjacent(pos1: Position, pos2: Position): boolean {
    const dr = Math.abs(pos1.row - pos2.row);
    const dc = Math.abs(pos1.col - pos2.col);
    return (dr === 1 && dc === 0) || (dr === 0 && dc === 1);
  }

  getScoreForMatches(matchCount: number, cascadeLevel: number): number {
    if (matchCount >= 5) return 150 * (cascadeLevel + 1);
    if (matchCount >= 4) return 60 * (cascadeLevel + 1);
    return 30 * (cascadeLevel + 1);
  }

  getStars(): number {
    if (this.score >= this.targetScore * 2) return 3;
    if (this.score >= this.targetScore * 1.5) return 2;
    if (this.score >= this.targetScore) return 1;
    return 0;
  }
}

export default NyaCrushEngine;