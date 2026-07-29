import { motion } from "framer-motion";
import type { ReactNode } from "react";

type NyaButtonVariant = "primary" | "secondary" | "ghost" | "white";

interface NyaButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: NyaButtonVariant;
  className?: string;
  disabled?: boolean;
  type?: "button" | "submit";
  fullWidth?: boolean;
}

const variantStyles: Record<NyaButtonVariant, string> = {
  primary:
    "bg-gradient-to-r from-pink-400 to-violet-400 text-white shadow-lg shadow-pink-500/20",
  secondary: "bg-violet-400/15 text-violet-300 hover:bg-violet-400/25",
  ghost: "bg-transparent text-muted-foreground hover:bg-muted/50",
  white: "bg-white text-gray-900 shadow-md shadow-black/10",
};

/**
 * Primary action button with a springy press animation.
 * Carries the Nya pastel theme across the app.
 */
export default function NyaButton({
  children,
  onClick,
  variant = "primary",
  className = "",
  disabled = false,
  type = "button",
  fullWidth = false,
}: NyaButtonProps) {
  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      whileTap={{ scale: 0.94 }}
      whileHover={{ scale: disabled ? 1 : 1.03 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      className={`inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-heading font-semibold transition-colors disabled:opacity-50 disabled:pointer-events-none ${
        fullWidth ? "w-full" : ""
      } ${variantStyles[variant]} ${className}`}
    >
      {children}
    </motion.button>
  );
}