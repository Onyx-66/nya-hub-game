// =============================================
// Paws Merge Renderer — canvas drawing for cute cat paws
// =============================================
import type { PawsMergeEngine, Paw } from "../logic/pawsMergeEngine";
import { TIERS } from "../logic/pawsMergeEngine";

export interface MergeParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
}

export function renderContainer(ctx: CanvasRenderingContext2D, engine: PawsMergeEngine, frame: number): void {
  const w = engine.containerWidth;
  const h = engine.containerHeight;

  // Background gradient
  const bg = ctx.createLinearGradient(0, 0, 0, h);
  bg.addColorStop(0, "#FEF3C7");
  bg.addColorStop(1, "#FDE68A");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  // Container border
  ctx.strokeStyle = "#D97706";
  ctx.lineWidth = 3;
  roundRectPath(ctx, 1.5, 1.5, w - 3, h - 3, 12);
  ctx.stroke();

  // Warning line — dashed red, pulsing
  const pulse = 0.4 + Math.sin(frame * 0.08) * 0.2;
  ctx.strokeStyle = `rgba(239, 68, 68, ${pulse})`;
  ctx.lineWidth = 2;
  ctx.setLineDash([8, 6]);
  ctx.beginPath();
  ctx.moveTo(0, engine.warningLineY);
  ctx.lineTo(w, engine.warningLineY);
  ctx.stroke();
  ctx.setLineDash([]);

  // Floor line
  ctx.strokeStyle = "#92400E";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, h - 1);
  ctx.lineTo(w, h - 1);
  ctx.stroke();
}

export function renderPaws(ctx: CanvasRenderingContext2D, paws: Paw[], frame: number): void {
  for (const paw of paws) {
    drawPaw(ctx, paw, frame);
  }
}

