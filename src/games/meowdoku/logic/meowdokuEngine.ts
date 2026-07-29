// =============================================
// MeowdokuEngine — Sudoku logic with cat-themed flavor.
// =============================================

export type Grid = number[][];
export type Difficulty = "easy" | "medium" | "hard";

export interface CellPosition {
  row: number;
  col: number;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function isValidPlacement(grid: Grid, row: number, col: number, num: number): boolean {
  for (let i = 0; i < 9; i++) {
    if (grid[row][i] === num) return false;
    if (grid[i][col] === num) return false;
  }
  const boxRow = Math.floor(row / 3) * 3;
  const boxCol = Math.floor(col / 3) * 3;
  for (let r = boxRow; r < boxRow + 3; r++) {
    for (let c = boxCol; c < boxCol + 3; c++) {
      if (grid[r][c] === num) return false;
    }
  }
  return true;
}

function solve(grid: Grid): boolean {
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (grid[r][c] === 0) {
        const nums = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]);
        for (const n of nums) {
          if (isValidPlacement(grid, r, c, n)) {
            grid[r][c] = n;
            if (solve(grid)) return true;
            grid[r][c] = 0;
          }
        }
        return false;
      }
    }
  }
  return true;
}

export class MeowdokuEngine {
  solution: Grid;
  puzzle: Grid;
  given: boolean[][];
  notes: Set<number>[][];
  mistakes: number;
  maxMistakes: number;
  state: "playing" | "won" | "lost";
  difficulty: Difficulty;
  selectedCell: CellPosition | null;
  startTime: number;

  onWin: (() => void) | null = null;
  onMistake: ((remaining: number) => void) | null = null;

  constructor(difficulty: Difficulty = "medium") {
    this.difficulty = difficulty;
    this.solution = this.generateSolution();
    this.puzzle = this.generatePuzzle(difficulty);
    this.given = this.puzzle.map((row) => row.map((v) => v !== 0));
    this.notes = Array.from({ length: 9 }, () =>
      Array.from({ length: 9 }, () => new Set<number>()),
    );
    this.mistakes = 0;
    this.maxMistakes = 3;
    this.state = "playing";
    this.selectedCell = null;
    this.startTime = Date.now();
  }

  generateSolution(): Grid {
    const grid: Grid = Array.from({ length: 9 }, () => Array(9).fill(0));
    // Fill diagonal 3x3 boxes first (they don't conflict)
    for (let box = 0; box < 9; box += 3) {
      const nums = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]);
      let idx = 0;
      for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
          grid[box + r][box + c] = nums[idx++];
        }
      }
    }
    solve(grid);
    return grid;
  }

  generatePuzzle(difficulty: Difficulty): Grid {
    const puzzle = this.solution.map((row) => [...row]);
    const cellsToRemove =
      difficulty === "easy" ? 35 : difficulty === "medium" ? 45 : 55;
    const positions = shuffle(Array.from({ length: 81 }, (_, i) => i));
    for (let i = 0; i < cellsToRemove; i++) {
      const pos = positions[i];
      puzzle[Math.floor(pos / 9)][pos % 9] = 0;
    }
    return puzzle;
  }

  setCell(row: number, col: number, value: number): boolean {
    if (this.state !== "playing") return false;
    if (this.given[row][col]) return false;
    if (value === 0) {
      this.clearCell(row, col);
      return true;
    }
    if (this.solution[row][col] === value) {
      this.puzzle[row][col] = value;
      this.notes[row][col].clear();
      // Clear notes in same row/col/box
      this.clearRelatedNotes(row, col, value);
      if (this.isComplete()) {
        this.state = "won";
        this.onWin?.();
      }
      return true;
    } else {
      this.mistakes++;
      this.onMistake?.(this.maxMistakes - this.mistakes);
      if (this.mistakes >= this.maxMistakes) {
        this.state = "lost";
      }
      return false;
    }
  }

  private clearRelatedNotes(row: number, col: number, value: number): void {
    for (let i = 0; i < 9; i++) {
      this.notes[row][i].delete(value);
      this.notes[i][col].delete(value);
    }
    const boxRow = Math.floor(row / 3) * 3;
    const boxCol = Math.floor(col / 3) * 3;
    for (let r = boxRow; r < boxRow + 3; r++) {
      for (let c = boxCol; c < boxCol + 3; c++) {
        this.notes[r][c].delete(value);
      }
    }
  }

  clearCell(row: number, col: number): void {
    if (this.given[row][col]) return;
    this.puzzle[row][col] = 0;
    this.notes[row][col].clear();
  }

  toggleNote(row: number, col: number, value: number): void {
    if (this.state !== "playing" || this.given[row][col]) return;
    if (this.puzzle[row][col] !== 0) return;
    if (this.notes[row][col].has(value)) {
      this.notes[row][col].delete(value);
    } else {
      this.notes[row][col].add(value);
    }
  }

  isComplete(): boolean {
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (this.puzzle[r][c] !== this.solution[r][c]) return false;
      }
    }
    return true;
  }

  getHint(): CellPosition | null {
    const empty: CellPosition[] = [];
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (this.puzzle[r][c] === 0) empty.push({ row: r, col: c });
      }
    }
    if (empty.length === 0) return null;
    const pos = empty[Math.floor(Math.random() * empty.length)];
    this.puzzle[pos.row][pos.col] = this.solution[pos.row][pos.col];
    this.given[pos.row][pos.col] = true;
    this.notes[pos.row][pos.col].clear();
    if (this.isComplete()) {
      this.state = "won";
      this.onWin?.();
    }
    return pos;
  }

  reset(): void {
    this.puzzle = this.generatePuzzle(this.difficulty);
    this.given = this.puzzle.map((row) => row.map((v) => v !== 0));
    this.notes = Array.from({ length: 9 }, () =>
      Array.from({ length: 9 }, () => new Set<number>()),
    );
    this.mistakes = 0;
    this.state = "playing";
    this.selectedCell = null;
    this.startTime = Date.now();
  }

  getElapsedTime(): number {
    return Math.floor((Date.now() - this.startTime) / 1000);
  }
}

export default MeowdokuEngine;