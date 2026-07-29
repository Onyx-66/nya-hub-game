import { useRef, useState, useCallback } from "react";
import {
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import type { Direction } from "../logic/snakeEngine";

export type ControlMode = "arrows" | "analog";

interface SnakeControlsProps {
  mode: ControlMode;
  onDirection: (dir: Direction) => void;
}

export default function SnakeControls({ mode, onDirection }: SnakeControlsProps) {
  if (mode === "analog") return <AnalogStick onDirection={onDirection} />;
  return <DPad onDirection={onDirection} />;
}

// =============================================
// Arrows Mode — compact D-pad
// =============================================

function DPad({ onDirection }: { onDirection: (dir: Direction) => void }) {
  return (
    <div className="grid grid-cols-3 grid-rows-3 gap-1 w-[136px] h-[136px]">
      <div />
      <DpadButton dir="UP" onPress={onDirection}>
        <ChevronUp className="w-5 h-5" />
      </DpadButton>
      <div />
      <DpadButton dir="LEFT" onPress={onDirection}>
        <ChevronLeft className="w-5 h-5" />
      </DpadButton>
      <div />
      <DpadButton dir="RIGHT" onPress={onDirection}>
        <ChevronRight className="w-5 h-5" />
      </DpadButton>
      <div />
      <DpadButton dir="DOWN" onPress={onDirection}>
        <ChevronDown className="w-5 h-5" />
      </DpadButton>
      <div />
    </div>
  );
}

function DpadButton({
  dir,
  onPress,
  children,
}: {
  dir: Direction;
  onPress: (dir: Direction) => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onPointerDown={(e) => {
        e.preventDefault();
        onPress(dir);
      }}
      onContextMenu={(e) => e.preventDefault()}
      className="flex items-center justify-center w-11 h-11 rounded-xl bg-white/10 text-white active:bg-primary active:scale-110 transition-all touch-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      aria-label={dir}
    >
      {children}
    </button>
  );
}

// =============================================
// Analog Mode — dynamic thumbstick
// =============================================

interface StickState {
  ox: number;
  oy: number;
  tx: number;
  ty: number;
}

function AnalogStick({ onDirection }: { onDirection: (dir: Direction) => void }) {
  const zoneRef = useRef<HTMLDivElement>(null);
  const [stick, setStick] = useState<StickState | null>(null);
  const lastDirRef = useRef<Direction | null>(null);
  const pointerIdRef = useRef<number | null>(null);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      const rect = zoneRef.current?.getBoundingClientRect();
      if (!rect) return;
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      setStick({ ox: x, oy: y, tx: x, ty: y });
      lastDirRef.current = null;
      pointerIdRef.current = e.pointerId;
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    },
    [],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!stick || pointerIdRef.current !== e.pointerId) return;
      const rect = zoneRef.current?.getBoundingClientRect();
      if (!rect) return;
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const dx = x - stick.ox;
      const dy = y - stick.oy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const maxR = 42;
      const clamped = Math.min(dist, maxR);
      const angle = dist > 0 ? Math.atan2(dy, dx) : 0;

      setStick({
        ...stick,
        tx: stick.ox + Math.cos(angle) * clamped,
        ty: stick.oy + Math.sin(angle) * clamped,
      });

      // Snap to nearest cardinal direction (deadzone ~12px)
      if (dist > 12) {
        let dir: Direction;
        if (Math.abs(dx) > Math.abs(dy)) {
          dir = dx > 0 ? "RIGHT" : "LEFT";
        } else {
          dir = dy > 0 ? "DOWN" : "UP";
        }
        if (dir !== lastDirRef.current) {
          lastDirRef.current = dir;
          onDirection(dir);
        }
      }
    },
    [stick, onDirection],
  );

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    if (pointerIdRef.current !== e.pointerId) return;
    setStick(null);
    lastDirRef.current = null;
    pointerIdRef.current = null;
  }, []);

  return (
    <div
      ref={zoneRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      className="w-full h-[120px] touch-none relative flex items-center justify-center rounded-xl bg-white/5 border border-border/30"
    >
      {stick ? (
        <>
          {/* Base ring */}
          <div
            className="absolute rounded-full border-2 border-white/20 bg-white/5"
            style={{
              width: 84,
              height: 84,
              left: stick.ox - 42,
              top: stick.oy - 42,
            }}
          />
          {/* Thumb */}
          <div
            className="absolute rounded-full bg-primary/80 border-2 border-primary-foreground/30 shadow-lg"
            style={{
              width: 36,
              height: 36,
              left: stick.tx - 18,
              top: stick.ty - 18,
            }}
          />
        </>
      ) : (
        <p className="text-muted-foreground text-xs select-none">
          Touch &amp; drag to steer
        </p>
      )}
    </div>
  );
}