function drawPaw(ctx: CanvasRenderingContext2D, paw: Paw, frame: number): void {
  const { x, y, radius, color, tier } = paw;
  const r = radius;

  // Shadow
  ctx.fillStyle = "rgba(0,0,0,0.15)";
  ctx.beginPath();
  ctx.ellipse(x + 2, y + 4, r * 0.9, r * 0.3, 0, 0, Math.PI * 2);
  ctx.fill();

  // Base circle
  const grad = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, r * 0.1, x, y, r);
  grad.addColorStop(0, lightenColor(color, 25));
  grad.addColorStop(1, color);
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();

  // Highlight
  ctx.fillStyle = "rgba(255,255,255,0.35)";
  ctx.beginPath();
  ctx.ellipse(x - r * 0.35, y - r * 0.35, r * 0.3, r * 0.2, -0.5, 0, Math.PI * 2);
  ctx.fill();

  // Paw print pattern (4 toe pads + main pad)
  const padColor = darkenColor(color, 20);
  ctx.fillStyle = padColor;
  // Main pad (bottom center)
  ctx.beginPath();
  ctx.ellipse(x, y + r * 0.35, r * 0.28, r * 0.22, 0, 0, Math.PI * 2);
  ctx.fill();
  // Toe pads
  for (let i = 0; i < 4; i++) {
    const angle = -Math.PI / 2 + (i - 1.5) * 0.35;
    const tx = x + Math.cos(angle) * r * 0.55;
    const ty = y + Math.sin(angle) * r * 0.55 - r * 0.05;
    ctx.beginPath();
    ctx.ellipse(tx, ty, r * 0.13, r * 0.16, angle + Math.PI / 2, 0, Math.PI * 2);
    ctx.fill();
  }

  // Special details per tier
  if (tier === 7) {
    // Cheetah spots
    ctx.fillStyle = darkenColor(color, 30);
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2 + frame * 0.01;
      const sx = x + Math.cos(a) * r * 0.5;
      const sy = y + Math.sin(a) * r * 0.5;
      ctx.beginPath();
      ctx.arc(sx, sy, r * 0.06, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (tier === 11) {
    // Tiger stripes
    ctx.strokeStyle = darkenColor(color, 25);
    ctx.lineWidth = 2;
    for (let i = 0; i < 5; i++) {
      const angle = (i / 5) * Math.PI - Math.PI / 2;
      ctx.beginPath();
      ctx.moveTo(x + Math.cos(angle) * r * 0.4, y + Math.sin(angle) * r * 0.4);
      ctx.lineTo(x + Math.cos(angle) * r * 0.75, y + Math.sin(angle) * r * 0.75);
      ctx.stroke();
    }
  } else if (tier === 9) {
    // Panther — subtle shine
    ctx.fillStyle = "rgba(255,255,255,0.08)";
    ctx.beginPath();
    ctx.arc(x - r * 0.2, y - r * 0.2, r * 0.4, 0, Math.PI * 2);
    ctx.fill();
  }

  // Face — eyes
  const eyeR = r * 0.07;
  const eyeOffset = r * 0.28;
  ctx.fillStyle = "rgba(0,0,0,0.7)";
  ctx.beginPath();
  ctx.arc(x - eyeOffset, y - r * 0.15, eyeR, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + eyeOffset, y - r * 0.15, eyeR, 0, Math.PI * 2);
  ctx.fill();
  // Eye sparkles
  ctx.fillStyle = "rgba(255,255,255,0.8)";
  ctx.beginPath();
  ctx.arc(x - eyeOffset + eyeR * 0.4, y - r * 0.15 - eyeR * 0.3, eyeR * 0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + eyeOffset + eyeR * 0.4, y - r * 0.15 - eyeR * 0.3, eyeR * 0.3, 0, Math.PI * 2);
  ctx.fill();

  // Mouth — small smile
  ctx.strokeStyle = "rgba(0,0,0,0.5)";
  ctx.lineWidth = Math.max(1, r * 0.04);
  ctx.beginPath();
  ctx.arc(x, y + r * 0.05, r * 0.12, 0.3, Math.PI - 0.3);
  ctx.stroke();
}

export function renderDropPreview(
  ctx: CanvasRenderingContext2D,
  engine: PawsMergeEngine,
  frame: number,
): void {
  if (engine.state !== "aiming") return;

  const tier = engine.currentPawTier;
  const def = TIERS[tier - 1];
  const x = engine.dropX;
  const r = def.radius;

  // Dotted vertical line
  ctx.strokeStyle = "rgba(147, 51, 234, 0.4)";
  ctx.lineWidth = 2;
  ctx.setLineDash([4, 6]);
  ctx.beginPath();
  ctx.moveTo(x, r);
  ctx.lineTo(x, engine.containerHeight);
  ctx.stroke();
  ctx.setLineDash([]);

  // Ghost paw (semi-transparent)
  ctx.globalAlpha = 0.5;
  const ghostPaw: Paw = {
    id: "ghost",
    tier,
    x,
    y: r + 5,
    vx: 0,
    vy: 0,
    radius: r,
    color: def.color,
    name: def.name,
    isResting: true,
    merged: false,
  };
  drawPaw(ctx, ghostPaw, frame);
  ctx.globalAlpha = 1;
}

export function renderNextQueue(ctx: CanvasRenderingContext2D, engine: PawsMergeEngine, frame: number): void {
  const w = engine.containerWidth;
  // Background panel
  ctx.fillStyle = "rgba(0,0,0,0.1)";
  roundRectPath(ctx, w - 56, 8, 48, 90, 8);
  ctx.fill();

  ctx.fillStyle = "#92400E";
  ctx.font = "bold 9px Nunito, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("NEXT", w - 32, 20);

  const queue = engine.nextQueue.slice(0, 3);
  for (let i = 0; i < queue.length; i++) {
    const tier = queue[i];
    const def = TIERS[tier - 1];
    const previewR = Math.min(12, def.radius * 0.4);
    const py = 36 + i * 20;
    const miniPaw: Paw = {
      id: `next_${i}`,
      tier,
      x: w - 32,
      y: py,
      vx: 0,
      vy: 0,
      radius: previewR,
      color: def.color,
      name: def.name,
      isResting: true,
      merged: false,
    };
    drawPaw(ctx, miniPaw, frame);
  }
}

export function renderProgressionBar(
  ctx: CanvasRenderingContext2D,
  engine: PawsMergeEngine,
  barY: number,
  barWidth: number,
  barX: number,
  frame: number,
): void {
  const maxTier = engine.maxTierReached;
  const iconR = 7;
  const spacing = (barWidth - iconR * 2) / 10;

  for (let i = 0; i < 11; i++) {
    const tier = (i + 1) as PawTier;
    const def = TIERS[i];
    const cx = barX + iconR + spacing * i;
    const cy = barY;

    if (tier <= maxTier) {
      // Unlocked — full color
      ctx.fillStyle = def.color;
      ctx.beginPath();
      ctx.arc(cx, cy, iconR, 0, Math.PI * 2);
      ctx.fill();
      if (tier === maxTier) {
        // Glow on current max
        ctx.strokeStyle = "#FBBF24";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(cx, cy, iconR + 3, 0, Math.PI * 2);
        ctx.stroke();
      }
    } else {
      // Not yet reached — greyed
      ctx.fillStyle = "rgba(0,0,0,0.15)";
      ctx.beginPath();
      ctx.arc(cx, cy, iconR, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "rgba(0,0,0,0.2)";
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  }
}

export function renderMergeEffects(ctx: CanvasRenderingContext2D, particles: MergeParticle[]): void {
  for (const p of particles) {
    const alpha = p.life / p.maxLife;
    ctx.globalAlpha = alpha;
    // Star particle
    ctx.fillStyle = p.color;
    drawStarShape(ctx, p.x, p.y, 5, p.size * alpha, p.size * 0.4 * alpha);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

export function updateMergeParticles(particles: MergeParticle[], dt: number): void {
  for (const p of particles) {
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.vy += 200 * dt;
    p.life -= dt;
  }
}

export function spawnMergeParticles(x: number, y: number, color: string, particles: MergeParticle[]): void {
  for (let i = 0; i < 12; i++) {
    const angle = (Math.PI * 2 * i) / 12;
    const speed = 60 + Math.random() * 80;
    particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 0.6 + Math.random() * 0.3,
      maxLife: 0.9,
      size: 3 + Math.random() * 3,
      color,
    });
  }
}

// ── Helpers ──

function roundRectPath(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number): void {
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

function drawStarShape(ctx: CanvasRenderingContext2D, cx: number, cy: number, spikes: number, outerR: number, innerR: number): void {
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
  ctx.closePath();
}

function lightenColor(hex: string, percent: number): string {
  const num = parseInt(hex.replace("#", ""), 16);
  const r = Math.min(255, (num >> 16) + percent);
  const g = Math.min(255, ((num >> 8) & 0xff) + percent);
  const b = Math.min(255, (num & 0xff) + percent);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}

function darkenColor(hex: string, percent: number): string {
  return lightenColor(hex, -percent);
}