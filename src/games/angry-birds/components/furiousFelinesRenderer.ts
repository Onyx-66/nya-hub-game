// =============================================
// furiousFelinesRenderer — Canvas rendering for Furious Felines.
// =============================================

import type { FuriousFelinesEngine, GameObject, Particle } from "../logic/furiousFelinesEngine";
import { CANVAS_WIDTH, CANVAS_HEIGHT, GROUND_Y } from "../logic/furiousFelinesEngine";

export function renderBackground(ctx: CanvasRenderingContext2D): void {
  const grad = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
  grad.addColorStop(0, '#87CEEB');
  grad.addColorStop(0.6, '#B0E0E6');
  grad.addColorStop(1, '#E0F6FF');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // Ground strip
  ctx.fillStyle = '#3B7A57';
  ctx.fillRect(0, GROUND_Y, CANVAS_WIDTH, CANVAS_HEIGHT - GROUND_Y);
  ctx.fillStyle = '#2D6A47';
  ctx.fillRect(0, GROUND_Y, CANVAS_WIDTH, 6);

  // Distant hills
  ctx.fillStyle = '#5B9A6B';
  ctx.beginPath();
  ctx.arc(380, GROUND_Y, 80, Math.PI, 0);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(100, GROUND_Y, 60, Math.PI, 0);
  ctx.fill();
}

export function renderSlingshot(ctx: CanvasRenderingContext2D, engine: FuriousFelinesEngine): void {
  const { x, y } = engine.SLINGSHOT_POS;
  // Base trunk
  ctx.strokeStyle = '#5C3317';
  ctx.lineWidth = 10;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x, GROUND_Y);
  ctx.lineTo(x, y + 10);
  ctx.stroke();
  // Left fork
  ctx.beginPath();
  ctx.moveTo(x, y + 10);
  ctx.lineTo(x - 18, y - 20);
  ctx.stroke();
  // Right fork
  ctx.beginPath();
  ctx.moveTo(x, y + 10);
  ctx.lineTo(x + 18, y - 20);
  ctx.stroke();
}

export function renderSlingshotBand(ctx: CanvasRenderingContext2D, engine: FuriousFelinesEngine): void {
  const { x, y } = engine.SLINGSHOT_POS;
  const leftFork = { x: x - 18, y: y - 20 };
  const rightFork = { x: x + 18, y: y - 20 };
  const sling = engine.getSlingState();

  if (sling.dragging && engine.currentCat) {
    // Stretched band
    ctx.strokeStyle = '#4A2A0A';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(leftFork.x, leftFork.y);
    ctx.lineTo(sling.pullX, sling.pullY);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(rightFork.x, rightFork.y);
    ctx.lineTo(sling.pullX, sling.pullY);
    ctx.stroke();
  } else {
    // Slack band
    ctx.strokeStyle = '#4A2A0A';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(leftFork.x, leftFork.y);
    ctx.quadraticCurveTo(x, y - 15, rightFork.x, rightFork.y);
    ctx.stroke();
  }
}

