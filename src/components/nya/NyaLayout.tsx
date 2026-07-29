import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import PawCounter from "./PawCounter";
import GemCounter from "./GemCounter";
import BottomNav from "@/components/BottomNav";

interface NyaLayoutProps {
  children: ReactNode;
  /** Show the back button. Defaults to true. */
  showBack?: boolean;
  /** Optional title shown in the top bar. */
  title?: string;
  /** Called when back is pressed. Defaults to browser history back. */
  onBack?: () => void;
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
  onBack,
}: NyaLayoutProps) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) onBack();
    else navigate(-1);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* ── Top Bar ── */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="max-w-md md:max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          {showBack && (
            <button
              onClick={handleBack}
              className="w-9 h-9 rounded-2xl bg-muted/60 flex items-center justify-center shrink-0 hover:bg-muted transition-colors"
              aria-label="Back"
            >
              <ChevronLeft className="w-5 h-5 text-foreground" />
            </button>
          )}

          {title && (
            <h1 className="font-heading font-bold text-lg text-foreground flex-1 truncate">
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
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-md md:max-w-2xl mx-auto px-4 py-5 pb-28">
          {children}
        </div>
      </main>

      {/* ── Bottom Navigation ── */}
      <BottomNav />
    </div>
  );
}