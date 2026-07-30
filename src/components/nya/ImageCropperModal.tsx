import { useState, useEffect, useRef, useCallback } from "react";
import { Loader2 } from "lucide-react";
import Modal from "@/components/nya/Modal";
import NyaButton from "@/components/nya/NyaButton";

interface ImageCropperModalProps {
  open: boolean;
  file: File | null;
  /** width / height */
  aspectRatio: number;
  title: string;
  onClose: () => void;
  onConfirm: (croppedFile: File) => void | Promise<void>;
  maxOutputWidth?: number;
}

const MIN_ZOOM = 1;
const MAX_ZOOM = 4;

/**
 * Canvas-based image cropper with drag-to-pan and zoom slider.
 * Crops to the target aspect ratio and exports a WebP File.
 */
export default function ImageCropperModal({
  open,
  file,
  aspectRatio,
  title,
  onClose,
  onConfirm,
  maxOutputWidth = 800,
}: ImageCropperModalProps) {
  const [imgUrl, setImgUrl] = useState<string | null>(null);
  const [imgEl, setImgEl] = useState<HTMLImageElement | null>(null);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [processing, setProcessing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{
    startX: number;
    startY: number;
    baseX: number;
    baseY: number;
  } | null>(null);

  // Load image when file changes
  useEffect(() => {
    if (!file) {
      setImgUrl(null);
      setImgEl(null);
      return;
    }
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => setImgEl(img);
    img.src = url;
    setImgUrl(url);
    setZoom(1);
    setOffset({ x: 0, y: 0 });
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const getBaseScale = useCallback(() => {
    if (!imgEl || !containerRef.current) return 1;
    const cw = containerRef.current.clientWidth;
    const ch = cw / aspectRatio;
    return Math.max(cw / imgEl.naturalWidth, ch / imgEl.naturalHeight);
  }, [imgEl, aspectRatio]);

  const clampOffset = useCallback(
    (x: number, y: number, z: number) => {
      if (!imgEl || !containerRef.current) return { x: 0, y: 0 };
      const cw = containerRef.current.clientWidth;
      const ch = cw / aspectRatio;
      const baseScale = Math.max(
        cw / imgEl.naturalWidth,
        ch / imgEl.naturalHeight,
      );
      const dw = imgEl.naturalWidth * baseScale * z;
      const dh = imgEl.naturalHeight * baseScale * z;
      const maxX = Math.max(0, (dw - cw) / 2);
      const maxY = Math.max(0, (dh - ch) / 2);
      return {
        x: Math.max(-maxX, Math.min(maxX, x)),
        y: Math.max(-maxY, Math.min(maxY, y)),
      };
    },
    [imgEl, aspectRatio],
  );

  // Pointer drag handlers
  const handlePointerDown = (e: React.PointerEvent) => {
    if (processing) return;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      baseX: offset.x,
      baseY: offset.y,
    };
  };
  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragRef.current) return;
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    const clamped = clampOffset(
      dragRef.current.baseX + dx,
      dragRef.current.baseY + dy,
      zoom,
    );
    setOffset(clamped);
  };
  const handlePointerUp = () => {
    dragRef.current = null;
  };

  const handleZoomChange = (z: number) => {
    setZoom(z);
    setOffset((prev) => clampOffset(prev.x, prev.y, z));
  };

  const handleConfirm = async () => {
    if (!imgEl || !containerRef.current) return;
    setProcessing(true);
    try {
      const cw = containerRef.current.clientWidth;
      const ch = cw / aspectRatio;
      const baseScale = Math.max(
        cw / imgEl.naturalWidth,
        ch / imgEl.naturalHeight,
      );
      const actualScale = baseScale * zoom;
      const dw = imgEl.naturalWidth * actualScale;
      const dh = imgEl.naturalHeight * actualScale;
      const imgLeft = (cw - dw) / 2 + offset.x;
      const imgTop = (ch - dh) / 2 + offset.y;

      // Source rectangle in natural image coordinates
      const sourceX = Math.max(0, -imgLeft / actualScale);
      const sourceY = Math.max(0, -imgTop / actualScale);
      const sourceW = cw / actualScale;
      const sourceH = ch / actualScale;

      const outputW = maxOutputWidth;
      const outputH = Math.round(maxOutputWidth / aspectRatio);
      const canvas = document.createElement("canvas");
      canvas.width = outputW;
      canvas.height = outputH;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas not available");
      ctx.drawImage(
        imgEl,
        sourceX,
        sourceY,
        sourceW,
        sourceH,
        0,
        0,
        outputW,
        outputH,
      );

      const blob: Blob = await new Promise((resolve, reject) => {
        canvas.toBlob(
          (b) =>
            b ? resolve(b) : reject(new Error("Export failed")),
          "image/webp",
          0.82,
        );
      });
      const croppedFile = new File([blob], "cropped.webp", {
        type: "image/webp",
      });
      await onConfirm(croppedFile);
      onClose();
    } catch (err) {
      console.error("Crop failed:", err);
      setProcessing(false);
    }
  };

  const baseScale = imgEl ? getBaseScale() : 1;
  const displayW = imgEl ? imgEl.naturalWidth * baseScale * zoom : 0;
  const displayH = imgEl ? imgEl.naturalHeight * baseScale * zoom : 0;

  return (
    <Modal open={open} onClose={onClose} title={title} size="md">
      <div className="space-y-4">
        {/* Crop preview */}
        <div
          ref={containerRef}
          className="relative w-full overflow-hidden rounded-2xl bg-black/40 touch-none select-none"
          style={{ aspectRatio: `${aspectRatio}` }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        >
          {imgEl && imgUrl && (
            <img
              src={imgUrl}
              alt="Crop preview"
              draggable={false}
              className="absolute top-1/2 left-1/2 origin-center pointer-events-none max-w-none max-h-none"
              style={{
                width: displayW || undefined,
                height: displayH || undefined,
                transform: `translate(-50%, -50%) translate(${offset.x}px, ${offset.y}px)`,
              }}
            />
          )}
          {/* rule-of-thirds grid */}
          <div className="absolute inset-0 pointer-events-none border border-white/20">
            <div className="absolute top-1/3 left-0 right-0 h-px bg-white/15" />
            <div className="absolute top-2/3 left-0 right-0 h-px bg-white/15" />
            <div className="absolute left-1/3 top-0 bottom-0 w-px bg-white/15" />
            <div className="absolute left-2/3 top-0 bottom-0 w-px bg-white/15" />
          </div>
          {!imgEl && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="w-6 h-6 text-muted-foreground animate-spin" />
            </div>
          )}
        </div>

        <p className="text-xs text-muted-foreground text-center -mt-1">
          Drag to reposition · Use slider to zoom
        </p>

        {/* Zoom slider */}
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground shrink-0">Zoom</span>
          <input
            type="range"
            min={MIN_ZOOM}
            max={MAX_ZOOM}
            step={0.01}
            value={zoom}
            onChange={(e) => handleZoomChange(parseFloat(e.target.value))}
            className="flex-1 accent-primary"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <NyaButton variant="ghost" onClick={onClose} fullWidth>
            Cancel
          </NyaButton>
          <NyaButton
            onClick={handleConfirm}
            loading={processing}
            fullWidth
            disabled={!imgEl}
          >
            {processing ? "Saving…" : "Apply"}
          </NyaButton>
        </div>
      </div>
    </Modal>
  );
}