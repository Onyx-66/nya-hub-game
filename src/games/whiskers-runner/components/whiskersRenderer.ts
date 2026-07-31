import type { WhiskersState } from "../logic/whiskersEngine";
import { MAX_Z } from "../logic/whiskersEngine";

const HORIZON_RATIO = 0.3;

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function project(z: number, width: number, height: number) {
  const t = Math.min(1, Math.max(0, z / MAX_Z));
  const ease = Math.pow(t, 0.75);
  const horizonY = height * HORIZON_RATIO;
  const groundY = height * 0.96;
  const y = lerp(groundY, horizonY, ease);
  const scale = lerp(1, 0.12, Math.pow(t, 0.9));
  const laneWidth = lerp(width * 0.34, width * 0.015, Math.pow(t, 0.85));
  return { y, scale, laneWidth };
}

function laneX(width: number, lane: number, laneWidth: number) {
  return width / 2 + (lane - 1) * laneWidth;
}

export function renderFrame(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  state: WhiskersState,
  accent: string
) {
  ctx.clearRect(0, 0, width, height);

  // sky
  const sky = ctx.createLinearGradient(0, 0, 0, height * HORIZON_RATIO);
  sky.addColorStop(0, "#1a1025");
  sky.addColorStop(1, "#3b2a1a");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, width, height * HORIZON_RATIO);

  // ground corridor (trapezoid)
  const near = project(0.2, width, height);
  const far = project(MAX_Z, width, height);
  ctx.fillStyle = "#241a12";
  ctx.beginPath();
  ctx.moveTo(width / 2 - near.laneWidth * 1.5, near.y);
  ctx.lineTo(width / 2 + near.laneWidth * 1.5, near.y);
  ctx.lineTo(width / 2 + far.laneWidth * 1.5, far.y);
  ctx.lineTo(width / 2 - far.laneWidth * 1.5, far.y);
  ctx.closePath();
  ctx.fill();

  // lane dividers
  ctx.strokeStyle = "rgba(245,158,11,0.25)";
  ctx.lineWidth = 2;
  for (const laneEdge of [-0.5, 0.5]) {
    ctx.beginPath();
    ctx.moveTo(width / 2 + laneEdge * near.laneWidth * 2, near.y);
    ctx.lineTo(width / 2 + laneEdge * far.laneWidth * 2, far.y);
    ctx.stroke();
  }

  // hit flash vignette
  if (state.lastHitFlash > 0) {
    ctx.fillStyle = `rgba(239,68,68,${Math.min(0.35, state.lastHitFlash)})`;
    ctx.fillRect(0, 0, width, height);
  }

  // collect drawables sorted far -> near
  type Drawable = { z: number; draw: () => void };
  const drawables: Drawable[] = [];

  for (const o of state.obstacles) {
    if (o.z < -1 || o.z > MAX_Z + 2) continue;
    drawables.push({
      z: o.z,
      draw: () => {
        const { y, scale, laneWidth } = project(o.z, width, height);
        const x = laneX(width, o.lane, laneWidth);
        const w = laneWidth * 0.82;
        ctx.save();
        ctx.translate(x, y);
        ctx.scale(scale, scale);
        if (o.type === "wall") {
          ctx.fillStyle = "#7c5a3a";
          ctx.fillRect(-w / 2, -140, w, 140);
          ctx.strokeStyle = "#4a3320";
          ctx.lineWidth = 3;
          ctx.strokeRect(-w / 2, -140, w, 140);
        } else if (o.type === "pit") {
          ctx.fillStyle = "#0b0705";
          ctx.beginPath();
          ctx.ellipse(0, 8, w / 2, 16, 0, 0, Math.PI * 2);
          ctx.fill();
        } else if (o.type === "beam") {
          ctx.fillStyle = "#8a6d4b";
          ctx.fillRect(-w / 2, -170, w, 34);
          ctx.strokeStyle = "#4a3320";
          ctx.lineWidth = 3;
          ctx.strokeRect(-w / 2, -170, w, 34);
        }
        ctx.restore();
      },
    });
  }

  for (const f of state.fish) {
    if (f.collected || f.z < -1 || f.z > MAX_Z + 2) continue;
    drawables.push({
      z: f.z,
      draw: () => {
        const { y, scale, laneWidth } = project(f.z, width, height);
        const x = laneX(width, f.lane, laneWidth);
        ctx.save();
        ctx.translate(x, y - 60 * scale);
        ctx.font = `${Math.max(14, 40 * scale)}px serif`;
        ctx.textAlign = "center";
        ctx.fillText("🐟", 0, 0);
        ctx.restore();
      },
    });
  }

  drawables.sort((a, b) => b.z - a.z);
  drawables.forEach((d) => d.draw());

  // player cat
  const playerZ = 0.2;
  const { y: catY, laneWidth: catLaneWidth } = project(playerZ, width, height);
  const catX = laneX(width, state.lane, catLaneWidth);
  let vOffset = 0;
  let squash = 1;
  if (state.vertical === "jump") {
    const t = state.verticalTimer / 0.55;
    vOffset = -Math.sin(Math.min(1, 1 - t) * Math.PI) * 70;
  } else if (state.vertical === "slide") {
    squash = 0.55;
  }
  ctx.save();
  ctx.translate(catX, catY + vOffset);
  ctx.scale(1, squash);
  const flicker = state.invulnTimer > 0 && Math.floor(state.elapsed * 12) % 2 === 0;
  ctx.globalAlpha = flicker ? 0.4 : 1;
  ctx.font = "54px serif";
  ctx.textAlign = "center";
  ctx.fillText("🐱", 0, 0);
  ctx.restore();

  // accent glow line at horizon
  ctx.strokeStyle = accent;
  ctx.globalAlpha = 0.5;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, height * HORIZON_RATIO);
  ctx.lineTo(width, height * HORIZON_RATIO);
  ctx.stroke();
  ctx.globalAlpha = 1;
}