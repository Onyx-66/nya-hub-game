// =============================================
// Multi-Color Fill Engine — pure TypeScript path puzzle
// Connect colored node pairs by drawing paths through grid cells
// =============================================

export interface Cell {
  row: number;
  col: number;
  filled: boolean;
  color: string | null;
  isNode: boolean;
  nodeColor: string | null;
  isTarget: boolean;
  isWall: boolean;
}

export interface Path {
  color: string;
  startRow: number;
  startCol: number;
  endRow: number;
  endCol: number;
  cells: { row: number; col: number }[];
}

export interface LevelData {
  grid: number[][];
  nodes: { row: number; col: number; color: string; isTarget: boolean }[];
  par: number;
}

const COLORS = [
  "#FF6B9D", // pink
  "#60A5FA", // blue
  "#FBBF24", // yellow
  "#34D399", // green
  "#A78BFA", // purple
  "#F97316", // orange
  "#EF4444", // red
];

function lvl(
  rows: number, cols: number,
  pairs: [number, number, number, number][],
  walls: [number, number][] = [],
  par: number = 0,
): LevelData {
  const grid: number[][] = Array.from({ length: rows }, () => Array(cols).fill(0));
  for (const [r, c] of walls) grid[r][c] = -1;
  const nodes: LevelData["nodes"] = [];
  for (let i = 0; i < pairs.length; i++) {
    const [sr, sc, tr, tc] = pairs[i];
    nodes.push({ row: sr, col: sc, color: COLORS[i], isTarget: false });
    nodes.push({ row: tr, col: tc, color: COLORS[i], isTarget: true });
  }
  return { grid, nodes, par: par || rows * cols - walls.length };
}

const LEVELS: LevelData[] = [
  // 1: 3×3, 2 colors
  lvl(3, 3, [[0, 0, 2, 2], [0, 2, 2, 0]], [], 8),
  // 2: 4×4, 2 colors
  lvl(4, 4, [[0, 0, 3, 3], [0, 3, 3, 0]], [], 14),
  // 3: 4×4, 3 colors
  lvl(4, 4, [[0, 0, 3, 3], [0, 3, 3, 0], [0, 1, 3, 2]], [], 16),
  // 4: 5×5, 3 colors
  lvl(5, 5, [[0, 0, 4, 4], [0, 4, 4, 0], [0, 2, 4, 2]], [], 22),
  // 5: 5×5, 4 colors
  lvl(5, 5, [[0, 0, 4, 4], [0, 4, 4, 0], [0, 2, 4, 2], [2, 0, 2, 4]], [], 24),
  // 6: 5×5, 3 colors, 2 walls
  lvl(5, 5, [[0, 0, 4, 4], [0, 4, 4, 0], [0, 2, 4, 2]], [[2, 2], [2, 3]], 20),
  // 7: 6×5, 4 colors
  lvl(6, 5, [[0, 0, 5, 4], [0, 4, 5, 0], [0, 2, 5, 2], [3, 0, 3, 4]], [], 26),
  // 8: 6×6, 4 colors
  lvl(6, 6, [[0, 0, 5, 5], [0, 5, 5, 0], [0, 2, 5, 3], [3, 0, 3, 5]], [], 32),
  // 9: 6×6, 5 colors, 2 walls
  lvl(6, 6, [[0, 0, 5, 5], [0, 5, 5, 0], [0, 2, 5, 3], [3, 0, 3, 5], [0, 3, 5, 2]], [[2, 2], [3, 3]], 30),
  // 10: 7×6, 5 colors
  lvl(7, 6, [[0, 0, 6, 5], [0, 5, 6, 0], [0, 2, 6, 3], [3, 0, 4, 5], [0, 4, 6, 2]], [], 34),
  // 11: 7×7, 5 colors, 3 walls
  lvl(7, 7, [[0, 0, 6, 6], [0, 6, 6, 0], [0, 2, 6, 4], [3, 0, 3, 6], [0, 4, 6, 2]], [[3, 3], [2, 4], [4, 2]], 38),
  // 12: 7×7, 5 colors, 4 walls
  lvl(7, 7, [[0, 0, 6, 6], [0, 6, 6, 0], [0, 2, 6, 4], [3, 0, 3, 6], [0, 4, 6, 2]], [[2, 2], [4, 4], [2, 5], [4, 1]], 36),
  // 13: 8×7, 6 colors
  lvl(8, 7, [[0, 0, 7, 6], [0, 6, 7, 0], [0, 2, 7, 4], [0, 4, 7, 2], [4, 0, 4, 6], [0, 3, 7, 3]], [], 42),
  // 14: 8×8, 6 colors, 4 walls
  lvl(8, 8, [[0, 0, 7, 7], [0, 7, 7, 0], [0, 2, 7, 5], [0, 5, 7, 2], [4, 0, 4, 7], [0, 3, 7, 4]], [[3, 3], [4, 4], [3, 4], [4, 3]], 44),
  // 15: 8×8, 7 colors, 6 walls
  lvl(8, 8, [[0, 0, 7, 7], [0, 7, 7, 0], [0, 2, 7, 5], [0, 5, 7, 2], [4, 0, 4, 7], [0, 3, 7, 4], [0, 4, 7, 3]], [[3, 3], [4, 4], [3, 4], [4, 3], [2, 2], [5, 5]], 44),
];

