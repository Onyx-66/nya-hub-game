// =============================================
// FuriousFelinesEngine — 2D physics slingshot engine.
// =============================================

export interface Vector2 { x: number; y: number; }

export interface GameObject {
  id: string;
  type: 'cat' | 'block' | 'ground' | 'enemy';
  position: Vector2;
  velocity: Vector2;
  width: number;
  height: number;
  rotation: number;
  angularVelocity: number;
  health: number;
  maxHealth: number;
  color: string;
  isStatic: boolean;
  catType?: 'basic' | 'heavy' | 'bomber';
  material?: 'wood' | 'stone' | 'glass';
  enemyType?: 'dog' | 'boss';
  radius?: number;
  exploding?: boolean;
  explosionTimer?: number;
}

export interface Particle {
  position: Vector2;
  velocity: Vector2;
  color: string;
  life: number;
  maxLife: number;
  size: number;
}

export interface CatConfig { x: number; y: number; type: 'basic' | 'heavy' | 'bomber'; }
export interface BlockConfig { x: number; y: number; width: number; height: number; material: 'wood' | 'stone' | 'glass'; }
export interface EnemyConfig { x: number; y: number; type: 'dog' | 'boss'; }
export interface LevelData { cats: CatConfig[]; blocks: BlockConfig[]; enemies: EnemyConfig[]; }

export const CANVAS_WIDTH = 480;
export const CANVAS_HEIGHT = 640;
export const GROUND_Y = 520;

const MATERIAL_COLORS: Record<string, string> = {
  wood: '#8B4513',
  stone: '#808080',
  glass: '#87CEEB',
};

const CAT_COLORS: Record<string, string> = {
  basic: '#FFA500',
  heavy: '#6B7280',
  bomber: '#1F2937',
};

export class FuriousFelinesEngine {
  objects: GameObject[] = [];
  particles: Particle[] = [];
  currentCat: GameObject | null = null;
  currentCatIndex = 0;
  isDragging = false;
  dragStart: Vector2 = { x: 0, y: 0 };
  dragCurrent: Vector2 = { x: 0, y: 0 };
  score = 0;
  level: number;
  state: 'aiming' | 'flying' | 'complete' | 'failed' = 'aiming';

  readonly GRAVITY = 800;
  readonly MAX_DRAG = 120;
  readonly SLINGSHOT_POS: Vector2 = { x: 120, y: 400 };
  readonly RESTITUTION = 0.3;
  readonly SETTLE_THRESHOLD = 30;
  readonly SETTLE_TIME = 1.0;

  private catQueue: CatConfig[] = [];
  private nextId = 0;
  private settleTimer = 0;
  private flyingTime = 0;

  onScoreChange: ((score: number) => void) | null = null;
  onStateChange: ((state: string) => void) | null = null;
  onCatLaunched: ((catType: string) => void) | null = null;
  onHit: (() => void) | null = null;
  onDestroy: ((objType: string) => void) | null = null;

  constructor(level: number = 1) {
    this.level = level;
    this.loadLevel(level);
  }

  loadLevel(level: number): void {
    this.level = level;
    this.objects = [];
    this.particles = [];
    this.score = 0;
    this.currentCatIndex = 0;
    this.state = 'aiming';
    this.settleTimer = 0;
    this.flyingTime = 0;

    const data = this.getLevelData(level);

    // Ground
    this.objects.push({
      id: this.genId(), type: 'ground',
      position: { x: CANVAS_WIDTH / 2, y: GROUND_Y + 60 },
      velocity: { x: 0, y: 0 }, width: CANVAS_WIDTH, height: 120,
      rotation: 0, angularVelocity: 0,
      health: Infinity, maxHealth: Infinity,
      color: '#3B7A57', isStatic: true,
    });

    // Blocks
    for (const b of data.blocks) {
      const health = b.material === 'stone' ? 2 : 1;
      this.objects.push({
        id: this.genId(), type: 'block',
        position: { x: b.x, y: b.y }, velocity: { x: 0, y: 0 },
        width: b.width, height: b.height,
        rotation: 0, angularVelocity: 0,
        health, maxHealth: health,
        color: MATERIAL_COLORS[b.material], isStatic: false, material: b.material,
      });
    }

    // Enemies
    for (const e of data.enemies) {
      const isBoss = e.type === 'boss';
      const radius = isBoss ? 30 : 20;
      const health = isBoss ? 5 : 2;
      this.objects.push({
        id: this.genId(), type: 'enemy',
        position: { x: e.x, y: e.y }, velocity: { x: 0, y: 0 },
        width: radius * 2, height: radius * 2,
        rotation: 0, angularVelocity: 0,
        health, maxHealth: health,
        color: isBoss ? '#DC2626' : '#92400E', isStatic: false,
        enemyType: e.type, radius,
      });
    }

    this.catQueue = [...data.cats];
    this.loadNextCat();
  }

