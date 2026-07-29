// =============================================
// snakeRenderer — Pure canvas drawing for the Snake game.
// Supports smooth interpolation between grid cells, eat-pulse
// animation, and the existing cat-themed visuals.
// =============================================

import type { Direction, SnakeSegment } from "../logic/snakeEngine";

const BG_COLOR = "#1a1a2e";
const GRID_COLOR = "#252540";
const HEAD_RGB: [number, number, number] = [255, 107, 157]; // #FF6B9D
const TAIL_RGB: [number, number, number] = [192, 132, 252]; // #C084FC
const FOOD_COLOR = "#FDE047";
const FOOD_EYE = "#1a1a2e";

const DIRECTION_VECTORS: Record<Direction, { x: number; y: number }> = {
  UP: { x: 0, y: -1 },
  DOWN: { x: 0, y: 1 },
  LEFT: { x: -1, y: 0 },
  RIGHT: { x: 1, y: 0 },
};

const DIR_ANGLE: Record<Direction, number> = {
  RIGHT: 0,
  DOWN: Math.PI / 2,
  LEFT: Math.PI,
  UP: -Math.PI / 2,
};

export interface RenderState {
  snake: SnakeSegment[];
  food: SnakeSegment;
  direction: Direction;
  gridWidth: number;
  gridHeight: number;
  prevTail: SnakeSegment | null;
  tickProgress: number; // 0-1 interpolation between ticks
  eatPulse: number; // 0-1 head scale boost after eating
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function lerpColor(a: [number, number, number], b: [number, number, number], t: number): string {
  const r = Math.round(a[0] + (b[0] - a[0]) * t);
  const g = Math.round(a[1] + (b[1] - a[1]) * t);
  const bl = Math.round(a[2] + (b[2] - a[2]) * t);
  return `rgb(${r},${g},${bl})`;
}

function roundRectPath(
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

function drawBackground(ctx: CanvasRenderingContext2D, width: number, height: number) {
  ctx.fillStyle = BG_COLOR;
  ctx.fillRect(0, 0, width, height);
}

function drawGrid(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  cell: number,
  gridW: number,
  gridH: number,
) {
  ctx.strokeStyle = GRID_COLOR;
  ctx.lineWidth = 0.5;
  ctx.beginPath();
  for (let x = 0; x <= gridW; x++) {
    ctx.moveTo(x * cell, 0);
    ctx.lineTo(x * cell, height);
  }
  for (let y = 0; y <= gridH; y++) {
    ctx.moveTo(0, y * cell);
    ctx.lineTo(width, y * cell);
  }
  ctx.stroke();
}

function drawSparkles(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  cell: number,
  frame: number,
) {
  const count = 4;
  for (let i = 0; i < count; i++) {
    const angle = frame * 0.05 + (i * Math.PI) / 2;
    const dist = cell * 0.55 + Math.sin(frame * 0.1 + i) * cell * 0.08;
    const sx = cx + Math.cos(angle) * dist;
    const sy = cy + Math.sin(angle) * dist;
    const alpha = 0.25 + 0.3 * Math.sin(frame * 0.15 + i);
    ctx.fillStyle = `rgba(253,224,71,${Math.max(0, alpha)})`;
    ctx.beginPath();
    ctx.arc(sx, sy, cell * 0.06, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawFood(
  ctx: CanvasRenderingContext2D,
  food: SnakeSegment,
  cell: number,
  frame: number,
) {
  const bob = Math.sin(frame * 0.12) * cell * 0.08;
  const cx = food.x * cell + cell / 2;
  const cy = food.y * cell + cell / 2 + bob;
  const r = cell * 0.32;

  drawSparkles(ctx, cx, cy, cell, frame);

  // Fish body
  ctx.fillStyle = FOOD_COLOR;
  ctx.beginPath();
  ctx.ellipse(cx, cy, r, r * 0.7, 0, 0, Math.PI * 2);
  ctx.fill();

  // Tail
  ctx.beginPath();
  ctx.moveTo(cx - r * 0.9, cy);
  ctx.lineTo(cx - r * 1.6, cy - r * 0.55);
  ctx.lineTo(cx - r * 1.6, cy + r * 0.55);
  ctx.closePath();
  ctx.fill();

  // Eye
  ctx.fillStyle = FOOD_EYE;
  ctx.beginPath();
  ctx.arc(cx + r * 0.4, cy - r * 0.18, r * 0.13, 0, Math.PI * 2);
  ctx.fill();
}

function drawCatHead(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  size: number,
  direction: Direction,
) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(DIR_ANGLE[direction]);
  const s = size;

  // Ears (two triangles on top)
  ctx.fillStyle = "#FF6B9D";
  ctx.beginPath();
  ctx.moveTo(-s * 0.35, -s * 0.3);
  ctx.lineTo(-s * 0.22, -s * 0.55);
  ctx.lineTo(-s * 0.08, -s * 0.3);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(s * 0.08, -s * 0.3);
  ctx.lineTo(s * 0.22, -s * 0.55);
  ctx.lineTo(s * 0.35, -s * 0.3);
  ctx.closePath();
  ctx.fill();

  // Eyes (looking forward)
  ctx.fillStyle = "#1a1a2e";
  ctx.beginPath();
  ctx.arc(s * 0.12, -s * 0.1, s * 0.07, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(s * 0.12, s * 0.1, s * 0.07, 0, Math.PI * 2);
  ctx.fill();

  // Whiskers
  ctx.strokeStyle = "rgba(255,255,255,0.55)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(s * 0.18, -s * 0.05);
  ctx.lineTo(s * 0.45, -s * 0.15);
  ctx.moveTo(s * 0.18, -s * 0.05);
  ctx.lineTo(s * 0.45, 0);
  ctx.moveTo(s * 0.18, s * 0.05);
  ctx.lineTo(s * 0.45, s * 0.15);
  ctx.moveTo(s * 0.18, s * 0.05);
  ctx.lineTo(s * 0.45, 0);
  ctx.stroke();

  ctx.restore();
}

function drawDirectionIndicator(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  cell: number,
  direction: Direction,
) {
  const s = cell * 0.12;
  const vec = DIRECTION_VECTORS[direction];
  ctx.fillStyle = "rgba(255,255,255,0.3)";
  const tipX = cx + vec.x * s;
  const tipY = cy + vec.y * s;
  const baseX = cx - vec.x * s * 0.5;
  const baseY = cy - vec.y * s * 0.5;
  const px = -vec.y * s * 0.6;
  const py = vec.x * s * 0.6;
  ctx.beginPath();
  ctx.moveTo(tipX, tipY);
  ctx.lineTo(baseX + px, baseY + py);
  ctx.lineTo(baseX - px, baseY - py);
  ctx.closePath();
  ctx.fill();
}

/**
 * Draws the snake with smooth interpolation between tick positions.
 * Each segment slides from the position behind it toward its own position,
 * creating a continuous gliding effect. The tail retracts from its old
 * position (prevTail) toward the new last segment.
 */
function drawSnake(
  ctx: CanvasRenderingContext2D,
  snake: SnakeSegment[],
  cell: number,
  direction: Direction,
  frame: number,
  prevTail: SnakeSegment | null,
  tickProgress: number,
  eatPulse: number,
) {
  const n = snake.length;
  const p = tickProgress;

  // Draw tail-first so head renders on top.
  for (let i = n - 1; i >= 0; i--) {
    const seg = snake[i];

    // Compute interpolated render position.
    let rx: number, ry: number;

    if (i < n - 1) {
      // Head and body: slide from the segment behind toward own position.
      const behind = snake[i + 1];
      rx = lerp(behind.x, seg.x, p);
      ry = lerp(behind.y, seg.y, p);
    } else {
      // Tail: retract from prevTail toward own position.
      if (prevTail) {
        rx = lerp(prevTail.x, seg.x, p);
        ry = lerp(prevTail.y, seg.y, p);
      } else {
        rx = seg.x;
        ry = seg.y;
      }
    }

    const cx = rx * cell + cell / 2;
    const cy = ry * cell + cell / 2;

    const t = n > 1 ? i / (n - 1) : 0;
    const color = lerpColor(HEAD_RGB, TAIL_RGB, t);

    // Head gets eat-pulse scale boost; body gets subtle breathing pulse.
    let pulse: number;
    if (i === 0) {
      pulse = 1 + eatPulse * 0.18;
    } else {
      pulse = 1 + Math.sin(frame * 0.2 + i) * 0.04 * (i % 2 === 0 ? 1 : -1);
    }
    const sz = cell * 0.86 * pulse;

    ctx.fillStyle = color;
    roundRectPath(ctx, cx - sz / 2, cy - sz / 2, sz, sz, cell * 0.25);
    ctx.fill();

    if (i === 0) {
      drawCatHead(ctx, cx, cy, sz, direction);
    } else {
      drawDirectionIndicator(ctx, cx, cy, cell, direction);
    }
  }
}

export function renderSnake(
  ctx: CanvasRenderingContext2D,
  state: RenderState,
  width: number,
  height: number,
  frame: number,
) {
  const cell = width / state.gridWidth;
  drawBackground(ctx, width, height);
  drawGrid(ctx, width, height, cell, state.gridWidth, state.gridHeight);
  drawFood(ctx, state.food, cell, frame);
  drawSnake(
    ctx,
    state.snake,
    cell,
    state.direction,
    frame,
    state.prevTail,
    state.tickProgress,
    state.eatPulse,
  );
}