// =============================================
// NyaCrushRenderer — Canvas drawing for Nya Crush.
// =============================================

import type { NyaCrushEngine, CandyType, Candy, Position } from '../logic/nyaCrushEngine';

export const CANDY_COLORS: Record<CandyType, string> = {
  red: '#FF6B9D',
  orange: '#FB923C',
  yellow: '#FDE047',
  green: '#34D399',
  blue: '#60A5FA',
  purple: '#C084FC',
};

export interface NyaCrushRendererConfig {
  cellSize: number;
  boardX: number;
  boardY: number;
  canvasWidth: number;
  canvasHeight: number;
}

const BG_COLOR = '#1a1a2e';

export function createRendererConfig(): NyaCrushRendererConfig {
  const cellSize = 44;
  const boardSize = cellSize * 8;
  return {
    cellSize,
    boardX: 24,
    boardY: 76,
    canvasWidth: 24 * 2 + boardSize,
    canvasHeight: 76 + boardSize + 24,
  };
}

function lightenColor(hex: string, amount: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const lr = Math.min(255, Math.round(r + (255 - r) * amount));
  const lg = Math.min(255, Math.round(g + (255 - g) * amount));
  const lb = Math.min(255, Math.round(b + (255 - b) * amount));
  return `rgb(${lr},${lg},${lb})`;
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number): void {
  const rad = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rad, y);
  ctx.arcTo(x + w, y, x + w, y + h, rad);
  ctx.arcTo(x + w, y + h, x, y + h, rad);
  ctx.arcTo(x, y + h, x, y, rad);
  ctx.arcTo(x, y, x + w, y, rad);
  ctx.closePath();
}

// ── Shape drawers ──
type DrawFn = (ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) => void;

function drawHeart(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number): void {
  const t = r * 0.3;
  ctx.beginPath();
  ctx.moveTo(cx, cy + r * 0.7);
  ctx.bezierCurveTo(cx - r, cy + t, cx - r, cy - r * 0.5, cx, cy - t);
  ctx.bezierCurveTo(cx + r, cy - r * 0.5, cx + r, cy + t, cx, cy + r * 0.7);
  ctx.closePath();
}

function drawTriangle(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number): void {
  ctx.beginPath();
  ctx.moveTo(cx, cy - r);
  ctx.lineTo(cx - r * 0.866, cy + r * 0.5);
  ctx.lineTo(cx + r * 0.866, cy + r * 0.5);
  ctx.closePath();
}

function drawStar(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number): void {
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const angle = (Math.PI / 5) * i - Math.PI / 2;
    const radius = i % 2 === 0 ? r : r * 0.45;
    const x = cx + Math.cos(angle) * radius;
    const y = cy + Math.sin(angle) * radius;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
}

function drawRoundedSquare(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number): void {
  roundRect(ctx, cx - r * 0.85, cy - r * 0.85, r * 1.7, r * 1.7, r * 0.3);
}

function drawDiamond(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number): void {
  ctx.beginPath();
  ctx.moveTo(cx, cy - r);
  ctx.lineTo(cx + r * 0.8, cy);
  ctx.lineTo(cx, cy + r);
  ctx.lineTo(cx - r * 0.8, cy);
  ctx.closePath();
}

function drawCircle(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number): void {
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.9, 0, Math.PI * 2);
  ctx.closePath();
}

const SHAPE_DRAWERS: Record<CandyType, DrawFn> = {
  red: drawHeart,
  orange: drawTriangle,
  yellow: drawStar,
  green: drawRoundedSquare,
  blue: drawDiamond,
  purple: drawCircle,
};

