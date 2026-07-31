// Tile codes
export const TILE = {
  EMPTY: 0,
  GROUND: 1,
  PLATFORM: 2,
  MYSTERY: 3,
  MYSTERY_USED: 4,
  SPIKE: 5,
  FLAG: 6,
} as const;
export type TileCode = (typeof TILE)[keyof typeof TILE];

export const TILE_SIZE = 32;
export const WORLDS = 5;
export const LEVELS_PER_WORLD = 4;
export const TOTAL_LEVELS = WORLDS * LEVELS_PER_WORLD;
export const GRID_H = 9;

export interface EnemyEntity {
  id: number;
  x: number;
  y: number;
  w: number;
  h: number;
  vx: number;
  minX: number;
  maxX: number;
  alive: boolean;
}

export interface CoinEntity {
  id: number;
  x: number;
  y: number;
  collected: boolean;
}

export interface CloverEntity {
  id: number;
  x: number;
  y: number;
  collected: boolean;
}

export interface Projectile {
  id: number;
  x: number;
  y: number;
  vx: number;
  active: boolean;
}

export interface LevelData {
  world: number;
  levelInWorld: number;
  tiles: TileCode[][]; // [col][row]
  width: number;
  enemies: EnemyEntity[];
  coins: CoinEntity[];
  clovers: CloverEntity[];
  flagCol: number;
  spawnX: number;
  spawnY: number;
  timeLimit: number;
}

export interface PlayerState {
  x: number;
  y: number;
  vx: number;
  vy: number;
  w: number;
  h: number;
  onGround: boolean;
  jumpsUsed: number;
  facing: 1 | -1;
  invulnTimer: number;
  throwCooldown: number;
}

export interface GameState {
  level: LevelData;
  player: PlayerState;
  projectiles: Projectile[];
  camX: number;
  score: number;
  lives: number;
  timeLeft: number;
  cloversCollected: number;
  status: "playing" | "won" | "dead" | "timeup";
  nextId: number;
  elapsed: number;
  lastHitFlash: number;
}