export class MultiColorFillEngine {
  grid: Cell[][] = [];
  rows: number = 0;
  cols: number = 0;
  paths: Path[] = [];
  currentPath: Path | null = null;
  isDrawing: boolean = false;
  state: "idle" | "playing" | "complete" = "idle";
  level: number = 1;
  hintsRemaining: number = 3;
  moveCount: number = 0;
  levelData: LevelData | null = null;

  constructor(level: number) {
    this.loadLevel(level);
  }

  loadLevel(level: number): void {
    this.level = level;
    this.hintsRemaining = 3;
    this.moveCount = 0;
    this.paths = [];
    this.currentPath = null;
    this.isDrawing = false;
    this.state = "playing";

    const data = LEVELS[Math.min(level - 1, LEVELS.length - 1)];
    this.levelData = data;
    this.rows = data.grid.length;
    this.cols = data.grid[0].length;

    this.grid = [];
    for (let r = 0; r < this.rows; r++) {
      const row: Cell[] = [];
      for (let c = 0; c < this.cols; c++) {
        row.push({
          row: r,
          col: c,
          filled: false,
          color: null,
          isNode: false,
          nodeColor: null,
          isTarget: false,
          isWall: data.grid[r][c] === -1,
        });
      }
      this.grid.push(row);
    }

    for (const node of data.nodes) {
      const cell = this.grid[node.row]?.[node.col];
      if (cell) {
        cell.isNode = true;
        cell.nodeColor = node.color;
        cell.isTarget = node.isTarget;
        cell.filled = true;
        cell.color = node.color;
      }
    }
  }

  startPath(row: number, col: number): boolean {
    const cell = this.grid[row]?.[col];
    if (!cell || cell.isWall) return false;

    // Must start from a non-target node that isn't already connected
    if (!cell.isNode || cell.isTarget) return false;

    // Check if this color pair is already connected
    const color = cell.nodeColor;
    if (color && this.paths.some((p) => p.color === color)) return false;

    // Clear any existing path of this color (re-draw)
    const existing = this.paths.find((p) => p.color === color);
    if (existing) this.removePath(existing);

    this.currentPath = {
      color: color!,
      startRow: row,
      startCol: col,
      endRow: row,
      endCol: col,
      cells: [{ row, col }],
    };
    this.isDrawing = true;
    return true;
  }

  continuePath(row: number, col: number): void {
    if (!this.currentPath || !this.isDrawing) return;

    const cell = this.grid[row]?.[col];
    if (!cell || cell.isWall) return;

    const path = this.currentPath;
    const lastCell = path.cells[path.cells.length - 1];

    // Same cell — ignore
    if (lastCell.row === row && lastCell.col === col) return;

    // Going back — truncate the path
    const idx = path.cells.findIndex((c) => c.row === row && c.col === col);
    if (idx >= 0) {
      // Truncate: remove cells after the one we're going back to
      const removed = path.cells.slice(idx + 1);
      for (const rc of removed) {
        const c = this.grid[rc.row]?.[rc.col];
        if (c && !c.isNode) {
          c.filled = false;
          c.color = null;
        }
      }
      path.cells = path.cells.slice(0, idx + 1);
      path.endRow = row;
      path.endCol = col;
      return;
    }

    // Must be adjacent (orthogonal only)
    const dr = Math.abs(row - lastCell.row);
    const dc = Math.abs(col - lastCell.col);
    if (dr + dc !== 1) return;

    // Can't enter a cell filled by another path
    if (cell.filled && cell.color !== path.color) return;

    // Can't pass through a node of a different color
    if (cell.isNode && cell.nodeColor !== path.color) return;

    // If it's the target of the same color → complete the path
    if (cell.isNode && cell.isTarget && cell.nodeColor === path.color) {
      path.cells.push({ row, col });
      path.endRow = row;
      path.endCol = col;
      this.completePath();
      return;
    }

    // Can't pass through a start node or target of same color mid-path
    if (cell.isNode) return;

    // Valid empty cell — extend
    cell.filled = true;
    cell.color = path.color;
    path.cells.push({ row, col });
    path.endRow = row;
    path.endCol = col;
    this.moveCount++;
  }

