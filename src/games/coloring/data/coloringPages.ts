// =============================================
// Coloring page SVG region data.
// Each page is a set of closed SVG paths (regions) that can be independently filled.
// =============================================

export interface ColoringRegion {
  id: string;
  d: string;
}

export interface ColoringPageArt {
  viewBox: string;
  regions: ColoringRegion[];
}

// ── Path helpers ──
function circle(cx: number, cy: number, r: number): string {
  return `M ${cx - r},${cy} A ${r},${r} 0 1,0 ${cx + r},${cy} A ${r},${r} 0 1,0 ${cx - r},${cy} Z`;
}

function ellipse(cx: number, cy: number, rx: number, ry: number): string {
  return `M ${cx - rx},${cy} A ${rx},${ry} 0 1,0 ${cx + rx},${cy} A ${rx},${ry} 0 1,0 ${cx - rx},${cy} Z`;
}

function triangle(x1: number, y1: number, x2: number, y2: number, x3: number, y3: number): string {
  return `M ${x1},${y1} L ${x2},${y2} L ${x3},${y3} Z`;
}

function star(cx: number, cy: number, outerR: number, innerR: number, points: number): string {
  let path = '';
  for (let i = 0; i < points * 2; i++) {
    const angle = (Math.PI / points) * i - Math.PI / 2;
    const r = i % 2 === 0 ? outerR : innerR;
    const x = cx + Math.cos(angle) * r;
    const y = cy + Math.sin(angle) * r;
    path += i === 0 ? `M ${x.toFixed(1)},${y.toFixed(1)} ` : `L ${x.toFixed(1)},${y.toFixed(1)} `;
  }
  return path + 'Z';
}

function rect(x: number, y: number, w: number, h: number): string {
  return `M ${x},${y} L ${x + w},${y} L ${x + w},${y + h} L ${x},${y + h} Z`;
}

