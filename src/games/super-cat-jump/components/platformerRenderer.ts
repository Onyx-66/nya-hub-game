import type { GameState } from "../logic/platformerEngine";
import { TILE, TILE_SIZE, GRID_H } from "../logic/platformerEngine";

const WORLD_PALETTES = [
  { sky: ["#0f2e22", "#153d2b"], ground: "#0d3b26", accent: "#10b981" },
  { sky: ["#1a2e12", "#25401a"], ground: "#2d4a1c", accent: "#84cc16" },
  { sky: ["#0e2233", "#123049"], ground: "#123a52", accent: "#38bdf8" },
  { sky: ["#2a1730", "#3a1f42"], ground: "#3d1f4a", accent: "#c084fc" },
  { sky: ["#301a12", "#3f2116"], ground: "#4a2416", accent: "#f97316" },
];

export function renderFrame(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  state: GameState
) {
  const palette = WORLD_PALETTES[state.level.world % WORLD_PALETTES.length];
  ctx.clearRect(0, 0, width, height);

  const sky = ctx.createLinearGradient(0, 0, 0, height);
  sky.addColorStop(0, palette.sky[0]);
  sky.addColorStop(1, palette.sky[1]);
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, width, height);

  const scale = height / (GRID_H * TILE_SIZE);
  ctx.save();
  ctx.scale(scale, scale);
  ctx.translate(-state.camX, 0);

  const startCol = Math.max(0, Math.floor(state.camX / TILE_SIZE) - 1);
  const endCol = Math.min(state.level.width, startCol + Math.ceil(width / scale / TILE_SIZE) + 3);

  for (let c = startCol; c < endCol; c++) {
    for (let r = 0; r < GRID_H; r++) {
      const t = state.level.tiles[c][r];
      const x = c * TILE_SIZE;
      const y = r * TILE_SIZE;
      if (t === TILE.GROUND) {
        ctx.fillStyle = palette.ground;
        ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
        ctx.fillStyle = "rgba(255,255,255,0.08)";
        ctx.fillRect(x, y, TILE_SIZE, 4);
      } else if (t === TILE.PLATFORM) {
        ctx.fillStyle = "#6b4a30";
        ctx.fillRect(x, y + TILE_SIZE * 0.35, TILE_SIZE, TILE_SIZE * 0.4);
      } else if (t === TILE.MYSTERY) {
        ctx.fillStyle = "#fbbf24";
        ctx.fillRect(x + 2, y + 2, TILE_SIZE - 4, TILE_SIZE - 4);
        ctx.fillStyle = "#78350f";
        ctx.font = "bold 18px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("?", x + TILE_SIZE / 2, y + TILE_SIZE * 0.72);
      } else if (t === TILE.MYSTERY_USED) {
        ctx.fillStyle = "#78350f";
        ctx.fillRect(x + 2, y + 2, TILE_SIZE - 4, TILE_SIZE - 4);
      } else if (t === TILE.SPIKE) {
        ctx.fillStyle = "#e5e7eb";
        ctx.beginPath();
        ctx.moveTo(x, y + TILE_SIZE);
        ctx.lineTo(x + TILE_SIZE / 2, y + TILE_SIZE * 0.35);
        ctx.lineTo(x + TILE_SIZE, y + TILE_SIZE);
        ctx.closePath();
        ctx.fill();
      } else if (t === TILE.FLAG) {
        ctx.strokeStyle = "#e5e7eb";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(x + TILE_SIZE / 2, y + TILE_SIZE);
        ctx.lineTo(x + TILE_SIZE / 2, y - TILE_SIZE * 2);
        ctx.stroke();
        ctx.fillStyle = palette.accent;
        ctx.beginPath();
        ctx.moveTo(x + TILE_SIZE / 2, y - TILE_SIZE * 2);
        ctx.lineTo(x + TILE_SIZE / 2 + 20, y - TILE_SIZE * 1.7);
        ctx.lineTo(x + TILE_SIZE / 2, y - TILE_SIZE * 1.4);
        ctx.closePath();
        ctx.fill();
      }
    }
  }

  for (const c of state.level.coins) {
    if (c.collected) continue;
    ctx.fillStyle = "#fde047";
    ctx.beginPath();
    ctx.arc(c.x, c.y, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#a16207";
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }

  for (const cl of state.level.clovers) {
    if (cl.collected) continue;
    ctx.font = "24px serif";
    ctx.textAlign = "center";
    ctx.fillText("\u{1F340}", cl.x, cl.y + 8);
  }

  for (const e of state.level.enemies) {
    if (!e.alive) continue;
    ctx.font = "24px serif";
    ctx.textAlign = "center";
    ctx.fillText("\u{1F41E}", e.x + e.w / 2, e.y + e.h - 2);
  }

  for (const proj of state.projectiles) {
    ctx.font = "16px serif";
    ctx.textAlign = "center";
    ctx.fillText("\u{1F9B4}", proj.x, proj.y + 5);
  }

  // player
  const p = state.player;
  const flicker = p.invulnTimer > 0 && Math.floor(state.elapsed * 14) % 2 === 0;
  ctx.save();
  ctx.globalAlpha = flicker ? 0.4 : 1;
  ctx.translate(p.x + p.w / 2, p.y + p.h / 2);
  ctx.scale(p.facing, 1);
  ctx.font = "30px serif";
  ctx.textAlign = "center";
  ctx.fillText("\u{1F431}", 0, 10);
  ctx.restore();

  if (state.lastHitFlash > 0) {
    ctx.fillStyle = `rgba(239,68,68,${Math.min(0.3, state.lastHitFlash)})`;
    ctx.fillRect(state.camX, 0, width / scale, height / scale);
  }

  ctx.restore();
}