  private getLevelData(level: number): LevelData {
    if (level === 1) {
      return {
        cats: [
          { x: 120, y: 400, type: 'basic' },
          { x: 120, y: 400, type: 'basic' },
          { x: 120, y: 400, type: 'basic' },
        ],
        blocks: [
          { x: 300, y: 495, width: 20, height: 50, material: 'wood' },
          { x: 360, y: 495, width: 20, height: 50, material: 'wood' },
          { x: 330, y: 460, width: 80, height: 20, material: 'wood' },
          { x: 300, y: 425, width: 20, height: 40, material: 'wood' },
          { x: 360, y: 425, width: 20, height: 40, material: 'wood' },
          { x: 330, y: 395, width: 80, height: 20, material: 'wood' },
        ],
        enemies: [
          { x: 330, y: 500, type: 'dog' },
          { x: 330, y: 365, type: 'dog' },
        ],
      };
    }
    if (level === 2) {
      return {
        cats: [
          { x: 120, y: 400, type: 'basic' },
          { x: 120, y: 400, type: 'basic' },
          { x: 120, y: 400, type: 'heavy' },
        ],
        blocks: [
          { x: 280, y: 495, width: 20, height: 50, material: 'wood' },
          { x: 320, y: 495, width: 20, height: 50, material: 'wood' },
          { x: 360, y: 495, width: 20, height: 50, material: 'stone' },
          { x: 400, y: 495, width: 20, height: 50, material: 'stone' },
          { x: 300, y: 460, width: 60, height: 20, material: 'wood' },
          { x: 380, y: 460, width: 60, height: 20, material: 'stone' },
          { x: 340, y: 410, width: 120, height: 20, material: 'stone' },
        ],
        enemies: [
          { x: 300, y: 500, type: 'dog' },
          { x: 400, y: 500, type: 'dog' },
          { x: 340, y: 440, type: 'dog' },
          { x: 340, y: 375, type: 'boss' },
        ],
      };
    }
    return {
      cats: [
        { x: 120, y: 400, type: 'basic' },
        { x: 120, y: 400, type: 'basic' },
        { x: 120, y: 400, type: 'heavy' },
        { x: 120, y: 400, type: 'bomber' },
      ],
      blocks: [
        { x: 260, y: 495, width: 20, height: 50, material: 'stone' },
        { x: 300, y: 495, width: 20, height: 50, material: 'stone' },
        { x: 340, y: 495, width: 20, height: 50, material: 'stone' },
        { x: 380, y: 495, width: 20, height: 50, material: 'stone' },
        { x: 420, y: 495, width: 20, height: 50, material: 'stone' },
        { x: 280, y: 460, width: 60, height: 20, material: 'glass' },
        { x: 400, y: 460, width: 60, height: 20, material: 'glass' },
        { x: 320, y: 420, width: 120, height: 20, material: 'glass' },
        { x: 340, y: 385, width: 80, height: 30, material: 'stone' },
      ],
      enemies: [
        { x: 280, y: 500, type: 'dog' },
        { x: 340, y: 500, type: 'dog' },
        { x: 400, y: 500, type: 'dog' },
        { x: 340, y: 450, type: 'dog' },
        { x: 340, y: 350, type: 'boss' },
      ],
    };
  }

