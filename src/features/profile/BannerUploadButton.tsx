import { useState, useRef } from "react";
import { Camera, Loader2, X } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { base44 } from "@/api/base44Client";
import ImageCropperModal from "@/components/nya/ImageCropperModal";

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

/**
 * Opens the image cropper (16:9) for a custom profile banner,
 * then uploads the cropped result.
 */
export default function BannerUploadButton() {
  const { updateCustomBanner } = useAuthStore();
  const inputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = (file: File) => {
    setError(null);
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError("Unsupported format. Use JPG, PNG, or WebP.");
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setError("File too large (max 10 MB).");
      return;
    }
    setSelectedFile(file);
  };

  const handleConfirm = async (croppedFile: File) => {
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({
        file: croppedFile,
      });
      updateCustomBanner(file_url);
    } catch (err) {
      console.error("Banner upload failed:", err);
      setError("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="absolute top-2 right-2 z-10 flex items-center gap-1.5 text-[10px] font-bold bg-black/40 backdrop-blur-sm text-white px-2.5 py-1.5 rounded-full hover:bg-black/60 transition-colors disabled:opacity-60"
        aria-label="Upload banner"
      >
        {uploading ? (
          <Loader2 className="w-3 h-3 animate-spin" />
        ) : (
          <Camera className="w-3 h-3" />
        )}
        {uploading ? "Uploading…" : "Banner"}
      </button>

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

      <ImageCropperModal
        open={!!selectedFile}
        file={selectedFile}
        aspectRatio={16 / 9}
        title="Crop Banner"
        onClose={() => setSelectedFile(null)}
        onConfirm={handleConfirm}
        maxOutputWidth={800}
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