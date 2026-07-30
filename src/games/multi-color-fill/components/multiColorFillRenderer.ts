// =============================================
// Multi-Color Fill Renderer — canvas drawing functions
// =============================================
import type { MultiColorFillEngine, Cell, Path } from "../logic/multiColorFillEngine";

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  life: number;
  maxLife: number;
  size: number;
}

export interface RenderConfig {
  cellSize: number;
  offsetX: number;
  offsetY: number;
  canvasWidth: number;
  canvasHeight: number;
}

export function createConfig(canvasWidth: number, canvasHeight: number, rows: number, cols: number): RenderConfig {
  const padding = 12;
  const availW = canvasWidth - padding * 2;
  const availH = canvasHeight - padding * 2;
  const cellSize = Math.floor(Math.min(availW / cols, availH / rows));
  const gridW = cellSize * cols;
  const gridH = cellSize * rows;
  const offsetX = Math.floor((canvasWidth - gridW) / 2);
  const offsetY = Math.floor((canvasHeight - gridH) / 2);
  return { cellSize, offsetX, offsetY, canvasWidth, canvasHeight };
}

export function cellToPixel(row: number, col: number, config: RenderConfig): { x: number; y: number } {
  return {
    x: config.offsetX + col * config.cellSize + config.cellSize / 2,
    y: config.offsetY + row * config.cellSize + config.cellSize / 2,
  };
}

export function pixelToCell(x: number, y: number, config: RenderConfig): { row: number; col: number } | null {
  const col = Math.floor((x - config.offsetX) / config.cellSize);
  const row = Math.floor((y - config.offsetY) / config.cellSize);
  return { row, col };
}