  private loadNextCat(): void {
    if (this.currentCatIndex >= this.catQueue.length) {
      this.state = this.isLevelComplete() ? 'complete' : 'failed';
      this.onStateChange?.(this.state);
      return;
    }
    const cfg = this.catQueue[this.currentCatIndex];
    const radius = cfg.type === 'heavy' ? 22 : 18;
    const health = cfg.type === 'heavy' ? 3 : 1;
    this.currentCat = {
      id: this.genId(), type: 'cat',
      position: { ...this.SLINGSHOT_POS }, velocity: { x: 0, y: 0 },
      width: radius * 2, height: radius * 2,
      rotation: 0, angularVelocity: 0,
      health, maxHealth: health,
      color: CAT_COLORS[cfg.type], isStatic: false,
      catType: cfg.type, radius,
    };
    this.state = 'aiming';
    this.onStateChange?.(this.state);
  }

  startDrag(x: number, y: number): void {
    if (this.state !== 'aiming' || !this.currentCat) return;
    this.isDragging = true;
    this.dragStart = { x, y };
    this.dragCurrent = { x, y };
  }

  updateDrag(x: number, y: number): void {
    if (!this.isDragging || !this.currentCat) return;
    let dx = x - this.SLINGSHOT_POS.x;
    let dy = y - this.SLINGSHOT_POS.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist > this.MAX_DRAG) {
      dx = (dx / dist) * this.MAX_DRAG;
      dy = (dy / dist) * this.MAX_DRAG;
    }
    this.dragCurrent = { x: this.SLINGSHOT_POS.x + dx, y: this.SLINGSHOT_POS.y + dy };
    this.currentCat.position = { ...this.dragCurrent };
  }

  launch(_x: number, _y: number): void {
    if (!this.isDragging || !this.currentCat) return;
    this.isDragging = false;
    const dx = this.SLINGSHOT_POS.x - this.dragCurrent.x;
    const dy = this.SLINGSHOT_POS.y - this.dragCurrent.y;
    const speedMult = this.currentCat.catType === 'heavy' ? 0.7 : 1;
    this.currentCat.velocity = { x: dx * 4.5 * speedMult, y: dy * 4.5 * speedMult };
    this.objects.push(this.currentCat);
    this.currentCat = null;
    this.currentCatIndex++;
    this.state = 'flying';
    this.flyingTime = 0;
    this.settleTimer = 0;
    this.onStateChange?.(this.state);
    this.onCatLaunched?.(this.catQueue[this.currentCatIndex - 1].type);
  }

  update(dt: number): void {
    if (this.state === 'complete' || this.state === 'failed') return;

    // Gravity + position update
    for (const o of this.objects) {
      if (o.isStatic || o.type === 'ground') continue;
      o.velocity.y += this.GRAVITY * dt;
      o.position.x += o.velocity.x * dt;
      o.position.y += o.velocity.y * dt;
      o.rotation += o.angularVelocity * dt;
    }

    // Remove objects below screen
    this.objects = this.objects.filter(o => {
      if (o.position.y > 800 && o.type !== 'ground') {
        if (o.type === 'enemy') {
          this.score += o.enemyType === 'boss' ? 2000 : 500;
          this.onScoreChange?.(this.score);
        }
        if (o.type === 'block') {
          this.score += 100;
          this.onScoreChange?.(this.score);
        }
        return false;
      }
      return true;
    });

    // Collisions
    for (let i = 0; i < this.objects.length; i++) {
      for (let j = i + 1; j < this.objects.length; j++) {
        this.resolveCollision(this.objects[i], this.objects[j]);
      }
    }

    // Bomber explosions
    for (const o of this.objects) {
      if (o.exploding && o.explosionTimer !== undefined) {
        o.explosionTimer -= dt;
        if (o.explosionTimer <= 0) {
          this.explode(o);
          o.health = 0;
        }
      }
    }

    // Remove dead + score
    this.objects = this.objects.filter(o => {
      if (o.health <= 0 && o.type !== 'ground') {
        if (o.type === 'block') {
          this.score += 100;
          this.createParticles(o.position.x, o.position.y, o.color, 8);
        } else if (o.type === 'enemy') {
          this.score += o.enemyType === 'boss' ? 2000 : 500;
          this.createParticles(o.position.x, o.position.y, o.color, 12);
        }
        this.onDestroy?.(o.type);
        this.onScoreChange?.(this.score);
        return false;
      }
      return true;
    });

    // Particles
    this.particles = this.particles.filter(p => {
      p.velocity.y += this.GRAVITY * dt * 0.5;
      p.position.x += p.velocity.x * dt;
      p.position.y += p.velocity.y * dt;
      p.life -= dt;
      return p.life > 0;
    });

    // Settling check
    if (this.state === 'flying') {
      this.flyingTime += dt;
      if (this.flyingTime > 0.3) {
        const allSettled = this.objects.every(o => {
          if (o.isStatic || o.type === 'ground') return true;
          return Math.sqrt(o.velocity.x ** 2 + o.velocity.y ** 2) < this.SETTLE_THRESHOLD;
        });
        if (allSettled) {
          this.settleTimer += dt;
          if (this.settleTimer >= this.SETTLE_TIME) {
            this.settleTimer = 0;
            this.flyingTime = 0;
            if (this.isLevelComplete()) {
              this.state = 'complete';
              this.onStateChange?.(this.state);
            } else if (this.currentCatIndex >= this.catQueue.length) {
              this.state = 'failed';
              this.onStateChange?.(this.state);
            } else {
              this.loadNextCat();
            }
          }
        } else {
          this.settleTimer = 0;
        }
      }
    }
  }

  private resolveCollision(a: GameObject, b: GameObject): void {
    const aL = a.position.x - a.width / 2, aR = a.position.x + a.width / 2;
    const aT = a.position.y - a.height / 2, aB = a.position.y + a.height / 2;
    const bL = b.position.x - b.width / 2, bR = b.position.x + b.width / 2;
    const bT = b.position.y - b.height / 2, bB = b.position.y + b.height / 2;
    if (aR < bL || aL > bR || aB < bT || aT > bB) return;

    const overlapX = Math.min(aR, bR) - Math.max(aL, bL);
    const overlapY = Math.min(aB, bB) - Math.max(aT, bT);
    const aStatic = a.isStatic || a.type === 'ground';
    const bStatic = b.isStatic || b.type === 'ground';

    if (overlapX < overlapY) {
      const dir = a.position.x < b.position.x ? -1 : 1;
      if (aStatic && !bStatic) { b.position.x -= dir * overlapX; b.velocity.x = -b.velocity.x * this.RESTITUTION; }
      else if (bStatic && !aStatic) { a.position.x += dir * overlapX; a.velocity.x = -a.velocity.x * this.RESTITUTION; }
      else if (!aStatic && !bStatic) {
        a.position.x += dir * overlapX / 2; b.position.x -= dir * overlapX / 2;
        const t = a.velocity.x; a.velocity.x = b.velocity.x * this.RESTITUTION; b.velocity.x = t * this.RESTITUTION;
      }
    } else {
      const dir = a.position.y < b.position.y ? -1 : 1;
      if (aStatic && !bStatic) { b.position.y -= dir * overlapY; b.velocity.y = -b.velocity.y * this.RESTITUTION; b.velocity.x *= 0.9; }
      else if (bStatic && !aStatic) { a.position.y += dir * overlapY; a.velocity.y = -a.velocity.y * this.RESTITUTION; a.velocity.x *= 0.9; }
      else if (!aStatic && !bStatic) {
        a.position.y += dir * overlapY / 2; b.position.y -= dir * overlapY / 2;
        const t = a.velocity.y; a.velocity.y = b.velocity.y * this.RESTITUTION; b.velocity.y = t * this.RESTITUTION;
      }
    }

    const relVel = Math.sqrt((a.velocity.x - b.velocity.x) ** 2 + (a.velocity.y - b.velocity.y) ** 2);
    if (relVel > 150) {
      const dmg = Math.floor(relVel / 150);
      const aDmg = a.type === 'cat' ? dmg * (a.catType === 'heavy' ? 2 : 1) : dmg;
      const bDmg = b.type === 'cat' ? dmg * (b.catType === 'heavy' ? 2 : 1) : dmg;
      if (!aStatic) { a.health -= bDmg; this.onHit?.(); }
      if (!bStatic) { b.health -= aDmg; this.onHit?.(); }
      if (a.type === 'cat' && a.catType === 'bomber' && !a.exploding) { a.exploding = true; a.explosionTimer = 0.1; }
      if (b.type === 'cat' && b.catType === 'bomber' && !b.exploding) { b.exploding = true; b.explosionTimer = 0.1; }
    }
  }

  private explode(cat: GameObject): void {
    const radius = 80;
    for (const o of this.objects) {
      if (o === cat || o.type === 'ground' || o.isStatic) continue;
      const dx = o.position.x - cat.position.x;
      const dy = o.position.y - cat.position.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < radius && dist > 0) {
        o.health -= 3;
        const force = (1 - dist / radius) * 400;
        o.velocity.x += (dx / dist) * force;
        o.velocity.y += (dy / dist) * force - 100;
      }
    }
    this.createParticles(cat.position.x, cat.position.y, '#FF4444', 20);
  }

  private createParticles(x: number, y: number, color: string, count: number): void {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 50 + Math.random() * 150;
      this.particles.push({
        position: { x, y }, velocity: { x: Math.cos(angle) * speed, y: Math.sin(angle) * speed - 50 },
        color, life: 0.5 + Math.random() * 0.5, maxLife: 1, size: 3 + Math.random() * 4,
      });
    }
  }

  getTrajectory(): Vector2[] {
    if (!this.isDragging || !this.currentCat) return [];
    const dx = this.SLINGSHOT_POS.x - this.dragCurrent.x;
    const dy = this.SLINGSHOT_POS.y - this.dragCurrent.y;
    const speedMult = this.currentCat.catType === 'heavy' ? 0.7 : 1;
    let vx = dx * 4.5 * speedMult, vy = dy * 4.5 * speedMult;
    let x = this.SLINGSHOT_POS.x, y = this.SLINGSHOT_POS.y;
    const pts: Vector2[] = [];
    const step = 0.04;
    for (let i = 0; i < 40; i++) {
      vy += this.GRAVITY * step;
      x += vx * step; y += vy * step;
      pts.push({ x, y });
      if (y > GROUND_Y || x > CANVAS_WIDTH || x < 0) break;
    }
    return pts;
  }

  getObjects(): GameObject[] { return this.objects; }
  getParticles(): Particle[] { return this.particles; }
  getScore(): number { return this.score; }
  getCatsLeft(): number { return Math.max(0, this.catQueue.length - this.currentCatIndex); }

  getSlingState() {
    const dx = this.dragCurrent.x - this.SLINGSHOT_POS.x;
    const dy = this.dragCurrent.y - this.SLINGSHOT_POS.y;
    return { dragging: this.isDragging, pullX: this.dragCurrent.x, pullY: this.dragCurrent.y, power: Math.min(1, Math.sqrt(dx * dx + dy * dy) / this.MAX_DRAG) };
  }

  isLevelComplete(): boolean { return !this.objects.some(o => o.type === 'enemy'); }
  isLevelFailed(): boolean { return this.currentCatIndex >= this.catQueue.length && !this.isLevelComplete(); }
  reset(): void { this.loadLevel(this.level); }
  private genId(): string { return `obj_${this.nextId++}`; }
}

export default FuriousFelinesEngine;