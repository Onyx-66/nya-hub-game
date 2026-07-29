import { motion, AnimatePresence } from "framer-motion";
import { Loader2, X, PawPrint, Gem, AlertCircle } from "lucide-react";
import type { StoreItem } from "./storeCatalog";

interface PurchaseModalProps {
  item: StoreItem | null;
  loading: boolean;
  error: string | null;
  onClose: () => void;
  onConfirm: () => void;
}

export default function PurchaseModal({
  item,
  loading,
  error,
  onClose,
  onConfirm,
}: PurchaseModalProps) {
  return (
    <AnimatePresence>
      {item && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* dialog — scale from 0.9 to 1.0 */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 10 }}
            transition={{ type: "spring", stiffness: 320, damping: 24 }}
            className="relative w-full max-w-sm bg-card border border-border rounded-3xl p-6 shadow-2xl"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-muted/60 flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>

            <ModalContent item={item} loading={loading} error={error} onConfirm={onConfirm} onClose={onClose} />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function ModalContent({
  item,
  loading,
  error,
  onConfirm,
  onClose,
}: {
  item: StoreItem;
  loading: boolean;
  error: string | null;
  onConfirm: () => void;
  onClose: () => void;
}) {
  const Icon = item.icon;
  const CurrencyIcon = item.currency === "paws" ? PawPrint : Gem;

  return (
    <div className="text-center">
      {/* icon */}
      <div
        className={`w-16 h-16 rounded-full bg-gradient-to-br ${item.gradient} flex items-center justify-center mx-auto mb-4 shadow-lg`}
      >
        <Icon className="w-8 h-8 text-white" />
      </div>

      <h3 className="font-heading font-bold text-lg text-foreground">{item.name}</h3>
      <p className="text-sm text-muted-foreground mt-1">{item.description}</p>

      {/* cost */}
      <div className="mt-4 inline-flex items-center gap-2 bg-muted/60 px-4 py-2 rounded-full">
        <CurrencyIcon
          className={`w-4 h-4 ${
            item.currency === "paws" ? "text-pink-400" : "text-cyan-300"
          }`}
        />
        <span className="font-bold text-foreground">{item.cost}</span>
        <span className="text-xs text-muted-foreground uppercase">
          {item.currency}
        </span>
      </div>

      {/* error */}
      {error && (
        <div className="mt-4 flex items-center justify-center gap-1.5 text-destructive text-sm">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      {/* actions */}
      <div className="mt-6 flex gap-3">
        <button
          onClick={onClose}
          disabled={loading}
          className="flex-1 py-2.5 rounded-2xl bg-muted/60 text-foreground text-sm font-heading font-semibold hover:bg-muted transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          disabled={loading}
          className="flex-1 py-2.5 rounded-2xl bg-gradient-to-r from-pink-400 to-violet-400 text-white text-sm font-heading font-semibold shadow-lg shadow-pink-500/20 transition-all active:scale-95 disabled:opacity-70 flex items-center justify-center gap-2"
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          {loading ? "Processing..." : "Confirm Purchase"}
        </button>
      </div>
    </div>
  );
}