export function renderGrid(ctx: CanvasRenderingContext2D, engine: MultiColorFillEngine, config: RenderConfig): void {
  const { cellSize, offsetX, offsetY } = config;
  const grid = engine.getGrid();
  const gap = 2;
  const radius = 6;

  // Background
  ctx.fillStyle = "#1a1a2e";
  ctx.fillRect(0, 0, config.canvasWidth, config.canvasHeight);

  for (let r = 0; r < grid.length; r++) {
    for (let c = 0; c < grid[r].length; c++) {
      const cell = grid[r][c];
      const x = offsetX + c * cellSize + gap / 2;
      const y = offsetY + r * cellSize + gap / 2;
      const w = cellSize - gap;
      const h = cellSize - gap;

      if (cell.isWall) {
        // Wall — darker with subtle X pattern
        ctx.fillStyle = "#151528";
        roundRect(ctx, x, y, w, h, radius);
        ctx.fill();
        ctx.strokeStyle = "#252540";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(x + w * 0.25, y + h * 0.25);
        ctx.lineTo(x + w * 0.75, y + h * 0.75);
        ctx.moveTo(x + w * 0.75, y + h * 0.25);
        ctx.lineTo(x + w * 0.25, y + h * 0.75);
        ctx.stroke();
      } else if (cell.filled && cell.color) {
        // Filled cell — solid color with slight gradient
        const grad = ctx.createLinearGradient(x, y, x, y + h);
        grad.addColorStop(0, cell.color);
        grad.addColorStop(1, shadeColor(cell.color, -15));
        ctx.fillStyle = grad;
        roundRect(ctx, x, y, w, h, radius);
        ctx.fill();
      } else {
        // Empty cell
        ctx.fillStyle = "#252540";
        roundRect(ctx, x, y, w, h, radius);
        ctx.fill();
      }

      // Start node — filled circle
      if (cell.isNode && !cell.isTarget) {
        const cx = x + w / 2;
        const cy = y + h / 2;
        const nodeR = Math.min(cellSize * 0.28, 12);
        ctx.fillStyle = cell.nodeColor!;
        ctx.beginPath();
        ctx.arc(cx, cy, nodeR, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // Target node — star shape with glow
      if (cell.isNode && cell.isTarget) {
        const cx = x + w / 2;
        const cy = y + h / 2;
        const starR = Math.min(cellSize * 0.3, 14);
        // Glow
        ctx.save();
        ctx.shadowColor = cell.nodeColor!;
        ctx.shadowBlur = 12;
        drawStar(ctx, cx, cy, 5, starR, starR * 0.5);
        ctx.fillStyle = cell.nodeColor!;
        ctx.fill();
        ctx.restore();
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 2;
        drawStar(ctx, cx, cy, 5, starR, starR * 0.5);
        ctx.stroke();
      }
    }
  }
}

export function renderCurrentPath(
  ctx: CanvasRenderingContext2D,
  engine: MultiColorFillEngine,
  config: RenderConfig,
  currentPos: { x: number; y: number } | null,
): void {
  const path = engine.currentPath;
  if (!path || path.cells.length === 0) return;

  const { cellSize } = config;
  const lineWidth = Math.max(6, cellSize * 0.25);

  // Path line
  ctx.strokeStyle = path.color;
  ctx.globalAlpha = 0.85;
  ctx.lineWidth = lineWidth;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();
  const first = cellToPixel(path.cells[0].row, path.cells[0].col, config);
  ctx.moveTo(first.x, first.y);
  for (let i = 1; i < path.cells.length; i++) {
    const p = cellToPixel(path.cells[i].row, path.cells[i].col, config);
    ctx.lineTo(p.x, p.y);
  }
  ctx.stroke();
  ctx.globalAlpha = 1;

  // Preview dotted line from last cell to current pointer
  if (currentPos) {
    const last = path.cells[path.cells.length - 1];
    const lp = cellToPixel(last.row, last.col, config);
    ctx.strokeStyle = path.color;
    ctx.globalAlpha = 0.4;
    ctx.lineWidth = lineWidth * 0.7;
    ctx.setLineDash([6, 6]);
    ctx.beginPath();
    ctx.moveTo(lp.x, lp.y);
    ctx.lineTo(currentPos.x, currentPos.y);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.globalAlpha = 1;
  }
}

export function renderCompletedPaths(
  ctx: CanvasRenderingContext2D,
  engine: MultiColorFillEngine,
  config: RenderConfig,
): void {
  const { cellSize } = config;
  const lineWidth = Math.max(6, cellSize * 0.25);

  for (const path of engine.getPaths()) {
    if (path.cells.length < 2) continue;

    // Shadow
    ctx.save();
    ctx.shadowColor = "rgba(0,0,0,0.4)";
    ctx.shadowBlur = 6;
    ctx.shadowOffsetY = 2;
    ctx.strokeStyle = path.color;
    ctx.lineWidth = lineWidth;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    const first = cellToPixel(path.cells[0].row, path.cells[0].col, config);
    ctx.moveTo(first.x, first.y);
    for (let i = 1; i < path.cells.length; i++) {
      const p = cellToPixel(path.cells[i].row, path.cells[i].col, config);
      ctx.lineTo(p.x, p.y);
    }
    ctx.stroke();
    ctx.restore();
  }
}

export function renderParticles(ctx: CanvasRenderingContext2D, particles: Particle[]): void {
  for (const p of particles) {
    const alpha = p.life / p.maxLife;
    ctx.globalAlpha = alpha;
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size * alpha, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

export function updateParticles(particles: Particle[], dt: number): void {
  for (const p of particles) {
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.vy += 300 * dt;
    p.life -= dt;
  }
}

export function spawnCelebrationParticles(
  config: RenderConfig,
  particles: Particle[],
  colors: string[],
): void {
  const cx = config.canvasWidth / 2;
  const cy = config.canvasHeight / 2;
  for (let i = 0; i < 60; i++) {
    const angle = (Math.PI * 2 * i) / 60 + Math.random() * 0.3;
    const speed = 150 + Math.random() * 200;
    particles.push({
      x: cx,
      y: cy,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 100,
      color: colors[Math.floor(Math.random() * colors.length)],
      life: 1.5 + Math.random() * 0.5,
      maxLife: 2,
      size: 4 + Math.random() * 4,
    });
  }
}

// ── Helpers ──

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number): void {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function drawStar(ctx: CanvasRenderingContext2D, cx: number, cy: number, spikes: number, outerR: number, innerR: number): void {
  let rot = (Math.PI / 2) * 3;
  const step = Math.PI / spikes;
  ctx.beginPath();
  ctx.moveTo(cx, cy - outerR);
  for (let i = 0; i < spikes; i++) {
    ctx.lineTo(cx + Math.cos(rot) * outerR, cy + Math.sin(rot) * outerR);
    rot += step;
    ctx.lineTo(cx + Math.cos(rot) * innerR, cy + Math.sin(rot) * innerR);
    rot += step;
  }
  ctx.lineTo(cx, cy - outerR);
  ctx.closePath();
}

function shadeColor(hex: string, percent: number): string {
  const num = parseInt(hex.replace("#", ""), 16);
  const r = Math.max(0, Math.min(255, (num >> 16) + percent));
  const g = Math.max(0, Math.min(255, ((num >> 8) & 0x00ff) + percent));
  const b = Math.max(0, Math.min(255, (num & 0x0000ff) + percent));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}