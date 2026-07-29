import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X, Loader2, Sparkles } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import {
  isPseudonymAvailable,
  generateGuestPseudonym,
} from "@/utils/pseudonymRegistry";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: () => void;
}

type CheckStatus = "idle" | "checking" | "available" | "taken" | "too-short";

const COUNTRIES = [
  { code: "", name: "Worldwide" },
  { code: "US", name: "United States" },
  { code: "GB", name: "United Kingdom" },
  { code: "CA", name: "Canada" },
  { code: "AU", name: "Australia" },
  { code: "DE", name: "Germany" },
  { code: "FR", name: "France" },
  { code: "ES", name: "Spain" },
  { code: "IT", name: "Italy" },
  { code: "NL", name: "Netherlands" },
  { code: "SA", name: "Saudi Arabia" },
  { code: "AE", name: "UAE" },
  { code: "EG", name: "Egypt" },
  { code: "TN", name: "Tunisia" },
  { code: "MA", name: "Morocco" },
  { code: "DZ", name: "Algeria" },
  { code: "JO", name: "Jordan" },
  { code: "LB", name: "Lebanon" },
  { code: "TR", name: "Turkey" },
  { code: "IN", name: "India" },
  { code: "JP", name: "Japan" },
  { code: "BR", name: "Brazil" },
];

const NAME_REGEX = /^[a-zA-Z0-9\u0600-\u06FF\s]+$/;

export default function LoginModal({ isOpen, onClose, onLogin }: LoginModalProps) {
  const { login } = useAuthStore();
  const [pseudonym, setPseudonym] = useState("");
  const [country, setCountry] = useState("");
  const [status, setStatus] = useState<CheckStatus>("idle");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounced availability check
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const name = pseudonym.trim();

    if (name.length === 0) {
      setStatus("idle");
      return;
    }
    if (name.length < 3) {
      setStatus("too-short");
      return;
    }
    if (!NAME_REGEX.test(name)) {
      setStatus("idle");
      return;
    }

    setStatus("checking");
    debounceRef.current = setTimeout(() => {
      setStatus(isPseudonymAvailable(name) ? "available" : "taken");
    }, 500);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [pseudonym]);

  const canSubmit =
    status === "available" && !loading && pseudonym.trim().length >= 3;

  const handleSubmit = () => {
    if (!canSubmit) return;
    setLoading(true);
    setError("");
    try {
      login(pseudonym, country);
      setLoading(false);
      onLogin();
      onClose();
    } catch (e) {
      setLoading(false);
      setError(e instanceof Error ? e.message : "Failed to create profile");
    }
  };

  const handleGuest = () => {
    setLoading(true);
    setError("");
    try {
      const guestName = generateGuestPseudonym();
      login(guestName, country);
      setLoading(false);
      onLogin();
      onClose();
    } catch (e) {
      setLoading(false);
      setError(e instanceof Error ? e.message : "Failed to create guest profile");
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-card rounded-3xl p-6 w-full max-w-sm border border-border/50 shadow-2xl"
          >
            <h2 className="font-heading font-bold text-xl text-foreground text-center">
              Choose Your Name
            </h2>
            <p className="text-sm text-muted-foreground text-center mt-1">
              This will be visible to other players
            </p>

            {/* Pseudonym input */}
            <div className="mt-5">
              <input
                type="text"
                value={pseudonym}
                onChange={(e) => setPseudonym(e.target.value)}
                maxLength={20}
                placeholder="Enter a unique name..."
                autoFocus
                onKeyDown={(e) => e.key === "Enter" && canSubmit && handleSubmit()}
                className="w-full bg-muted/60 rounded-xl px-4 py-3 text-foreground font-heading font-semibold outline-none border border-border/50 focus:border-primary transition-colors"
              />
              {/* Status line */}
              <div className="h-5 mt-1.5 flex items-center gap-1.5 text-xs">
                {status === "checking" && (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
                    <span className="text-primary">Checking...</span>
                  </>
                )}
                {status === "available" && (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Available!</span>
                  </>
                )}
                {status === "taken" && (
                  <>
                    <X className="w-3.5 h-3.5 text-red-400" />
                    <span className="text-red-400">Already taken</span>
                  </>
                )}
                {status === "too-short" && (
                  <span className="text-amber-400">Too short (min 3 chars)</span>
                )}
              </div>
            </div>

            {/* Country selector */}
            <div className="mt-3">
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full bg-muted/60 rounded-xl px-4 py-3 text-foreground outline-none border border-border/50 focus:border-primary transition-colors appearance-none cursor-pointer"
              >
                {COUNTRIES.map((c) => (
                  <option key={c.code || "ww"} value={c.code}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {error && (
              <p className="text-xs text-red-400 mt-2 text-center">{error}</p>
            )}

            {/* Let's Go button */}
            <button
              onClick={handleSubmit}
              disabled={!canSubmit}
              className="w-full mt-4 py-3 rounded-xl bg-primary text-primary-foreground font-heading font-bold text-sm transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
              Let's Go!
            </button>

            {/* Play as Guest */}
            <button
              onClick={handleGuest}
              disabled={loading}
              className="w-full mt-2 py-2.5 rounded-xl bg-muted text-muted-foreground font-bold text-xs transition-all active:scale-95 hover:text-foreground disabled:opacity-40"
            >
              Play as Guest
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}