// =============================================
// snakeRenderer — Enhanced canvas drawing.
// Connected tapered body, glow, cat face, improved food.
// =============================================

import type { Direction, SnakeSegment } from "../logic/snakeEngine";

const BG_COLOR = "#1a1a2e";
const GRID_COLOR = "#252540";
const HEAD_RGB: [number, number, number] = [255, 107, 157]; // #FF6B9D
const TAIL_RGB: [number, number, number] = [192, 132, 252]; // #C084FC
const FOOD_COLOR = "#FDE047";
const FOOD_EYE = "#1a1a2e";
const GLOW_COLOR = "rgba(255, 107, 157, 0.12)";
const FOOD_GLOW = "rgba(253, 224, 71, 0.15)";

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
  tickProgress: number;
  eatPulse: number;
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

function rgbStr(rgb: [number, number, number], alpha = 1): string {
  return `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${alpha})`;
}

/** Returns interpolated pixel positions for each snake segment. */
function getInterpolatedPoints(
  snake: SnakeSegment[],
  prevTail: SnakeSegment | null,
  tickProgress: number,
  cell: number,
): { x: number; y: number }[] {
  const n = snake.length;
  const p = tickProgress;
  const pts: { x: number; y: number }[] = [];

  for (let i = 0; i < n; i++) {
    const seg = snake[i];
    let rx: number, ry: number;

    if (i < n - 1) {
      const behind = snake[i + 1];
      rx = lerp(behind.x, seg.x, p);
      ry = lerp(behind.y, seg.y, p);
    } else if (prevTail) {
      rx = lerp(prevTail.x, seg.x, p);
      ry = lerp(prevTail.y, seg.y, p);
    } else {
      rx = seg.x;
      ry = seg.y;
    }

    pts.push({ x: rx * cell + cell / 2, y: ry * cell + cell / 2 });
  }
  return pts;
}

function drawBackground(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.fillStyle = BG_COLOR;
  ctx.fillRect(0, 0, w, h);
}

