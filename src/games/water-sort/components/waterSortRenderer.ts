// =============================================
// waterSortRenderer — Canvas drawing for Water Sort.
// =============================================

import type { WaterSortEngine } from "../logic/waterSortEngine";

export interface RendererConfig {
  tubeWidth: number;
  tubeHeight: number;
  tubeSpacing: number;
  rowSpacing: number;
  tubesPerRow: number;
  startX: number;
  startY: number;
  segmentHeight: number;
}

const GLASS_FILL = "rgba(96, 165, 250, 0.06)";
const GLASS_BORDER = "rgba(255, 255, 255, 0.12)";

export function createConfig(canvasWidth: number): RendererConfig {
  const tubeWidth = 44;
  const tubeHeight = 136;
  const tubeSpacing = 12;
  const rowSpacing = 20;
  const tubesPerRow = 4;
  const totalRowWidth = tubesPerRow * tubeWidth + (tubesPerRow - 1) * tubeSpacing;
  return {
    tubeWidth,
    tubeHeight,
    tubeSpacing,
    rowSpacing,
    tubesPerRow,
    startX: (canvasWidth - totalRowWidth) / 2,
    startY: 20,
    segmentHeight: tubeHeight / 4,
  };
}

export function getCanvasHeight(tubeCount: number, config: RendererConfig): number {
  const rows = Math.ceil(tubeCount / config.tubesPerRow);
  return config.startY * 2 + rows * (config.tubeHeight + config.rowSpacing);
}

export function getTubeAtPosition(
  x: number,
  y: number,
  config: RendererConfig,
  tubeCount: number,
): number | null {
  for (let i = 0; i < tubeCount; i++) {
    const row = Math.floor(i / config.tubesPerRow);
    const col = i % config.tubesPerRow;
    const tx = config.startX + col * (config.tubeWidth + config.tubeSpacing);
    const ty = config.startY + row * (config.tubeHeight + config.rowSpacing);
    if (x >= tx && x <= tx + config.tubeWidth && y >= ty && y <= ty + config.tubeHeight) {
      return i;
    }
  }
  return null;
}

function lighten(hex: string, amount: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const lr = Math.min(255, Math.round(r + (255 - r) * amount));
  const lg = Math.min(255, Math.round(g + (255 - g) * amount));
  const lb = Math.min(255, Math.round(b + (255 - b) * amount));
  return `rgb(${lr},${lg},${lb})`;
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  const rad = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rad, y);
  ctx.arcTo(x + w, y, x + w, y + h, rad);
  ctx.arcTo(x + w, y + h, x, y + h, rad);
  ctx.arcTo(x, y + h, x, y, rad);
  ctx.arcTo(x, y, x + w, y, rad);
  ctx.closePath();
}

export function renderTubes(
  ctx: CanvasRenderingContext2D,
  engine: WaterSortEngine,
  config: RendererConfig,
  selectedTube: number | null,
  invalidFlash: { tube: number; time: number } | null,
  frame: number,
): void {
  const now = Date.now();

  for (let i = 0; i < engine.tubes.length; i++) {
    const row = Math.floor(i / config.tubesPerRow);
    const col = i % config.tubesPerRow;
    const baseX = config.startX + col * (config.tubeWidth + config.tubeSpacing);
    const baseY = config.startY + row * (config.tubeHeight + config.rowSpacing);
    const isSelected = selectedTube === i;
    const lift = isSelected ? -10 : 0;
    const x = baseX;
    const y = baseY + lift;
    const tube = engine.tubes[i];

    // Glass tube background
    ctx.fillStyle = GLASS_FILL;
    roundRect(ctx, x, y, config.tubeWidth, config.tubeHeight, 8);
    ctx.fill();

    // Liquid segments (bottom to top)
    const segH = config.segmentHeight;
    for (let j = 0; j < tube.length; j++) {
      const segY = y + config.tubeHeight - (j + 1) * segH;
      const color = tube[j];

      const grad = ctx.createLinearGradient(x, segY, x + config.tubeWidth, segY);
      grad.addColorStop(0, color);
      grad.addColorStop(0.5, lighten(color, 0.2));
      grad.addColorStop(1, color);
      ctx.fillStyle = grad;
      roundRect(ctx, x + 2, segY + 1, config.tubeWidth - 4, segH - 1, 4);
      ctx.fill();
    }

    // Wave at top of liquid
    if (tube.length > 0) {
      const topY = y + config.tubeHeight - tube.length * segH;
      const topColor = tube[tube.length - 1];
      ctx.strokeStyle = lighten(topColor, 0.4);
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      for (let wx = 0; wx <= config.tubeWidth - 4; wx += 2) {
        const wy = topY + Math.sin((wx + frame * 0.06) * 0.3) * 1.5;
        if (wx === 0) ctx.moveTo(x + 2 + wx, wy);
        else ctx.lineTo(x + 2 + wx, wy);
      }
      ctx.stroke();
    }

    // Tube border
    const isFlashing =
      invalidFlash && invalidFlash.tube === i && now - invalidFlash.time < 400;
    ctx.strokeStyle = isSelected
      ? "#A78BFA"
      : isFlashing
        ? "#F87171"
        : GLASS_BORDER;
    ctx.lineWidth = isSelected || isFlashing ? 2.5 : 1;
    roundRect(ctx, x, y, config.tubeWidth, config.tubeHeight, 8);
    ctx.stroke();

    // Glow for selected
    if (isSelected) {
      ctx.save();
      ctx.shadowColor = "#A78BFA";
      ctx.shadowBlur = 12;
      ctx.strokeStyle = "#A78BFA";
      ctx.lineWidth = 1;
      roundRect(ctx, x, y, config.tubeWidth, config.tubeHeight, 8);
      ctx.stroke();
      ctx.restore();
    }
  }
}