export const PAGE_ART: Record<string, ColoringPageArt> = {
  // ── 1. Moon Cat (easy, 8 regions) ──
  'moon-cat': {
    viewBox: '0 0 400 400',
    regions: [
      { id: 'moon', d: 'M 60 200 A 140 140 0 1 0 340 200 A 100 100 0 1 1 60 200 Z' },
      { id: 'body', d: ellipse(200, 270, 38, 48) },
      { id: 'head', d: circle(200, 190, 32) },
      { id: 'ear-l', d: triangle(182, 168, 170, 135, 196, 158) },
      { id: 'ear-r', d: triangle(218, 168, 230, 135, 204, 158) },
      { id: 'tail', d: 'M 238 285 Q 278 275 288 235 Q 291 222 278 220 Q 268 230 263 255 Q 253 273 238 278 Z' },
      { id: 'eye-l', d: circle(190, 185, 4) },
      { id: 'eye-r', d: circle(210, 185, 4) },
    ],
  },

  // ── 2. Yarn Kitten (easy, 10 regions) ──
  'yarn-kitten': {
    viewBox: '0 0 400 400',
    regions: [
      { id: 'yarn-ball', d: circle(290, 310, 35) },
      { id: 'yarn-1', d: 'M 290 275 Q 260 250 230 260 Q 215 265 225 250 Q 255 235 290 240 Z' },
      { id: 'yarn-2', d: 'M 320 290 Q 350 275 365 285 Q 372 290 362 300 Q 345 305 322 305 Z' },
      { id: 'body', d: ellipse(160, 260, 42, 52) },
      { id: 'head', d: circle(160, 175, 32) },
      { id: 'ear-l', d: triangle(142, 155, 130, 122, 156, 148) },
      { id: 'ear-r', d: triangle(178, 155, 190, 122, 164, 148) },
      { id: 'tail', d: 'M 200 275 Q 240 265 250 225 Q 253 212 240 210 Q 230 220 225 245 Q 215 265 200 270 Z' },
      { id: 'eye-l', d: circle(150, 170, 4) },
      { id: 'eye-r', d: circle(170, 170, 4) },
    ],
  },

  // ── 3. Garden Cat (medium, 12 regions) ──
  'garden-cat': {
    viewBox: '0 0 400 400',
    regions: [
      { id: 'flower-center', d: circle(320, 100, 14) },
      { id: 'petal-1', d: ellipse(320, 75, 9, 14) },
      { id: 'petal-2', d: ellipse(345, 100, 14, 9) },
      { id: 'petal-3', d: ellipse(320, 125, 9, 14) },
      { id: 'petal-4', d: ellipse(295, 100, 14, 9) },
      { id: 'stem', d: rect(316, 114, 8, 80) },
      { id: 'leaf', d: ellipse(300, 155, 14, 7) },
      { id: 'body', d: ellipse(170, 280, 42, 52) },
      { id: 'head', d: circle(170, 195, 32) },
      { id: 'ear-l', d: triangle(152, 175, 140, 142, 166, 168) },
      { id: 'ear-r', d: triangle(188, 175, 200, 142, 174, 168) },
      { id: 'tail', d: 'M 210 295 Q 250 285 260 245 Q 263 232 250 230 Q 240 240 235 265 Q 225 285 210 290 Z' },
    ],
  },

  // ── 4. Mystical Cat (medium, 15 regions) ──
  'mystical-cat': {
    viewBox: '0 0 400 400',
    regions: [
      { id: 'star1', d: star(70, 70, 20, 8, 5) },
      { id: 'star2', d: star(330, 70, 18, 7, 5) },
      { id: 'star3', d: star(70, 330, 15, 6, 5) },
      { id: 'star4', d: star(330, 330, 16, 6, 5) },
      { id: 'star5', d: star(200, 55, 12, 5, 5) },
      { id: 'moon-deco', d: 'M 340 180 A 25 25 0 1 0 340 230 A 18 18 0 1 1 340 180 Z' },
      { id: 'sparkle', d: star(60, 200, 10, 4, 4) },
      { id: 'body', d: ellipse(200, 270, 42, 52) },
      { id: 'head', d: circle(200, 185, 33) },
      { id: 'ear-l', d: triangle(182, 165, 170, 132, 196, 158) },
      { id: 'ear-r', d: triangle(218, 165, 230, 132, 204, 158) },
      { id: 'tail', d: 'M 240 285 Q 280 275 290 235 Q 293 222 280 220 Q 270 230 265 255 Q 255 275 240 280 Z' },
      { id: 'eye-l', d: circle(190, 180, 5) },
      { id: 'eye-r', d: circle(210, 180, 5) },
      { id: 'nose', d: triangle(195, 195, 205, 195, 200, 202) },
    ],
  },

  // ── 5. Cat Dragon (hard, 18 regions) ──
  'cat-dragon': {
    viewBox: '0 0 400 400',
    regions: [
      { id: 'wing-l', d: 'M 165 220 Q 100 180 80 220 Q 90 250 140 245 Q 155 240 165 230 Z' },
      { id: 'wing-r', d: 'M 235 220 Q 300 180 320 220 Q 310 250 260 245 Q 245 240 235 230 Z' },
      { id: 'body', d: ellipse(200, 270, 40, 50) },
      { id: 'belly', d: ellipse(200, 290, 22, 28) },
      { id: 'head', d: circle(200, 190, 33) },
      { id: 'ear-l', d: triangle(182, 168, 170, 138, 196, 158) },
      { id: 'ear-r', d: triangle(218, 168, 230, 138, 204, 158) },
      { id: 'horn-l', d: triangle(188, 162, 182, 128, 196, 158) },
      { id: 'horn-r', d: triangle(212, 162, 218, 128, 204, 158) },
      { id: 'tail', d: 'M 240 285 Q 290 280 300 240 Q 305 225 292 222 Q 282 232 277 258 Q 260 280 240 282 Z' },
      { id: 'tail-spike', d: triangle(295, 225, 312, 213, 295, 240) },
      { id: 'eye-l', d: circle(190, 185, 5) },
      { id: 'eye-r', d: circle(210, 185, 5) },
      { id: 'nostril', d: circle(200, 200, 3) },
      { id: 'fire', d: 'M 200 215 Q 180 235 170 255 Q 175 260 185 250 Q 190 265 200 255 Q 210 265 215 250 Q 225 260 230 255 Q 220 235 200 215 Z' },
      { id: 'scale1', d: ellipse(185, 260, 8, 5) },
      { id: 'scale2', d: ellipse(215, 260, 8, 5) },
      { id: 'scale3', d: ellipse(200, 270, 8, 5) },
    ],
  },

  // ── 6. Mandala Cat (hard, 20 regions) ──
  'mandala-cat': {
    viewBox: '0 0 400 400',
    regions: [
      { id: 'petal-1', d: ellipse(200, 55, 14, 22) },
      { id: 'petal-2', d: ellipse(200, 345, 14, 22) },
      { id: 'petal-3', d: ellipse(55, 200, 22, 14) },
      { id: 'petal-4', d: ellipse(345, 200, 22, 14) },
      { id: 'petal-5', d: ellipse(100, 100, 16, 16) },
      { id: 'petal-6', d: ellipse(300, 100, 16, 16) },
      { id: 'petal-7', d: ellipse(100, 300, 16, 16) },
      { id: 'petal-8', d: ellipse(300, 300, 16, 16) },
      { id: 'face', d: circle(200, 200, 75) },
      { id: 'ear-l', d: triangle(150, 150, 120, 105, 168, 142) },
      { id: 'ear-r', d: triangle(250, 150, 280, 105, 232, 142) },
      { id: 'inner-ear-l', d: triangle(155, 148, 140, 120, 166, 142) },
      { id: 'inner-ear-r', d: triangle(245, 148, 260, 120, 234, 142) },
      { id: 'eye-l', d: circle(172, 190, 12) },
      { id: 'eye-r', d: circle(228, 190, 12) },
      { id: 'nose', d: triangle(193, 212, 207, 212, 200, 222) },
      { id: 'forehead', d: circle(200, 165, 10) },
      { id: 'cheek-l', d: circle(155, 210, 8) },
      { id: 'cheek-r', d: circle(245, 210, 8) },
      { id: 'chin', d: circle(200, 240, 7) },
    ],
  },
};