function drawGrid(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  cell: number,
  gw: number,
  gh: number,
) {
  ctx.strokeStyle = GRID_COLOR;
  ctx.lineWidth = 0.5;
  ctx.beginPath();
  for (let x = 0; x <= gw; x++) {
    ctx.moveTo(x * cell, 0);
    ctx.lineTo(x * cell, h);
  }
  for (let y = 0; y <= gh; y++) {
    ctx.moveTo(0, y * cell);
    ctx.lineTo(w, y * cell);
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
  for (let i = 0; i < 4; i++) {
    const angle = frame * 0.05 + (i * Math.PI) / 2;
    const dist = cell * 0.6 + Math.sin(frame * 0.1 + i) * cell * 0.08;
    const sx = cx + Math.cos(angle) * dist;
    const sy = cy + Math.sin(angle) * dist;
    const alpha = 0.2 + 0.25 * Math.sin(frame * 0.15 + i);
    ctx.fillStyle = `rgba(253,224,71,${Math.max(0, alpha)})`;
    ctx.beginPath();
    ctx.arc(sx, sy, cell * 0.05, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawFood(
  ctx: CanvasRenderingContext2D,
  food: SnakeSegment,
  cell: number,
  frame: number,
) {
  const bob = Math.sin(frame * 0.12) * cell * 0.06;
  const cx = food.x * cell + cell / 2;
  const cy = food.y * cell + cell / 2 + bob;
  const r = cell * 0.30;

  drawSparkles(ctx, cx, cy, cell, frame);

  // Glow
  ctx.fillStyle = FOOD_GLOW;
  ctx.beginPath();
  ctx.arc(cx, cy, r * 1.8, 0, Math.PI * 2);
  ctx.fill();

  // Body
  ctx.fillStyle = FOOD_COLOR;
  ctx.beginPath();
  ctx.ellipse(cx, cy, r, r * 0.72, 0, 0, Math.PI * 2);
  ctx.fill();

  // Tail fin
  ctx.beginPath();
  ctx.moveTo(cx - r * 0.85, cy);
  ctx.lineTo(cx - r * 1.5, cy - r * 0.5);
  ctx.lineTo(cx - r * 1.5, cy + r * 0.5);
  ctx.closePath();
  ctx.fill();

  // Eye
  ctx.fillStyle = FOOD_EYE;
  ctx.beginPath();
  ctx.arc(cx + r * 0.35, cy - r * 0.15, r * 0.14, 0, Math.PI * 2);
  ctx.fill();
  // Eye highlight
  ctx.fillStyle = "rgba(255,255,255,0.6)";
  ctx.beginPath();
  ctx.arc(cx + r * 0.4, cy - r * 0.2, r * 0.05, 0, Math.PI * 2);
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

  // Ears
  ctx.fillStyle = "#FF6B9D";
  ctx.beginPath();
  ctx.moveTo(-s * 0.38, -s * 0.28);
  ctx.lineTo(-s * 0.22, -s * 0.55);
  ctx.lineTo(-s * 0.06, -s * 0.28);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(s * 0.06, -s * 0.28);
  ctx.lineTo(s * 0.22, -s * 0.55);
  ctx.lineTo(s * 0.38, -s * 0.28);
  ctx.closePath();
  ctx.fill();

  // Inner ears
  ctx.fillStyle = "rgba(255,200,220,0.5)";
  ctx.beginPath();
  ctx.moveTo(-s * 0.3, -s * 0.3);
  ctx.lineTo(-s * 0.22, -s * 0.45);
  ctx.lineTo(-s * 0.14, -s * 0.3);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(s * 0.14, -s * 0.3);
  ctx.lineTo(s * 0.22, -s * 0.45);
  ctx.lineTo(s * 0.3, -s * 0.3);
  ctx.closePath();
  ctx.fill();

  // Eyes
  ctx.fillStyle = "#1a1a2e";
  ctx.beginPath();
  ctx.arc(s * 0.14, -s * 0.08, s * 0.08, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(s * 0.14, s * 0.08, s * 0.08, 0, Math.PI * 2);
  ctx.fill();
  // Eye shines
  ctx.fillStyle = "rgba(255,255,255,0.7)";
  ctx.beginPath();
  ctx.arc(s * 0.17, -s * 0.11, s * 0.03, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(s * 0.17, s * 0.05, s * 0.03, 0, Math.PI * 2);
  ctx.fill();

  // Whiskers
  ctx.strokeStyle = "rgba(255,255,255,0.45)";
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(s * 0.2, -s * 0.04);
  ctx.lineTo(s * 0.48, -s * 0.14);
  ctx.moveTo(s * 0.2, 0);
  ctx.lineTo(s * 0.5, 0);
  ctx.moveTo(s * 0.2, s * 0.04);
  ctx.lineTo(s * 0.48, s * 0.14);
  ctx.stroke();

  // Nose
  ctx.fillStyle = "rgba(255,180,200,0.8)";
  ctx.beginPath();
  ctx.arc(s * 0.32, 0, s * 0.04, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

/**
 * Draws the snake as a smooth, connected, tapering body with a glow
 * underneath and a cat face on the head.
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
  const pts = getInterpolatedPoints(snake, prevTail, tickProgress, cell);
  if (pts.length === 0) return;
  const n = pts.length;

  // ── 1. Glow: semi-transparent wide line behind body ──
  ctx.strokeStyle = GLOW_COLOR;
  ctx.lineWidth = cell * 0.95;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();
  ctx.moveTo(pts[0].x, pts[0].y);
  for (let i = 1; i < n; i++) ctx.lineTo(pts[i].x, pts[i].y);
  ctx.stroke();

  // ── 2. Body: tapered segments, each with its own color/width ──
  // Draw tail-first so head is on top.
  for (let i = n - 1; i >= 1; i--) {
    const t = (i - 1) / Math.max(1, n - 2);
    const width = cell * (0.78 - t * 0.16);
    ctx.strokeStyle = lerpColor(HEAD_RGB, TAIL_RGB, t);
    ctx.lineWidth = width;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(pts[i - 1].x, pts[i - 1].y);
    ctx.lineTo(pts[i].x, pts[i].y);
    ctx.stroke();
  }

  // ── 3. Smooth body joints: circles at each point ──
  for (let i = n - 1; i >= 1; i--) {
    const t = (i - 1) / Math.max(1, n - 2);
    const radius = cell * (0.39 - t * 0.08);
    ctx.fillStyle = lerpColor(HEAD_RGB, TAIL_RGB, t);
    ctx.beginPath();
    ctx.arc(pts[i].x, pts[i].y, radius, 0, Math.PI * 2);
    ctx.fill();
  }

  // ── 4. Head: larger circle with cat face ──
  const headR = cell * 0.44 * (1 + eatPulse * 0.18);
  ctx.fillStyle = rgbStr(HEAD_RGB);
  ctx.beginPath();
  ctx.arc(pts[0].x, pts[0].y, headR, 0, Math.PI * 2);
  ctx.fill();

  // Subtle head highlight
  ctx.fillStyle = "rgba(255,255,255,0.12)";
  ctx.beginPath();
  ctx.arc(pts[0].x - headR * 0.25, pts[0].y - headR * 0.25, headR * 0.4, 0, Math.PI * 2);
  ctx.fill();

  drawCatHead(ctx, pts[0].x, pts[0].y, headR * 2, direction);
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