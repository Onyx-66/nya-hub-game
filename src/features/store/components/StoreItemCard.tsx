import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Lock } from "lucide-react";
import { PawPrint, Gem } from "lucide-react";
import type { StoreItem } from "./storeCatalog";

export type PurchaseStatus = "idle" | "loading" | "success" | "error";

interface StoreItemCardProps {
  item: StoreItem;
  affordable: boolean;
  status: PurchaseStatus;
  onPurchase: (item: StoreItem) => void;
  /** layout: grid card vs full-width row */
  variant?: "grid" | "row";
}

const CurrencyIcon = { paws: PawPrint, gems: Gem } as const;

export default function StoreItemCard({
  item,
  affordable,
  status,
  onPurchase,
  variant = "grid",
}: StoreItemCardProps) {
  const Icon = item.icon;
  const isReal = item.currency === "real";
  const disabled = !isReal && !affordable;
  const [showTooltip, setShowTooltip] = useState(false);
  const isRow = variant === "row";

  const handleClick = () => {
    if (isReal) {
      setShowTooltip(true);
      setTimeout(() => setShowTooltip(false), 1600);
      return;
    }
    onPurchase(item);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{
        opacity: disabled ? 0.45 : 1,
        y: 0,
        x: status === "error" ? [0, -8, 8, -6, 6, 0] : 0,
      }}
      transition={{ duration: status === "error" ? 0.45 : 0.3 }}
      className={`relative rounded-2xl overflow-hidden border border-white/10 ${
        isRow ? "w-full" : ""
      }`}
    >
      {/* gradient background */}
      <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient}`} />

      {/* sparkle shimmer for remove-ads card */}
      {item.sparkle && (
        <motion.div
          className="absolute inset-0 z-10"
          style={{
            background:
              "linear-gradient(120deg, transparent 30%, rgba(255,255,255,0.35) 50%, transparent 70%)",
            backgroundSize: "200% 100%",
          }}
          animate={{ backgroundPosition: ["200% 0", "-200% 0"] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "linear" }}
        />
      )}

      {/* success green flash */}
      <AnimatePresence>
        {status === "success" && (
          <motion.div
            initial={{ opacity: 0.85 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7 }}
            className="absolute inset-0 bg-emerald-400/50 z-20"
          />
        )}
      </AnimatePresence>

      <div
        className={`relative z-30 p-4 flex ${
          isRow ? "flex-row items-center gap-4" : "flex-col items-center text-center"
        } text-white`}
      >
        {/* icon circle */}
        <div
          className={`rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center shrink-0 ${
            isRow ? "w-12 h-12" : "w-14 h-14 mb-2"
          }`}
        >
          <Icon className={isRow ? "w-6 h-6" : "w-7 h-7"} />
        </div>

        <div className={isRow ? "flex-1 min-w-0" : "w-full"}>
          <div className="flex items-center gap-2 justify-center">
            <h4 className="font-heading font-bold text-sm truncate">{item.name}</h4>
            {item.badge && (
              <span className="bg-white/25 backdrop-blur-sm text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full leading-none">
                {item.badge}
              </span>
            )}
          </div>
          <p
            className={`text-[11px] text-white/80 mt-0.5 ${
              isRow ? "line-clamp-1" : "line-clamp-2"
            }`}
          >
            {item.description}
          </p>

          <div className={`mt-3 ${isRow ? "flex justify-end" : ""}`}>
            <button
              onClick={handleClick}
              disabled={disabled || status === "loading"}
              className="relative flex items-center justify-center gap-1.5 bg-white/25 hover:bg-white/35 backdrop-blur-sm text-xs font-bold py-2 px-4 rounded-xl transition-all active:scale-95 disabled:pointer-events-none"
            >
              {status === "loading" ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : isReal ? (
                <Lock className="w-3.5 h-3.5" />
              ) : (
                (() => {
                  const CIcon = CurrencyIcon[item.currency as "paws" | "gems"];
                  return <CIcon className="w-3.5 h-3.5" />;
                })()
              )}
              {isReal ? `$${item.cost.toFixed(2)}` : item.cost}
            </button>
          </div>
        </div>

        {/* "Coming Soon" tooltip for real-money items */}
        <AnimatePresence>
          {showTooltip && (
            <motion.div
              initial={{ opacity: 0, y: 6, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="absolute -top-9 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur-sm text-white text-[11px] font-semibold px-3 py-1.5 rounded-lg whitespace-nowrap z-40"
            >
              Coming Soon
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-black/80 rotate-45" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* insufficient-funds chip */}
        <AnimatePresence>
          {status === "error" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute bottom-1 left-1/2 -translate-x-1/2 bg-red-500/90 text-white text-[9px] font-bold px-2 py-0.5 rounded-full z-40"
            >
              Not enough {item.currency === "paws" ? "Paws" : "Gems"}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}