function renderCat(ctx: CanvasRenderingContext2D, o: GameObject): void {
  const r = o.radius ?? 18;
  const cx = o.position.x, cy = o.position.y;

  // Body
  ctx.fillStyle = o.color;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();

  // Ears
  ctx.beginPath();
  ctx.moveTo(cx - r * 0.7, cy - r * 0.5);
  ctx.lineTo(cx - r * 0.4, cy - r * 1.1);
  ctx.lineTo(cx - r * 0.2, cy - r * 0.6);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(cx + r * 0.7, cy - r * 0.5);
  ctx.lineTo(cx + r * 0.4, cy - r * 1.1);
  ctx.lineTo(cx + r * 0.2, cy - r * 0.6);
  ctx.fill();

  // Eyes
  ctx.fillStyle = '#fff';
  ctx.beginPath(); ctx.arc(cx - r * 0.3, cy - r * 0.1, r * 0.22, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(cx + r * 0.3, cy - r * 0.1, r * 0.22, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#000';
  ctx.beginPath(); ctx.arc(cx - r * 0.3, cy - r * 0.1, r * 0.1, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(cx + r * 0.3, cy - r * 0.1, r * 0.1, 0, Math.PI * 2); ctx.fill();

  // Whiskers
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(cx - r * 0.5, cy + r * 0.2); ctx.lineTo(cx - r * 1.1, cy + r * 0.1);
  ctx.moveTo(cx - r * 0.5, cy + r * 0.35); ctx.lineTo(cx - r * 1.1, cy + r * 0.45);
  ctx.moveTo(cx + r * 0.5, cy + r * 0.2); ctx.lineTo(cx + r * 1.1, cy + r * 0.1);
  ctx.moveTo(cx + r * 0.5, cy + r * 0.35); ctx.lineTo(cx + r * 1.1, cy + r * 0.45);
  ctx.stroke();

  // Bomber red collar
  if (o.catType === 'bomber') {
    ctx.fillStyle = '#DC2626';
    ctx.fillRect(cx - r * 0.8, cy + r * 0.5, r * 1.6, r * 0.25);
    if (o.exploding && Math.floor(Date.now() / 100) % 2 === 0) {
      ctx.fillStyle = 'rgba(255,0,0,0.4)';
      ctx.beginPath(); ctx.arc(cx, cy, r * 1.5, 0, Math.PI * 2); ctx.fill();
    }
  }
}

function renderBlock(ctx: CanvasRenderingContext2D, o: GameObject): void {
  const x = o.position.x - o.width / 2;
  const y = o.position.y - o.height / 2;
  ctx.fillStyle = o.color;
  if (o.material === 'glass') ctx.globalAlpha = 0.6;
  roundRect(ctx, x, y, o.width, o.height, 4);
  ctx.fill();
  ctx.globalAlpha = 1;

  // Border
  ctx.strokeStyle = o.material === 'wood' ? '#5C3317' : o.material === 'stone' ? '#555' : '#4682B4';
  ctx.lineWidth = 1.5;
  roundRect(ctx, x, y, o.width, o.height, 4);
  ctx.stroke();

  // Wood grain
  if (o.material === 'wood') {
    ctx.strokeStyle = 'rgba(92,51,23,0.3)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x + 3, y + o.height * 0.3); ctx.lineTo(x + o.width - 3, y + o.height * 0.3);
    ctx.moveTo(x + 3, y + o.height * 0.7); ctx.lineTo(x + o.width - 3, y + o.height * 0.7);
    ctx.stroke();
  }

  // Damage cracks
  if (o.health < o.maxHealth) {
    ctx.strokeStyle = 'rgba(0,0,0,0.4)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x + o.width * 0.3, y + 2);
    ctx.lineTo(x + o.width * 0.5, y + o.height * 0.5);
    ctx.lineTo(x + o.width * 0.4, y + o.height - 2);
    ctx.stroke();
  }
}

function renderEnemy(ctx: CanvasRenderingContext2D, o: GameObject): void {
  const r = o.radius ?? 20;
  const cx = o.position.x, cy = o.position.y;
  const isBoss = o.enemyType === 'boss';

  // Body
  ctx.fillStyle = o.color;
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();

  // Floppy ears
  ctx.fillStyle = o.color;
  ctx.beginPath(); ctx.ellipse(cx - r * 0.8, cy - r * 0.3, r * 0.3, r * 0.5, -0.3, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(cx + r * 0.8, cy - r * 0.3, r * 0.3, r * 0.5, 0.3, 0, Math.PI * 2); ctx.fill();

  // Eyes
  ctx.fillStyle = '#fff';
  ctx.beginPath(); ctx.arc(cx - r * 0.3, cy - r * 0.15, r * 0.18, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(cx + r * 0.3, cy - r * 0.15, r * 0.18, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#000';
  ctx.beginPath(); ctx.arc(cx - r * 0.3, cy - r * 0.15, r * 0.08, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(cx + r * 0.3, cy - r * 0.15, r * 0.08, 0, Math.PI * 2); ctx.fill();

  // Tongue
  ctx.fillStyle = '#FF69B4';
  ctx.beginPath(); ctx.ellipse(cx, cy + r * 0.5, r * 0.2, r * 0.15, 0, 0, Math.PI * 2); ctx.fill();

  // Boss: spiked collar + angry brows
  if (isBoss) {
    ctx.fillStyle = '#333';
    ctx.fillRect(cx - r * 0.9, cy + r * 0.6, r * 1.8, r * 0.2);
    for (let i = 0; i < 5; i++) {
      const sx = cx - r * 0.8 + i * r * 0.4;
      ctx.beginPath();
      ctx.moveTo(sx, cy + r * 0.8);
      ctx.lineTo(sx + r * 0.1, cy + r * 1.0);
      ctx.lineTo(sx + r * 0.2, cy + r * 0.8);
      ctx.fill();
    }
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(cx - r * 0.6, cy - r * 0.5); ctx.lineTo(cx - r * 0.15, cy - r * 0.3);
    ctx.moveTo(cx + r * 0.6, cy - r * 0.5); ctx.lineTo(cx + r * 0.15, cy - r * 0.3);
    ctx.stroke();
  }

  // Health bar
  if (o.health < o.maxHealth) {
    const bw = r * 1.5;
    ctx.fillStyle = '#333';
    ctx.fillRect(cx - bw / 2, cy - r - 12, bw, 4);
    ctx.fillStyle = o.health / o.maxHealth > 0.5 ? '#22c55e' : '#ef4444';
    ctx.fillRect(cx - bw / 2, cy - r - 12, bw * (o.health / o.maxHealth), 4);
  }
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

export function renderObjects(ctx: CanvasRenderingContext2D, objects: GameObject[]): void {
  // Draw ground first
  for (const o of objects) {
    if (o.type === 'ground') { ctx.fillStyle = o.color; ctx.fillRect(o.position.x - o.width / 2, o.position.y - o.height / 2, o.width, o.height); }
  }
  // Then blocks
  for (const o of objects) { if (o.type === 'block') renderBlock(ctx, o); }
  // Then enemies
  for (const o of objects) { if (o.type === 'enemy') renderEnemy(ctx, o); }
  // Then cats
  for (const o of objects) { if (o.type === 'cat') renderCat(ctx, o); }
}

export function renderCurrentCat(ctx: CanvasRenderingContext2D, engine: FuriousFelinesEngine): void {
  if (engine.currentCat) renderCat(ctx, engine.currentCat);
}

export function renderParticles(ctx: CanvasRenderingContext2D, particles: Particle[]): void {
  for (const p of particles) {
    ctx.globalAlpha = Math.max(0, p.life / p.maxLife);
    ctx.fillStyle = p.color;
    ctx.fillRect(p.position.x - p.size / 2, p.position.y - p.size / 2, p.size, p.size);
  }
  ctx.globalAlpha = 1;
}

export function renderTrajectory(ctx: CanvasRenderingContext2D, engine: FuriousFelinesEngine): void {
  const pts = engine.getTrajectory();
  ctx.fillStyle = 'rgba(255,255,255,0.6)';
  for (let i = 0; i < pts.length; i += 2) {
    ctx.beginPath();
    ctx.arc(pts[i].x, pts[i].y, 3, 0, Math.PI * 2);
    ctx.fill();
  }
}

export function renderHUD(ctx: CanvasRenderingContext2D, score: number, level: number, catsLeft: number): void {
  // Score
  ctx.fillStyle = 'rgba(0,0,0,0.5)';
  roundRect(ctx, 10, 10, 100, 30, 8);
  ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 16px Nunito, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(`Score: ${score}`, 18, 30);

  // Level
  ctx.fillStyle = 'rgba(0,0,0,0.5)';
  roundRect(ctx, 195, 10, 90, 30, 8);
  ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.textAlign = 'center';
  ctx.fillText(`Level ${level}`, 240, 30);

  // Cats remaining
  ctx.textAlign = 'right';
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 14px Nunito, sans-serif';
  ctx.fillText(`Cats: ${catsLeft}`, 470, 30);
}