function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function generateLevel(levelNumber: number): LevelData {
  // levelNumber: 1..20
  const world = Math.floor((levelNumber - 1) / LEVELS_PER_WORLD);
  const levelInWorld = (levelNumber - 1) % LEVELS_PER_WORLD;
  const difficulty = world * LEVELS_PER_WORLD + levelInWorld;
  const rand = mulberry32(levelNumber * 7919 + 13);

  const width = 34 + world * 4 + levelInWorld * 2;
  const groundRow = GRID_H - 1;
  const tiles: TileCode[][] = Array.from({ length: width }, () =>
    Array(GRID_H).fill(TILE.EMPTY) as TileCode[]
  );

  // base ground with pits
  let col = 0;
  while (col < width) {
    const pitChance = Math.min(0.28, 0.06 + difficulty * 0.012);
    const isPit = col > 3 && col < width - 4 && rand() < pitChance;
    if (isPit) {
      const pitLen = 1 + Math.floor(rand() * Math.min(3, 1 + Math.floor(difficulty / 6)));
      col += pitLen;
      continue;
    }
    tiles[col][groundRow] = TILE.GROUND;
    col++;
  }

  // floating platforms + mystery blocks
  const enemies: EnemyEntity[] = [];
  const coins: CoinEntity[] = [];
  const clovers: CloverEntity[] = [];
  let nextId = 1;

  for (let c = 4; c < width - 4; c += 3 + Math.floor(rand() * 3)) {
    if (rand() < 0.55) {
      const row = groundRow - (2 + Math.floor(rand() * 3));
      const len = 2 + Math.floor(rand() * 3);
      for (let k = 0; k < len && c + k < width - 1; k++) {
        tiles[c + k][row] = TILE.PLATFORM;
        if (rand() < 0.3) tiles[c + k][row - 1] = TILE.MYSTERY;
        else if (rand() < 0.5) {
          coins.push({ id: nextId++, x: (c + k) * TILE_SIZE + TILE_SIZE / 2, y: row * TILE_SIZE, collected: false });
        }
      }
    }
  }

  // ground-level coins
  for (let c = 2; c < width - 2; c++) {
    if (tiles[c][groundRow] === TILE.GROUND && rand() < 0.12) {
      coins.push({ id: nextId++, x: c * TILE_SIZE + TILE_SIZE / 2, y: (groundRow - 1) * TILE_SIZE, collected: false });
    }
  }

  // enemies patrolling on solid ground stretches
  let stretchStart = -1;
  for (let c = 0; c <= width; c++) {
    const solid = c < width && tiles[c][groundRow] === TILE.GROUND;
    if (solid && stretchStart === -1) stretchStart = c;
    if ((!solid || c === width) && stretchStart !== -1) {
      const len = c - stretchStart;
      if (len >= 5 && rand() < 0.5 + difficulty * 0.02 && stretchStart > 3) {
        const ex = (stretchStart + 1) * TILE_SIZE;
        enemies.push({
          id: nextId++,
          x: ex,
          y: (groundRow - 1) * TILE_SIZE,
          w: 26,
          h: 26,
          vx: rand() < 0.5 ? -40 : 40,
          minX: stretchStart * TILE_SIZE,
          maxX: (stretchStart + len - 1) * TILE_SIZE,
          alive: true,
        });
      }
      stretchStart = -1;
    }
  }

  // 3 golden clovers spread across the level
  const cloverCols = [
    Math.floor(width * 0.3),
    Math.floor(width * 0.55),
    Math.floor(width * 0.8),
  ];
  for (const cc of cloverCols) {
    let row = groundRow - 1;
    for (let r = groundRow - 1; r >= 1; r--) {
      if (tiles[cc][r] === TILE.PLATFORM || tiles[cc][r] === TILE.GROUND) {
        row = r - 1;
        break;
      }
    }
    clovers.push({ id: nextId++, x: cc * TILE_SIZE + TILE_SIZE / 2, y: row * TILE_SIZE, collected: false });
  }

  // flag near the end, ensure solid ground beneath
  const flagCol = width - 2;
  for (let r = 0; r < GRID_H; r++) tiles[flagCol][r] = TILE.EMPTY;
  tiles[flagCol][groundRow] = TILE.GROUND;
  tiles[flagCol][groundRow - 1] = TILE.FLAG;
  if (tiles[flagCol - 1][groundRow] !== TILE.GROUND) tiles[flagCol - 1][groundRow] = TILE.GROUND;
  if (tiles[width - 1][groundRow] !== TILE.GROUND) tiles[width - 1][groundRow] = TILE.GROUND;

  // guarantee spawn area is solid
  tiles[0][groundRow] = TILE.GROUND;
  tiles[1][groundRow] = TILE.GROUND;
  tiles[2][groundRow] = TILE.GROUND;

  const timeLimit = Math.max(55, 95 - difficulty * 2);

  return {
    world,
    levelInWorld,
    tiles,
    width,
    enemies,
    coins,
    clovers,
    flagCol,
    spawnX: TILE_SIZE * 1.2,
    spawnY: (groundRow - 2) * TILE_SIZE,
    timeLimit,
  };
}

export function createInitialState(levelNumber: number): GameState {
  const level = generateLevel(levelNumber);
  return {
    level,
    player: {
      x: level.spawnX,
      y: level.spawnY,
      vx: 0,
      vy: 0,
      w: 24,
      h: 28,
      onGround: false,
      jumpsUsed: 0,
      facing: 1,
      invulnTimer: 0,
      throwCooldown: 0,
    },
    projectiles: [],
    camX: 0,
    score: 0,
    lives: 3,
    timeLeft: level.timeLimit,
    cloversCollected: 0,
    status: "playing",
    nextId: 1000,
    elapsed: 0,
    lastHitFlash: 0,
  };
}

export interface InputFlags {
  left: boolean;
  right: boolean;
  jumpPressed: boolean;
  throwPressed: boolean;
}

const GRAVITY = 1500;
const MOVE_SPEED = 150;
const JUMP_VELOCITY = -430;
const MAX_FALL = 900;

