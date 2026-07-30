import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import type { ReactNode } from "react";
import { audioService } from "@/services/audioService";

type NyaButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "white";
type NyaButtonSize = "sm" | "md" | "lg";

interface NyaButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: NyaButtonVariant;
  size?: NyaButtonSize;
  className?: string;
  disabled?: boolean;
  loading?: boolean;
  type?: "button" | "submit";
  fullWidth?: boolean;
  leftIcon?: ReactNode;
}

const variantStyles: Record<NyaButtonVariant, string> = {
  primary:
    "bg-gradient-to-r from-pink-400 to-violet-400 text-white shadow-lg shadow-pink-500/20",
  secondary: "bg-violet-400/15 text-violet-300 hover:bg-violet-400/25",
  outline:
    "border-2 border-primary/60 text-primary bg-transparent hover:bg-primary/10",
  ghost: "bg-transparent text-muted-foreground hover:bg-muted/50",
  white: "bg-white text-gray-900 shadow-md shadow-black/10",
};

const sizeStyles: Record<NyaButtonSize, string> = {
  sm: "px-3.5 py-1.5 text-xs rounded-xl gap-1.5",
  md: "px-5 py-2.5 text-sm rounded-2xl gap-2",
  lg: "px-7 py-3.5 text-base rounded-2xl gap-2.5",
};

/**
 * Primary action button with a springy press animation.
 * Supports 5 variants, 3 sizes, left icon, and a loading spinner state.
 * Carries the Nya pastel theme across the app.
 */
export default function NyaButton({
  children,
  onClick,
  variant = "primary",
  size = "md",
  className = "",
  disabled = false,
  loading = false,
  type = "button",
  fullWidth = false,
  leftIcon,
}: NyaButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <motion.button
      type={type}
      onClick={() => {
        audioService.playSFX("button-click");
        onClick?.();
      }}
      onHoverStart={() => audioService.playSFX("button-hover")}
      disabled={isDisabled}
      whileTap={{ scale: 0.94 }}
      whileHover={{ scale: isDisabled ? 1 : 1.03 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      className={`inline-flex items-center justify-center font-heading font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-50 disabled:pointer-events-none ${
        sizeStyles[size]
      } ${variantStyles[variant]} ${fullWidth ? "w-full" : ""} ${className}`}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        leftIcon
      )}
      {children}
    </motion.button>
  );
}