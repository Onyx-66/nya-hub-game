// =============================================
// WaterSortEngine — Pure logic for Water Sort puzzle.
// =============================================

export type Color = string;
export type Tube = Color[];

export interface PourResult {
  success: boolean;
  fromTube: number;
  toTube: number;
  message?: string;
}

export const COLORS: Color[] = [
  "#FF6B9D",
  "#60A5FA",
  "#FBBF24",
  "#34D399",
  "#C084FC",
  "#F87171",
  "#FB923C",
  "#38BDF8",
];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export class WaterSortEngine {
  tubes: Tube[];
  readonly tubeCapacity = 4;
  colorCount: number;
  moves: number;
  state: "playing" | "won";
  level: number;

  onWin: (() => void) | null = null;
  onMove: ((moves: number) => void) | null = null;

  private initialTubes: Tube[];

  constructor(level: number = 1) {
    this.level = level;
    this.colorCount = this.getColorCount(level);
    this.tubes = [];
    this.moves = 0;
    this.state = "playing";
    this.generatePuzzle();
    this.initialTubes = this.cloneTubes();
  }

  private getColorCount(level: number): number {
    if (level <= 1) return 3;
    if (level <= 3) return 4;
    if (level <= 6) return 5;
    return 6;
  }

  private generatePuzzle(): void {
    const colors = COLORS.slice(0, this.colorCount);
    const allUnits: Color[] = [];
    for (const color of colors) {
      for (let i = 0; i < this.tubeCapacity; i++) {
        allUnits.push(color);
      }
    }
    const shuffled = shuffle(allUnits);
    const colorTubes: Tube[] = [];
    for (let i = 0; i < this.colorCount; i++) {
      colorTubes.push(shuffled.slice(i * this.tubeCapacity, (i + 1) * this.tubeCapacity));
    }
    this.tubes = [...colorTubes, [], []];
  }

  private cloneTubes(): Tube[] {
    return this.tubes.map((t) => [...t]);
  }

  canPour(fromIndex: number, toIndex: number): boolean {
    if (fromIndex === toIndex) return false;
    const from = this.tubes[fromIndex];
    const to = this.tubes[toIndex];
    if (!from || !to) return false;
    if (from.length === 0) return false;
    if (to.length >= this.tubeCapacity) return false;
    if (to.length === 0) return true;
    return from[from.length - 1] === to[to.length - 1];
  }

  pour(fromIndex: number, toIndex: number): PourResult {
    if (!this.canPour(fromIndex, toIndex)) {
      return { success: false, fromTube: fromIndex, toTube: toIndex, message: "Invalid pour" };
    }
    const from = this.tubes[fromIndex];
    const to = this.tubes[toIndex];
    const topColor = from[from.length - 1];
    while (
      from.length > 0 &&
      to.length < this.tubeCapacity &&
      from[from.length - 1] === topColor
    ) {
      to.push(from.pop()!);
    }
    this.moves++;
    this.onMove?.(this.moves);
    if (this.isComplete()) {
      this.state = "won";
      this.onWin?.();
    }
    return { success: true, fromTube: fromIndex, toTube: toIndex };
  }

  isComplete(): boolean {
    return this.tubes.every(
      (tube) =>
        tube.length === 0 ||
        (tube.length === this.tubeCapacity && tube.every((c) => c === tube[0])),
    );
  }

  reset(): void {
    this.tubes = this.initialTubes.map((t) => [...t]);
    this.moves = 0;
    this.state = "playing";
  }

  getTubes(): Tube[] {
    return this.tubes;
  }

  getMoves(): number {
    return this.moves;
  }

  getPar(): number {
    return this.colorCount * 5;
  }
}

export default WaterSortEngine;