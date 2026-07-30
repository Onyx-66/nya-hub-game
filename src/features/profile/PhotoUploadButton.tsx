import { useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { Camera, Loader2, X } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { base44 } from "@/api/base44Client";

interface PhotoUploadButtonProps {
  className?: string;
}

const MAX_DIMENSION = 256;
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

/**
 * Compresses and resizes an image file client-side before upload.
 * Returns a File object (WebP) at most MAX_DIMENSION x MAX_DIMENSION.
 */
async function resizeImage(file: File): Promise<File> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
  const w = Math.round(bitmap.width * scale);
  const h = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not process image");
  ctx.drawImage(bitmap, 0, 0, w, h);
  bitmap.close();

  const blob: Blob = await new Promise((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("Image compression failed"))),
      "image/webp",
      0.82,
    );
  });

  return new File([blob], "avatar.webp", { type: "image/webp" });
}

export default function PhotoUploadButton({ className = "" }: PhotoUploadButtonProps) {
  const { updateAvatar } = useAuthStore();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = useCallback(
    async (file: File) => {
      setError(null);

      if (!ACCEPTED_TYPES.includes(file.type)) {
        setError("Unsupported format. Use JPG, PNG, or WebP.");
        return;
      }
      if (file.size > MAX_FILE_SIZE) {
        setError("File too large (max 10 MB).");
        return;
      }

      setUploading(true);
      try {
        const resized = await resizeImage(file);
        const { file_url } = await base44.integrations.Core.UploadFile({ file: resized });
        updateAvatar(file_url);
      } catch (err) {
        console.error("Avatar upload failed:", err);
        setError("Upload failed. Please try again.");
      } finally {
        setUploading(false);
      }
    },
    [updateAvatar],
  );

  return (
    <>
      <motion.button
        type="button"
        whileTap={{ scale: 0.9 }}
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className={`relative w-7 h-7 rounded-full bg-accent flex items-center justify-center shadow-lg disabled:opacity-60 ${className}`}
        aria-label="Upload photo"
      >
        {uploading ? (
          <Loader2 className="w-3.5 h-3.5 text-white animate-spin" />
        ) : (
          <Camera className="w-3.5 h-3.5 text-white" />
        )}
      </motion.button>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = "";
        }}
      />

      {error && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[70] flex items-center gap-2 bg-destructive text-destructive-foreground text-xs font-semibold px-4 py-2.5 rounded-2xl shadow-xl">
          <X className="w-3.5 h-3.5 shrink-0" />
          {error}
        </div>
      )}
    </>
  );
}