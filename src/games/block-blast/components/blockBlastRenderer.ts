// =============================================
// blockBlastRenderer — Pure canvas drawing for Block Blast.
// =============================================

import type { BlockBlastEngine, Block, Position } from "../logic/blockBlastEngine";

export interface RendererConfig {
  cellSize: number;
  padding: number;
  boardX: number;
  boardY: number;
  blockPreviewY: number;
  blockPreviewSpacing: number;
}

const BG_COLOR = "#1a1a2e";
const GRID_COLOR = "#252540";
const EMPTY_CELL = "rgba(255,255,255,0.05)";

export function createConfig(canvasWidth: number): RendererConfig {
  const cellSize = 40;
  const boardSize = cellSize * 8;
  return {
    cellSize,
    padding: 20,
    boardX: (canvasWidth - boardSize) / 2,
    boardY: 20,
    blockPreviewY: 20 + boardSize + 30,
    blockPreviewSpacing: canvasWidth / 3,
  };
}

function lightenColor(hex: string, amount: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const lr = Math.min(255, Math.round(r + (255 - r) * amount));
  const lg = Math.min(255, Math.round(g + (255 - g) * amount));
  const lb = Math.min(255, Math.round(b + (255 - b) * amount));
  return `rgb(${lr},${lg},${lb})`;
}

function roundRect(
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

export function renderBoard(
  ctx: CanvasRenderingContext2D,
  engine: BlockBlastEngine,
  config: RendererConfig,
): void {
  const { cellSize, boardX, boardY } = config;
  const boardPixelSize = cellSize * 8;

  // Board background
  ctx.fillStyle = BG_COLOR;
  roundRect(ctx, boardX - 6, boardY - 6, boardPixelSize + 12, boardPixelSize + 12, 12);
  ctx.fill();

  // Grid cells
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const x = boardX + c * cellSize;
      const y = boardY + r * cellSize;
      const cell = engine.board[r][c];

      if (cell.filled && cell.color) {
        // Filled cell with inner highlight
        ctx.fillStyle = cell.color;
        roundRect(ctx, x + 1, y + 1, cellSize - 2, cellSize - 2, 4);
        ctx.fill();
        // Top-left highlight
        ctx.fillStyle = lightenColor(cell.color, 0.3);
        roundRect(ctx, x + 1, y + 1, cellSize - 2, (cellSize - 2) / 2, 4);
        ctx.fill();
      } else {
        // Empty cell
        ctx.fillStyle = EMPTY_CELL;
        roundRect(ctx, x + 1, y + 1, cellSize - 2, cellSize - 2, 4);
        ctx.fill();
      }
    }
  }

  // Grid lines (subtle)
  ctx.strokeStyle = GRID_COLOR;
  ctx.lineWidth = 0.5;
  for (let i = 0; i <= 8; i++) {
    ctx.beginPath();
    ctx.moveTo(boardX + i * cellSize, boardY);
    ctx.lineTo(boardX + i * cellSize, boardY + boardPixelSize);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(boardX, boardY + i * cellSize);
    ctx.lineTo(boardX + boardPixelSize, boardY + i * cellSize);
    ctx.stroke();
  }
}

export function renderAvailableBlocks(
  ctx: CanvasRenderingContext2D,
  engine: BlockBlastEngine,
  config: RendererConfig,
  selectedBlockIndex: number | null,
): void {
  const { cellSize, blockPreviewY, blockPreviewSpacing } = config;

  engine.availableBlocks.forEach((block, i) => {
    if (!block) return;

    const slotCenter = blockPreviewSpacing * (i + 0.5);
    const blockW = block.shape[0].length * cellSize;
    const blockH = block.shape.length * cellSize;
    const bx = slotCenter - blockW / 2;
    const by = blockPreviewY;

    ctx.save();
    if (selectedBlockIndex === i) {
      ctx.scale(1.1, 1.1);
      ctx.translate(
        (slotCenter - blockW / 2) * (1 - 1.1) / 1.1,
        by * (1 - 1.1) / 1.1,
      );
    }

    // Draw block cells
    for (let r = 0; r < block.shape.length; r++) {
      for (let c = 0; c < block.shape[r].length; c++) {
        if (block.shape[r][c] === 0) continue;
        const x = bx + c * cellSize;
        const y = by + r * cellSize;
        ctx.fillStyle = block.color;
        roundRect(ctx, x + 1, y + 1, cellSize - 2, cellSize - 2, 4);
        ctx.fill();
        ctx.fillStyle = lightenColor(block.color, 0.3);
        roundRect(ctx, x + 1, y + 1, cellSize - 2, (cellSize - 2) / 2, 4);
        ctx.fill();
      }
    }

    // Selected border
    if (selectedBlockIndex === i) {
      ctx.strokeStyle = "#FFFFFF";
      ctx.lineWidth = 2;
      roundRect(ctx, bx - 2, by - 2, blockW + 4, blockH + 4, 6);
      ctx.stroke();
    }

    ctx.restore();
  });
}

export function renderGhost(
  ctx: CanvasRenderingContext2D,
  _engine: BlockBlastEngine,
  block: Block,
  position: Position,
  config: RendererConfig,
  isValid: boolean,
): void {
  const { cellSize, boardX, boardY } = config;
  const tint = isValid
    ? "rgba(74, 222, 128, 0.5)"
    : "rgba(248, 113, 113, 0.5)";

  ctx.fillStyle = tint;
  for (let r = 0; r < block.shape.length; r++) {
    for (let c = 0; c < block.shape[r].length; c++) {
      if (block.shape[r][c] === 0) continue;
      const x = boardX + (position.col + c) * cellSize;
      const y = boardY + (position.row + r) * cellSize;
      if (position.row + r >= 0 && position.row + r < 8 && position.col + c >= 0 && position.col + c < 8) {
        roundRect(ctx, x + 1, y + 1, cellSize - 2, cellSize - 2, 4);
        ctx.fill();
      }
    }
  }
}