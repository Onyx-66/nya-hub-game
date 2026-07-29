import { Loader2 } from "lucide-react";

type SpinnerSize = "sm" | "md" | "lg";

interface LoadingSpinnerProps {
  size?: SpinnerSize;
  className?: string;
}

const sizeClasses: Record<SpinnerSize, string> = {
  sm: "w-4 h-4",
  md: "w-8 h-8",
  lg: "w-12 h-12",
};

/**
 * Animated spinning loader with 3 size variants.
 * Uses the primary token color by default; override via className.
 */
export default function LoadingSpinner({ size = "md", className = "" }: LoadingSpinnerProps) {
  return (
    <Loader2
      className={`${sizeClasses[size]} text-primary animate-spin ${className}`}
    />
  );
}