  endPath(row: number, col: number): boolean {
    if (!this.currentPath || !this.isDrawing) return false;

    const cell = this.grid[row]?.[col];
    if (!cell) {
      this.cancelPath();
      return false;
    }

    // If ending on the target of the same color → complete
    if (cell.isNode && cell.isTarget && cell.nodeColor === this.currentPath.color) {
      this.continuePath(row, col);
      return true;
    }

    // If the path's last cell IS the target, it was already completed
    if (this.currentPath.cells.length > 1) {
      const last = this.currentPath.cells[this.currentPath.cells.length - 1];
      const lastCell = this.grid[last.row]?.[last.col];
      if (lastCell?.isTarget && lastCell.nodeColor === this.currentPath.color) {
        return true;
      }
    }

    this.cancelPath();
    return false;
  }

  private completePath(): void {
    if (!this.currentPath) return;
    this.paths.push(this.currentPath);
    this.currentPath = null;
    this.isDrawing = false;

    if (this.isLevelComplete()) {
      this.state = "complete";
    }
  }

  private removePath(path: Path): void {
    for (const cell of path.cells) {
      const c = this.grid[cell.row]?.[cell.col];
      if (c && !c.isNode) {
        c.filled = false;
        c.color = null;
      }
    }
    this.paths = this.paths.filter((p) => p !== path);
  }

  cancelPath(): void {
    if (!this.currentPath) return;
    for (const cell of this.currentPath.cells) {
      const c = this.grid[cell.row]?.[cell.col];
      if (c && !c.isNode) {
        c.filled = false;
        c.color = null;
      }
    }
    this.currentPath = null;
    this.isDrawing = false;
  }

  isValidConnection(color: string, endRow: number, endCol: number): boolean {
    const cell = this.grid[endRow]?.[endCol];
    if (!cell) return false;
    return cell.isNode && cell.isTarget && cell.nodeColor === color;
  }

  isLevelComplete(): boolean {
    if (!this.levelData) return false;
    const colors = new Set(this.levelData.nodes.map((n) => n.color));
    const connectedColors = new Set(this.paths.map((p) => p.color));
    return colors.size === connectedColors.size;
  }

  reset(): void {
    this.loadLevel(this.level);
  }

  useHint(): { row: number; col: number } | null {
    if (this.hintsRemaining <= 0) return null;
    if (!this.levelData) return null;

    // Find an unconnected color pair
    for (const node of this.levelData.nodes) {
      if (node.isTarget) continue;
      if (this.paths.some((p) => p.color === node.color)) continue;

      // Reveal the target position
      const target = this.levelData.nodes.find(
        (n) => n.color === node.color && n.isTarget,
      );
      if (target) {
        this.hintsRemaining--;
        return { row: target.row, col: target.col };
      }
    }
    return null;
  }

  getGrid(): Cell[][] {
    return this.grid;
  }

  getPaths(): Path[] {
    return this.paths;
  }

  getPar(): number {
    return this.levelData?.par ?? 0;
  }

  getColorsCount(): number {
    if (!this.levelData) return 0;
    return new Set(this.levelData.nodes.map((n) => n.color)).size;
  }

  getDifficulty(): "easy" | "medium" | "hard" {
    const size = this.rows * this.cols;
    if (size <= 20) return "easy";
    if (size <= 36) return "medium";
    return "hard";
  }

  static getMaxLevels(): number {
    return LEVELS.length;
  }
}