import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import PawCounter from "./PawCounter";
import GemCounter from "./GemCounter";
import BottomNav from "@/components/BottomNav";

interface NyaLayoutProps {
  children: ReactNode;
  showBack?: boolean;
  title?: string;
  onBack?: () => void;
  /** Optional icon node rendered before the title. */
  titleIcon?: ReactNode;
  /** Hide the bottom navigation bar. */
  hideNav?: boolean;
  /** Compact mode: no scroll, minimal padding, fills viewport height. */
  compact?: boolean;
}

/**
 * Default screen wrapper for Nya Hub.
 * Includes a sticky top bar (back button, title, currency counters),
 * a scrollable content area, and bottom navigation.
 */
export default function NyaLayout({
  children,
  showBack = true,
  title,
  titleIcon,
  onBack,
  hideNav = false,
  compact = false,
}: NyaLayoutProps) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) onBack();
    else navigate(-1);
  };

  return (
    <div
      className={`bg-background flex flex-col ${
        compact ? "h-[100dvh] overflow-hidden" : "min-h-screen"
      }`}
    >
      {/* ── Top Bar ── */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/50 shrink-0">
        <div className="max-w-md md:max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          {showBack && (
            <button
              onClick={handleBack}
              className="w-11 h-11 rounded-2xl bg-muted/60 flex items-center justify-center shrink-0 hover:bg-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              aria-label="Back"
            >
              <ChevronLeft className="w-5 h-5 text-foreground" />
            </button>
          )}

          {title && (
            <h1 className="font-heading font-bold text-lg text-foreground flex-1 truncate flex items-center gap-2">
              {titleIcon}
              {title}
            </h1>
          )}

          <div
            className={`flex items-center gap-2 ${
              !title ? "flex-1 justify-end" : "shrink-0"
            }`}
          >
            <PawCounter />
            <GemCounter />
          </div>
        </div>
      </header>

      {/* ── Scrollable Content ── */}
      <main
        className={`flex-1 ${
          compact ? "overflow-hidden min-h-0" : "overflow-y-auto"
        }`}
      >
        <div
          className={`max-w-md md:max-w-2xl mx-auto ${
            compact ? "px-3 py-2 h-full" : "px-4 py-5 pb-28"
          }`}
        >
          {children}
        </div>
      </main>

      {!hideNav && <BottomNav />}
    </div>
  );
}