function tileAt(level: LevelData, col: number, row: number): TileCode {
  if (col < 0 || col >= level.width || row < 0 || row >= GRID_H) return TILE.EMPTY;
  return level.tiles[col][row];
}

function isSolid(t: TileCode) {
  return t === TILE.GROUND || t === TILE.PLATFORM || t === TILE.MYSTERY || t === TILE.MYSTERY_USED;
}

function respawnPlayer(state: GameState) {
  state.lives -= 1;
  if (state.lives <= 0) {
    state.status = "dead";
    return;
  }
  state.player.x = state.level.spawnX;
  state.player.y = state.level.spawnY;
  state.player.vx = 0;
  state.player.vy = 0;
  state.player.invulnTimer = 1.5;
  state.camX = 0;
}

export function update(state: GameState, dt: number, input: InputFlags) {
  if (state.status !== "playing") return;
  state.elapsed += dt;
  state.timeLeft -= dt;
  if (state.lastHitFlash > 0) state.lastHitFlash -= dt;
  if (state.timeLeft <= 0) {
    state.timeLeft = 0;
    state.status = "timeup";
    return;
  }

  const p = state.player;
  if (p.invulnTimer > 0) p.invulnTimer -= dt;
  if (p.throwCooldown > 0) p.throwCooldown -= dt;

  // horizontal input
  p.vx = 0;
  if (input.left) {
    p.vx = -MOVE_SPEED;
    p.facing = -1;
  }
  if (input.right) {
    p.vx = MOVE_SPEED;
    p.facing = 1;
  }

  if (input.jumpPressed && p.jumpsUsed < 2) {
    p.vy = JUMP_VELOCITY * (p.jumpsUsed === 0 ? 1 : 0.85);
    p.jumpsUsed += 1;
    p.onGround = false;
  }

  if (input.throwPressed && p.throwCooldown <= 0) {
    p.throwCooldown = 0.4;
    state.projectiles.push({
      id: state.nextId++,
      x: p.x + (p.facing === 1 ? p.w : 0),
      y: p.y + p.h / 2,
      vx: p.facing * 320,
      active: true,
    });
  }

  // gravity
  p.vy = Math.min(MAX_FALL, p.vy + GRAVITY * dt);

  // horizontal move + collision
  let newX = p.x + p.vx * dt;
  const dir = Math.sign(p.vx);
  if (dir !== 0) {
    const checkCol = dir > 0 ? Math.floor((newX + p.w) / TILE_SIZE) : Math.floor(newX / TILE_SIZE);
    const rowTop = Math.floor(p.y / TILE_SIZE);
    const rowBot = Math.floor((p.y + p.h - 1) / TILE_SIZE);
    for (let r = rowTop; r <= rowBot; r++) {
      if (isSolid(tileAt(state.level, checkCol, r))) {
        newX = dir > 0 ? checkCol * TILE_SIZE - p.w : (checkCol + 1) * TILE_SIZE;
        break;
      }
    }
  }
  p.x = Math.max(0, newX);

  // vertical move + collision
  let newY = p.y + p.vy * dt;
  p.onGround = false;
  if (p.vy > 0) {
    const rowCheck = Math.floor((newY + p.h) / TILE_SIZE);
    const colL = Math.floor(p.x / TILE_SIZE);
    const colR = Math.floor((p.x + p.w - 1) / TILE_SIZE);
    for (const c of [colL, colR]) {
      const t = tileAt(state.level, c, rowCheck);
      if (isSolid(t)) {
        newY = rowCheck * TILE_SIZE - p.h;
        p.vy = 0;
        p.onGround = true;
        p.jumpsUsed = 0;
        break;
      }
    }
  } else if (p.vy < 0) {
    const rowCheck = Math.floor(newY / TILE_SIZE);
    const colL = Math.floor(p.x / TILE_SIZE);
    const colR = Math.floor((p.x + p.w - 1) / TILE_SIZE);
    for (const c of [colL, colR]) {
      const t = tileAt(state.level, c, rowCheck);
      if (isSolid(t)) {
        newY = (rowCheck + 1) * TILE_SIZE;
        p.vy = 0;
        if (t === TILE.MYSTERY) {
          state.level.tiles[c][rowCheck] = TILE.MYSTERY_USED;
          state.score += 20;
          state.level.coins.push({
            id: state.nextId++,
            x: c * TILE_SIZE + TILE_SIZE / 2,
            y: rowCheck * TILE_SIZE - TILE_SIZE,
            collected: false,
          });
        }
        break;
      }
    }
  }
  p.y = newY;

  // fell into pit
  if (p.y > GRID_H * TILE_SIZE + 40) {
    respawnPlayer(state);
    return;
  }

  // spikes
  const pc = Math.floor((p.x + p.w / 2) / TILE_SIZE);
  const prow = Math.floor((p.y + p.h) / TILE_SIZE);
  if (tileAt(state.level, pc, prow) === TILE.SPIKE && p.invulnTimer <= 0) {
    state.lastHitFlash = 0.4;
    respawnPlayer(state);
    return;
  }

  // camera follows player (clamped to level bounds)
  const viewTiles = 12;
  const maxCam = Math.max(0, state.level.width * TILE_SIZE - viewTiles * TILE_SIZE);
  state.camX = Math.min(maxCam, Math.max(0, p.x - viewTiles * TILE_SIZE * 0.4));

  // enemies
  for (const e of state.level.enemies) {
    if (!e.alive) continue;
    e.x += e.vx * dt;
    if (e.x < e.minX || e.x + e.w > e.maxX) {
      e.vx *= -1;
      e.x = Math.max(e.minX, Math.min(e.x, e.maxX - e.w));
    }
    const overlap =
      p.x < e.x + e.w && p.x + p.w > e.x && p.y < e.y + e.h && p.y + p.h > e.y;
    if (overlap) {
      const stomp = p.vy > 0 && p.y + p.h - e.y < 14;
      if (stomp) {
        e.alive = false;
        p.vy = JUMP_VELOCITY * 0.55;
        state.score += 50;
      } else if (p.invulnTimer <= 0) {
        state.lastHitFlash = 0.4;
        respawnPlayer(state);
        return;
      }
    }
  }

  // projectiles
  for (const proj of state.projectiles) {
    if (!proj.active) continue;
    proj.x += proj.vx * dt;
    if (proj.x < state.camX - 60 || proj.x > state.camX + 900) proj.active = false;
    for (const e of state.level.enemies) {
      if (!e.alive) continue;
      if (proj.x > e.x && proj.x < e.x + e.w && Math.abs(proj.y - (e.y + e.h / 2)) < 20) {
        e.alive = false;
        proj.active = false;
        state.score += 50;
        break;
      }
    }
  }
  state.projectiles = state.projectiles.filter((pr) => pr.active);

  // coins
  for (const c of state.level.coins) {
    if (c.collected) continue;
    if (
      p.x < c.x + 10 &&
      p.x + p.w > c.x - 10 &&
      p.y < c.y + 10 &&
      p.y + p.h > c.y - 10
    ) {
      c.collected = true;
      state.score += 10;
    }
  }

  // clovers
  for (const cl of state.level.clovers) {
    if (cl.collected) continue;
    if (
      p.x < cl.x + 12 &&
      p.x + p.w > cl.x - 12 &&
      p.y < cl.y + 12 &&
      p.y + p.h > cl.y - 12
    ) {
      cl.collected = true;
      state.cloversCollected += 1;
      state.score += 100;
    }
  }

  // flag
  const flagPixelX = state.level.flagCol * TILE_SIZE;
  if (p.x + p.w > flagPixelX) {
    state.score += Math.round(state.timeLeft * 5);
    state.status = "won";
  }
}

export function computeStars(state: GameState): 0 | 1 | 2 | 3 {
  if (state.status !== "won") return 0;
  if (state.cloversCollected >= 3) return 3;
  if (state.cloversCollected >= 1) return 2;
  return 1;
}