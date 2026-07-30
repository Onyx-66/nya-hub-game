import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useCallback } from "react";
import type { ReactNode } from "react";
import { X } from "lucide-react";
import { audioService } from "@/services/audioService";

type ModalSize = "sm" | "md" | "lg" | "full";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
  size?: ModalSize;
}

const sizeClasses: Record<ModalSize, string> = {
  sm: "max-w-xs",
  md: "max-w-md",
  lg: "max-w-lg",
  full: "max-w-2xl",
};

/**
 * Generic animated modal with backdrop blur.
 * Slides up from bottom on mobile, centers on larger screens.
 * Closes on Escape key, backdrop click, or close button.
 */
export default function Modal({ open, onClose, children, title, size = "md" }: ModalProps) {
  // Play open sound + Escape key to close
  useEffect(() => {
    if (open) audioService.playSFX("modal-open");
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open]);

  const handleClose = useCallback(() => {
    audioService.playSFX("modal-close");
    onClose();
  }, [onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4"
          onClick={handleClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 60, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 60, scale: 0.96 }}
            transition={{ type: "spring", damping: 26, stiffness: 320 }}
            onClick={(e) => e.stopPropagation()}
            className={`relative w-full ${sizeClasses[size]} bg-card rounded-t-3xl sm:rounded-3xl p-6 border border-border/50 shadow-2xl`}
          >
            {/* grab handle (mobile) */}
            <div className="sm:hidden absolute top-3 left-1/2 -translate-x-1/2 w-10 h-1 rounded-full bg-muted-foreground/30" />

            {title && (
              <h2 className="font-heading font-bold text-lg text-foreground mb-4 pr-8">
                {title}
              </h2>
            )}

            <button
              onClick={handleClose}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-muted/60 flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>

            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}