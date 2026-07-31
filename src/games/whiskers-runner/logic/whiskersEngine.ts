export type ObstacleType = "wall" | "pit" | "beam";
export type VerticalState = "run" | "jump" | "slide";

export interface Obstacle {
  id: number;
  lane: number;
  type: ObstacleType;
  z: number;
  passed: boolean;
}

export interface FishItem {
  id: number;
  lane: number;
  z: number;
  collected: boolean;
}

export interface WhiskersState {
  lane: number;
  vertical: VerticalState;
  verticalTimer: number;
  distance: number;
  speed: number;
  baseSpeed: number;
  score: number;
  lives: number;
  maxLives: number;
  guardGap: number;
  fishCollected: number;
  closeCalls: number;
  obstacles: Obstacle[];
  fish: FishItem[];
  invulnTimer: number;
  gameOver: boolean;
  gameOverReason: "" | "wall" | "pit" | "beam" | "guard";
  nextId: number;
  spawnAccumulator: number;
  elapsed: number;
  lastHitFlash: number;
}

export const LANES = 3;
export const MAX_Z = 34;
const HIT_Z = 1.4;
const SEGMENT_LENGTH = 6.5;

function randLane(exclude: number[] = []): number {
  const options = [0, 1, 2].filter((l) => !exclude.includes(l));
  return options[Math.floor(Math.random() * options.length)];
}

function randObstacleType(): ObstacleType {
  const r = Math.random();
  if (r < 0.36) return "pit";
  if (r < 0.68) return "beam";
  return "wall";
}

function spawnSegmentAt(state: WhiskersState, z: number) {
  const blockedLanes = new Set<number>();
  const roll = Math.random();

  if (roll < 0.5) {
    const lane = randLane();
    state.obstacles.push({ id: state.nextId++, lane, type: randObstacleType(), z, passed: false });
    blockedLanes.add(lane);
  } else if (roll < 0.82) {
    const openLane = randLane();
    [0, 1, 2]
      .filter((l) => l !== openLane)
      .forEach((lane) => {
        state.obstacles.push({ id: state.nextId++, lane, type: randObstacleType(), z, passed: false });
        blockedLanes.add(lane);
      });
  }
  // remaining ~18% chance: clear segment, no obstacles

  if (Math.random() < 0.55) {
    const openLanes = [0, 1, 2].filter((l) => !blockedLanes.has(l));
    const fishLane = openLanes[Math.floor(Math.random() * openLanes.length)];
    if (fishLane !== undefined) {
      state.fish.push({ id: state.nextId++, lane: fishLane, z: z + 1.2, collected: false });
    }
  }
}

export function createInitialState(): WhiskersState {
  const state: WhiskersState = {
    lane: 1,
    vertical: "run",
    verticalTimer: 0,
    distance: 0,
    speed: 9,
    baseSpeed: 9,
    score: 0,
    lives: 9,
    maxLives: 9,
    guardGap: 100,
    fishCollected: 0,
    closeCalls: 0,
    obstacles: [],
    fish: [],
    invulnTimer: 0,
    gameOver: false,
    gameOverReason: "",
    nextId: 1,
    spawnAccumulator: 0,
    elapsed: 0,
    lastHitFlash: 0,
  };
  // pre-populate a queue of segments so the corridor isn't empty at start
  [16, 22.5, 29, MAX_Z].forEach((z) => spawnSegmentAt(state, z));
  return state;
}

export interface InputFlags {
  swipeLeft?: boolean;
  swipeRight?: boolean;
  swipeUp?: boolean;
  swipeDown?: boolean;
}

export function applyInput(state: WhiskersState, input: InputFlags) {
  if (state.gameOver) return;
  if (input.swipeLeft && state.lane > 0) state.lane -= 1;
  if (input.swipeRight && state.lane < LANES - 1) state.lane += 1;
  if (input.swipeUp && state.vertical === "run") {
    state.vertical = "jump";
    state.verticalTimer = 0.55;
  }
  if (input.swipeDown && state.vertical === "run") {
    state.vertical = "slide";
    state.verticalTimer = 0.5;
  }
}

export function update(state: WhiskersState, dt: number): void {
  if (state.gameOver) return;
  state.elapsed += dt;
  state.speed = state.baseSpeed + Math.min(11, state.elapsed * 0.11);

  if (state.vertical !== "run") {
    state.verticalTimer -= dt;
    if (state.verticalTimer <= 0) {
      state.vertical = "run";
      state.verticalTimer = 0;
    }
  }
  if (state.invulnTimer > 0) state.invulnTimer -= dt;
  if (state.lastHitFlash > 0) state.lastHitFlash -= dt;

  const travel = state.speed * dt;
  state.distance += travel;
  state.score += travel * 1.2;

  state.guardGap = Math.min(
    100,
    state.guardGap + dt * 3 - dt * Math.max(0, state.speed - state.baseSpeed) * 0.35
  );

  for (const o of state.obstacles) o.z -= travel;
  for (const f of state.fish) f.z -= travel;

  for (const o of state.obstacles) {
    if (o.passed) continue;
    if (o.z <= HIT_Z) {
      o.passed = true;
      const sameLane = o.lane === state.lane;
      let hit = false;
      if (sameLane) {
        if (o.type === "wall") hit = true;
        if (o.type === "pit") hit = state.vertical !== "jump";
        if (o.type === "beam") hit = state.vertical !== "slide";
      }
      if (hit && state.invulnTimer <= 0) {
        state.lives -= 1;
        state.guardGap -= 22;
        state.invulnTimer = 1.15;
        state.lastHitFlash = 0.4;
        state.gameOverReason = o.type;
        if (state.lives <= 0) state.gameOver = true;
      } else if (!sameLane) {
        state.score += 6;
        state.closeCalls += 1;
      }
    }
  }

  for (const f of state.fish) {
    if (f.collected) continue;
    if (f.z <= HIT_Z) {
      f.collected = true;
      if (f.lane === state.lane) {
        state.fishCollected += 1;
        state.score += 25;
      }
    }
  }

  if (state.guardGap <= 0) {
    state.guardGap = 0;
    state.gameOver = true;
    state.gameOverReason = "guard";
  }

  state.obstacles = state.obstacles.filter((o) => o.z > -2);
  state.fish = state.fish.filter((f) => f.z > -2);

  state.spawnAccumulator += travel;
  while (state.spawnAccumulator >= SEGMENT_LENGTH) {
    state.spawnAccumulator -= SEGMENT_LENGTH;
    spawnSegmentAt(state, MAX_Z);
  }
}

export function computeStars(state: WhiskersState): 0 | 1 | 2 | 3 {
  if (state.score >= 3500) return 3;
  if (state.score >= 1600) return 2;
  if (state.score >= 500) return 1;
  return 0;
}