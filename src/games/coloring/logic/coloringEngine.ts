// =============================================
// ColoringEngine — State management for the coloring book.
// =============================================

export type ColoringState = 'gallery' | 'coloring' | 'complete';
export type ToolMode = 'brush' | 'fill' | 'eraser';

export interface ColoringPage {
  id: string;
  name: string;
  lineArtPath: string;
  thumbnailPath: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category: 'cats' | 'nature' | 'fantasy' | 'patterns';
}

export const PALETTE: string[] = [
  '#FF6B9D', '#FF8FAB', '#FFB3C6', '#C084FC', '#A855F7', '#8B5CF6',
  '#60A5FA', '#38BDF8', '#7DD3FC', '#34D399', '#6EE7B7', '#A7F3D0',
  '#FDE047', '#FBBF24', '#F59E0B', '#FB923C', '#F97316', '#EF4444',
  '#F87171', '#FCA5A5', '#E5E7EB', '#9CA3AF', '#6B7280', '#1F2937',
];

export const COLORING_PAGES: ColoringPage[] = [
  { id: 'moon-cat', name: 'Moon Cat', lineArtPath: 'moon-cat', thumbnailPath: 'moon-cat', difficulty: 'easy', category: 'cats' },
  { id: 'yarn-kitten', name: 'Yarn Kitten', lineArtPath: 'yarn-kitten', thumbnailPath: 'yarn-kitten', difficulty: 'easy', category: 'cats' },
  { id: 'garden-cat', name: 'Garden Cat', lineArtPath: 'garden-cat', thumbnailPath: 'garden-cat', difficulty: 'medium', category: 'nature' },
  { id: 'mystical-cat', name: 'Mystical Cat', lineArtPath: 'mystical-cat', thumbnailPath: 'mystical-cat', difficulty: 'medium', category: 'fantasy' },
  { id: 'cat-dragon', name: 'Cat Dragon', lineArtPath: 'cat-dragon', thumbnailPath: 'cat-dragon', difficulty: 'hard', category: 'fantasy' },
  { id: 'mandala-cat', name: 'Mandala Cat', lineArtPath: 'mandala-cat', thumbnailPath: 'mandala-cat', difficulty: 'hard', category: 'patterns' },
];

export class ColoringEngine {
  currentPage: ColoringPage | null = null;
  currentColor: string = '#FF6B9D';
  brushSize: number = 10;
  coloredRegions: Map<string, string> = new Map();
  pageColors: Map<string, Map<string, string>> = new Map();
  undoStack: { regionId: string; previousColor: string | null }[] = [];
  redoStack: { regionId: string; color: string }[] = [];
  state: ColoringState = 'gallery';
  toolMode: ToolMode = 'fill';
  recentColors: string[] = ['#FF6B9D'];
  completedPages: Set<string> = new Set();

  readonly PALETTE = PALETTE;

  constructor() {}

  selectPage(pageId: string): void {
    if (this.currentPage && this.state === 'coloring') {
      this.pageColors.set(this.currentPage.id, new Map(this.coloredRegions));
    }
    const page = COLORING_PAGES.find((p) => p.id === pageId);
    if (page) {
      this.currentPage = page;
      this.coloredRegions = new Map(this.pageColors.get(pageId) ?? new Map());
      this.undoStack = [];
      this.redoStack = [];
      this.state = 'coloring';
    }
  }

  setColor(color: string): void {
    this.currentColor = color;
    this.recentColors = [color, ...this.recentColors.filter((c) => c !== color)].slice(0, 8);
  }

  setBrushSize(size: number): void {
    this.brushSize = Math.max(2, Math.min(20, size));
  }

  setToolMode(mode: ToolMode): void {
    this.toolMode = mode;
  }

  colorRegion(regionId: string): void {
    if (!this.currentPage || this.state !== 'coloring') return;

    const previousColor = this.coloredRegions.get(regionId) ?? null;

    if (this.toolMode === 'eraser') {
      if (previousColor) {
        this.undoStack.push({ regionId, previousColor });
        this.redoStack = [];
        this.coloredRegions.delete(regionId);
      }
    } else {
      if (previousColor === this.currentColor) return;
      this.undoStack.push({ regionId, previousColor });
      this.redoStack = [];
      this.coloredRegions.set(regionId, this.currentColor);
    }
  }

  undo(): void {
    const action = this.undoStack.pop();
    if (!action) return;
    const currentColor = this.coloredRegions.get(action.regionId) ?? null;
    if (currentColor) {
      this.redoStack.push({ regionId: action.regionId, color: currentColor });
    }
    if (action.previousColor) {
      this.coloredRegions.set(action.regionId, action.previousColor);
    } else {
      this.coloredRegions.delete(action.regionId);
    }
  }

  redo(): void {
    const action = this.redoStack.pop();
    if (!action) return;
    const previousColor = this.coloredRegions.get(action.regionId) ?? null;
    this.undoStack.push({ regionId: action.regionId, previousColor });
    if (action.color) {
      this.coloredRegions.set(action.regionId, action.color);
    } else {
      this.coloredRegions.delete(action.regionId);
    }
  }

  resetPage(): void {
    this.coloredRegions = new Map();
    this.undoStack = [];
    this.redoStack = [];
    if (this.currentPage) {
      this.pageColors.delete(this.currentPage.id);
    }
  }

  completePage(): void {
    if (!this.currentPage) return;
    this.completedPages.add(this.currentPage.id);
    this.pageColors.set(this.currentPage.id, new Map(this.coloredRegions));
    this.state = 'complete';
  }

  backToGallery(): void {
    if (this.currentPage && this.state === 'coloring') {
      this.pageColors.set(this.currentPage.id, new Map(this.coloredRegions));
    }
    this.state = 'gallery';
    this.currentPage = null;
  }

  getStarRating(totalRegions: number): number {
    const coloredCount = this.coloredRegions.size;
    const coverage = totalRegions > 0 ? coloredCount / totalRegions : 0;
    const uniqueColors = new Set(this.coloredRegions.values()).size;
    if (coverage >= 0.9 && uniqueColors >= 5) return 3;
    if (coverage >= 0.6 && uniqueColors >= 3) return 2;
    if (coverage >= 0.3) return 1;
    return 0;
  }
}

export default ColoringEngine;