function drawCandy(
  ctx: CanvasRenderingContext2D,
  candy: Candy,
  x: number,
  y: number,
  size: number,
  selected: boolean,
  time: number,
): void {
  const cx = x + size / 2;
  const cy = y + size / 2;
  const r = size * 0.38;
  const color = CANDY_COLORS[candy.type];

  ctx.save();

  if (candy.isSpecial) {
    ctx.shadowColor = color;
    ctx.shadowBlur = 12;
  }

  if (selected) {
    const pulse = Math.sin(time * 0.008) * 0.5 + 0.5;
    ctx.shadowColor = '#ffffff';
    ctx.shadowBlur = 10 + pulse * 8;
  }

  const grad = ctx.createRadialGradient(cx - r * 0.3, cy - r * 0.3, r * 0.1, cx, cy, r);
  grad.addColorStop(0, lightenColor(color, 0.4));
  grad.addColorStop(1, color);
  ctx.fillStyle = grad;

  SHAPE_DRAWERS[candy.type](ctx, cx, cy, r);
  ctx.fill();

  ctx.shadowBlur = 0;
  ctx.fillStyle = 'rgba(255,255,255,0.35)';
  ctx.beginPath();
  ctx.arc(cx - r * 0.3, cy - r * 0.35, r * 0.22, 0, Math.PI * 2);
  ctx.fill();

  if (candy.isSpecial) {
    if (candy.specialType === 'striped') {
      ctx.strokeStyle = 'rgba(255,255,255,0.8)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cx - r * 0.6, cy);
      ctx.lineTo(cx + r * 0.6, cy);
      ctx.stroke();
    } else if (candy.specialType === 'rainbow') {
      const rg = ctx.createLinearGradient(cx - r, cy, cx + r, cy);
      rg.addColorStop(0, '#ff0000');
      rg.addColorStop(0.17, '#ff8800');
      rg.addColorStop(0.33, '#ffee00');
      rg.addColorStop(0.5, '#00ff00');
      rg.addColorStop(0.67, '#0088ff');
      rg.addColorStop(0.83, '#8800ff');
      rg.addColorStop(1, '#ff00ff');
      ctx.fillStyle = rg;
      ctx.beginPath();
      ctx.arc(cx, cy, r * 0.35, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  ctx.restore();
}

export function renderBoard(
  ctx: CanvasRenderingContext2D,
  engine: NyaCrushEngine,
  config: NyaCrushRendererConfig,
  time: number,
  skipPositions?: Set<string>,
): void {
  const { cellSize, boardX, boardY } = config;
  const boardPixelSize = cellSize * 8;

  ctx.fillStyle = BG_COLOR;
  roundRect(ctx, boardX - 6, boardY - 6, boardPixelSize + 12, boardPixelSize + 12, 12);
  ctx.fill();

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const x = boardX + c * cellSize;
      const y = boardY + r * cellSize;

      ctx.fillStyle = 'rgba(255,255,255,0.04)';
      roundRect(ctx, x + 1, y + 1, cellSize - 2, cellSize - 2, 4);
      ctx.fill();

      const candy = engine.board[r][c];
      if (candy && !(skipPositions?.has(`${r},${c}`))) {
        const isSelected = engine.selectedCell?.row === r && engine.selectedCell?.col === c;
        drawCandy(ctx, candy, x, y, cellSize, isSelected, time);
      }
    }
  }
}

export function renderSwapAnimation(
  ctx: CanvasRenderingContext2D,
  engine: NyaCrushEngine,
  from: Position,
  to: Position,
  progress: number,
  config: NyaCrushRendererConfig,
  time: number,
): void {
  const { cellSize, boardX, boardY } = config;
  const fromX = boardX + from.col * cellSize;
  const fromY = boardY + from.row * cellSize;
  const toX = boardX + to.col * cellSize;
  const toY = boardY + to.row * cellSize;
  const e = progress * progress * (3 - 2 * progress);

  const candy1 = engine.board[from.row][from.col];
  const candy2 = engine.board[to.row][to.col];

  if (candy1) {
    drawCandy(ctx, candy1, fromX + (toX - fromX) * e, fromY + (toY - fromY) * e, cellSize, false, time);
  }
  if (candy2) {
    drawCandy(ctx, candy2, toX + (fromX - toX) * e, toY + (fromY - toY) * e, cellSize, false, time);
  }
}

export function renderHUD(
  ctx: CanvasRenderingContext2D,
  score: number,
  moves: number,
  target: number,
  config: NyaCrushRendererConfig,
): void {
  const { canvasWidth } = config;

  ctx.fillStyle = BG_COLOR;
  roundRect(ctx, 0, 0, canvasWidth, 64, 0);
  ctx.fill();

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 11px Nunito, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('Score', 16, 18);
  ctx.font = 'bold 20px Nunito, sans-serif';
  ctx.fillText(score.toLocaleString(), 16, 40);

  ctx.textAlign = 'right';
  ctx.font = 'bold 11px Nunito, sans-serif';
  ctx.fillText('Moves', canvasWidth - 16, 18);
  ctx.font = 'bold 20px Nunito, sans-serif';
  ctx.fillStyle = moves <= 5 ? '#F87171' : '#ffffff';
  ctx.fillText(moves.toString(), canvasWidth - 16, 40);

  const barX = 16;
  const barY = 52;
  const barW = canvasWidth - 32;
  const barH = 6;
  const prog = Math.min(1, score / target);

  ctx.fillStyle = 'rgba(255,255,255,0.1)';
  roundRect(ctx, barX, barY, barW, barH, 3);
  ctx.fill();

  if (prog > 0) {
    const grad = ctx.createLinearGradient(barX, 0, barX + barW, 0);
    grad.addColorStop(0, '#FF6B9D');
    grad.addColorStop(1, '#C084FC');
    ctx.fillStyle = grad;
    roundRect(ctx, barX, barY, barW * prog, barH, 3);
    ctx.fill();
  }
}