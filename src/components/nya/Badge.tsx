import type { ReactNode } from "react";

type BadgeVariant = "default" | "primary" | "success" | "warning" | "destructive";

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: "bg-muted text-muted-foreground",
  primary: "bg-primary/15 text-primary",
  success: "bg-emerald-500/15 text-emerald-400",
  warning: "bg-amber-500/15 text-amber-400",
  destructive: "bg-destructive/15 text-destructive",
};

/**
 * Small pill-shaped badge with 5 color variants.
 */
export default function Badge({ children, variant = "default", className = "" }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
}