import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Paintbrush, PaintBucket, Eraser, Undo2, Redo2, ChevronLeft, Check, RotateCcw, Save } from "lucide-react";
import { ColoringEngine, COLORING_PAGES, PALETTE, type ToolMode } from "../logic/coloringEngine";
import { PAGE_ART } from "../data/coloringPages";
import { useGameEconomy } from "@/hooks/useGameEconomy";
import { useEconomyStore } from "@/store/economyStore";

const GAME_ID = "coloring";
const DIFFICULTY_STARS: Record<string, number> = { easy: 1, medium: 2, hard: 3 };

export default function ColoringGame() {
  const engineRef = useRef(new ColoringEngine());
  const [, forceUpdate] = useReducer((x: number) => x + 1, 0);
  const engine = engineRef.current;

  const [completionStars, setCompletionStars] = useState(0);
  const [savedPaws, setSavedPaws] = useState(0);

  const navigate = useNavigate();
  const { onGameStart, onGameEnd } = useGameEconomy(GAME_ID);
  const addPaws = useEconomyStore((s) => s.addPaws);
  const addGems = useEconomyStore((s) => s.addGems);

  useEffect(() => {
    onGameStart();
  }, [onGameStart]);

  // ── Actions ──
  const handleSelectPage = useCallback((pageId: string) => {
    engine.selectPage(pageId);
    forceUpdate();
  }, [engine]);

  const handleColorRegion = useCallback((regionId: string) => {
    engine.colorRegion(regionId);
    forceUpdate();
  }, [engine]);

  const handleSetColor = useCallback((color: string) => {
    engine.setColor(color);
    forceUpdate();
  }, [engine]);

  const handleSetBrush = useCallback((size: number) => {
    engine.setBrushSize(size);
    forceUpdate();
  }, [engine]);

  const handleSetTool = useCallback((mode: ToolMode) => {
    engine.setToolMode(mode);
    forceUpdate();
  }, [engine]);

  const handleUndo = useCallback(() => {
    engine.undo();
    forceUpdate();
  }, [engine]);

  const handleRedo = useCallback(() => {
    engine.redo();
    forceUpdate();
  }, [engine]);

  const handleReset = useCallback(() => {
    engine.resetPage();
    forceUpdate();
  }, [engine]);

  const handleBackToGallery = useCallback(() => {
    engine.backToGallery();
    forceUpdate();
  }, [engine]);

  const handleComplete = useCallback(() => {
    const page = engine.currentPage;
    if (!page) return;
    const art = PAGE_ART[page.id];
    const stars = engine.getStarRating(art.regions.length);
    const paws = page.difficulty === "easy" ? 25 : page.difficulty === "medium" ? 50 : 100;

    engine.completePage();
    forceUpdate();

    setCompletionStars(stars);
    setSavedPaws(paws);
    addPaws(paws, "Coloring completion");
    onGameEnd(paws, 1, stars);

    if (engine.completedPages.size > 0 && engine.completedPages.size % 3 === 0) {
      addGems(1, "Coloring 3-page bonus");
    }
  }, [engine, addPaws, addGems, onGameEnd]);

  const handleSave = useCallback(() => {
    console.log("Coloring page saved:", engine.currentPage?.id, Object.fromEntries(engine.coloredRegions));
  }, [engine]);

  // ═══ GALLERY ═══
  if (engine.state === "gallery") {
    return (
      <div className="w-full">
        <h3 className="font-heading font-bold text-lg text-foreground mb-3">Choose a Coloring Page</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {COLORING_PAGES.map((page) => {
            const art = PAGE_ART[page.id];
            const isCompleted = engine.completedPages.has(page.id);
            const stars = DIFFICULTY_STARS[page.difficulty] ?? 1;
            return (
              <button
                key={page.id}
                onClick={() => handleSelectPage(page.id)}
                className="relative bg-card rounded-2xl p-2 border border-border/50 hover:border-primary/50 transition-colors active:scale-95 transition-transform"
              >
                <div className="bg-white rounded-xl overflow-hidden aspect-square">
                  <svg viewBox={art.viewBox} className="w-full h-full">
                    {art.regions.map((r) => (
                      <path key={r.id} d={r.d} fill="#fff" stroke="#2D2D3F" strokeWidth="3" strokeLinejoin="round" />
                    ))}
                  </svg>
                </div>
                <div className="flex items-center justify-between mt-2 px-1">
                  <span className="text-xs font-bold text-foreground truncate">{page.name}</span>
                  <span className="text-xs text-gold flex shrink-0">
                    {"★".repeat(stars)}{"☆".repeat(3 - stars)}
                  </span>
                </div>
                {isCompleted && (
                  <div className="absolute top-3 right-3 w-7 h-7 rounded-full bg-gold flex items-center justify-center shadow-lg">
                    <Check className="w-4 h-4 text-white" strokeWidth={3} />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // ═══ COMPLETE ═══
  if (engine.state === "complete" && engine.currentPage) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-8">
        <h3 className="font-heading font-bold text-2xl text-foreground">Masterpiece Complete!</h3>
        <p className="text-sm text-muted-foreground">{engine.currentPage.name}</p>
        <div className="flex gap-1">
          {[1, 2, 3].map((s) => (
            <span key={s} className={`text-4xl ${s <= completionStars ? "text-gold" : "text-white/20"}`}>★</span>
          ))}
        </div>
        <div className="flex items-center gap-2 bg-card px-4 py-2 rounded-xl border border-border/50">
          <span className="text-2xl">🐾</span>
          <span className="font-heading font-bold text-lg text-gold">+{savedPaws}</span>
        </div>
        <div className="flex items-center gap-3 mt-2">
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-muted text-white font-heading font-bold text-sm active:scale-95 transition-transform"
          >
            <Save className="w-4 h-4" /> Save
          </button>
          <button
            onClick={handleBackToGallery}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-heading font-bold text-sm active:scale-95 transition-transform"
          >
            Gallery
          </button>
        </div>
      </div>
    );
  }

  // ═══ COLORING ═══
  const page = engine.currentPage;
  if (!page) return null;
  const art = PAGE_ART[page.id];

  const toolButtons: { mode: ToolMode; icon: typeof Paintbrush; label: string }[] = [
    { mode: "brush", icon: Paintbrush, label: "Brush" },
    { mode: "fill", icon: PaintBucket, label: "Fill" },
    { mode: "eraser", icon: Eraser, label: "Eraser" },
  ];

  return (
    <div className="flex flex-col lg:flex-row gap-4 w-full">
      {/* ── SVG Canvas ── */}
      <div className="flex-1 flex flex-col items-center">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden">
          <svg viewBox={art.viewBox} className="w-full h-auto touch-none select-none">
            {art.regions.map((region) => (
              <path
                key={region.id}
                d={region.d}
                fill={engine.coloredRegions.get(region.id) ?? "#FFFFFF"}
                stroke="#2D2D3F"
                strokeWidth="2"
                strokeLinejoin="round"
                onClick={() => handleColorRegion(region.id)}
                className="cursor-pointer hover:opacity-80 transition-opacity"
              />
            ))}
          </svg>
        </div>
        <div className="flex items-center gap-2 mt-3">
          <button
            onClick={handleBackToGallery}
            className="flex items-center gap-1 px-4 py-2 rounded-xl bg-muted text-white font-heading font-bold text-xs active:scale-95 transition-transform"
          >
            <ChevronLeft className="w-3.5 h-3.5" /> Gallery
          </button>
          <button
            onClick={handleReset}
            className="flex items-center gap-1 px-4 py-2 rounded-xl bg-muted text-white font-heading font-bold text-xs active:scale-95 transition-transform"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset
          </button>
          <button
            onClick={handleComplete}
            className="flex items-center gap-1 px-4 py-2 rounded-xl bg-primary text-primary-foreground font-heading font-bold text-xs active:scale-95 transition-transform"
          >
            <Check className="w-3.5 h-3.5" /> Complete
          </button>
        </div>
      </div>

      {/* ── Tool Panel ── */}
      <div className="lg:w-60 space-y-3">
        {/* Recent colors */}
        <div>
          <p className="text-xs text-muted-foreground mb-1.5">Recent</p>
          <div className="flex gap-1 flex-wrap">
            {engine.recentColors.map((c) => (
              <button
                key={c}
                onClick={() => handleSetColor(c)}
                className={`w-7 h-7 rounded-full border-2 transition-transform active:scale-90 ${
                  engine.currentColor === c ? "border-white scale-110" : "border-transparent"
                }`}
                style={{ background: c }}
              />
            ))}
          </div>
        </div>

        {/* Palette */}
        <div>
          <p className="text-xs text-muted-foreground mb-1.5">Colors</p>
          <div className="grid grid-cols-6 gap-1.5">
            {PALETTE.map((c) => (
              <button
                key={c}
                onClick={() => handleSetColor(c)}
                className={`w-8 h-8 rounded-lg border-2 transition-transform active:scale-90 ${
                  engine.currentColor === c ? "border-white scale-110" : "border-transparent"
                }`}
                style={{ background: c }}
              />
            ))}
          </div>
        </div>

        {/* Brush size */}
        <div>
          <p className="text-xs text-muted-foreground mb-1.5">Brush Size: {engine.brushSize}px</p>
          <input
            type="range"
            min={2}
            max={20}
            value={engine.brushSize}
            onChange={(e) => handleSetBrush(Number(e.target.value))}
            className="w-full accent-primary"
          />
        </div>

        {/* Tool buttons */}
        <div>
          <p className="text-xs text-muted-foreground mb-1.5">Tools</p>
          <div className="flex gap-2">
            {toolButtons.map(({ mode, icon: Icon, label }) => (
              <button
                key={mode}
                onClick={() => handleSetTool(mode)}
                className={`flex-1 flex flex-col items-center gap-1 py-2 rounded-xl border transition-colors ${
                  engine.toolMode === mode
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card text-foreground border-border/50"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs font-bold">{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Undo / Redo */}
        <div className="flex gap-2">
          <button
            onClick={handleUndo}
            disabled={engine.undoStack.length === 0}
            className="flex-1 flex items-center justify-center gap-1 py-2 rounded-xl bg-card text-foreground border border-border/50 disabled:opacity-40 active:scale-95 transition-transform"
          >
            <Undo2 className="w-4 h-4" /> Undo
          </button>
          <button
            onClick={handleRedo}
            disabled={engine.redoStack.length === 0}
            className="flex-1 flex items-center justify-center gap-1 py-2 rounded-xl bg-card text-foreground border border-border/50 disabled:opacity-40 active:scale-95 transition-transform"
          >
            <Redo2 className="w-4 h-4" /> Redo
          </button>
        </div>
      </div>
    </div>
  );
}