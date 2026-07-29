import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PawPrint, Gem } from "lucide-react";
import NyaLayout from "@/components/nya/NyaLayout";
import { useEconomyStore } from "@/store/economyStore";
import { useAuthStore } from "@/store/authStore";
import StoreItemCard, { type PurchaseStatus } from "./StoreItemCard";
import PurchaseModal from "./PurchaseModal";
import {
  POWERUP_ITEMS,
  CURRENCY_ITEMS,
  SPECIAL_ITEMS,
  type StoreItem,
  type StoreTab,
} from "./storeCatalog";

const TABS: { id: StoreTab; label: string }[] = [
  { id: "powerups", label: "Powerups" },
  { id: "currency", label: "Currency" },
  { id: "special", label: "Special" },
];

export default function StoreScreen() {
  const { paws, gems, spendPaws, spendGems, addPaws, addGems } = useEconomyStore();
  const { user, login } = useAuthStore();

  const [activeTab, setActiveTab] = useState<StoreTab>("powerups");
  const [selectedItem, setSelectedItem] = useState<StoreItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cardStatus, setCardStatus] = useState<{
    itemId: string;
    status: PurchaseStatus;
  }>({ itemId: "", status: "idle" });

  // Auto-login if no session (mock auth — ensures economy is initialized)
  useEffect(() => {
    if (!user) login();
  }, [user, login]);

  const setCard = (itemId: string, status: PurchaseStatus) =>
    setCardStatus({ itemId, status });

  const handleConfirm = () => {
    if (!selectedItem) return;
    const item = selectedItem;
    setLoading(true);
    setError(null);

    // brief delay to surface the loading state
    setTimeout(() => {
      const success =
        item.currency === "paws"
          ? spendPaws(item.cost, item.name)
          : spendGems(item.cost);

      setLoading(false);

      if (success) {
        if (item.grant) {
          if (item.grant.currency === "gems") addGems(item.grant.amount);
          else addPaws(item.grant.amount, `Purchased ${item.name}`);
        }
        setSelectedItem(null);
        setCard(item.id, "success");
        setTimeout(() => setCard(item.id, "idle"), 800);
      } else {
        setSelectedItem(null);
        setCard(item.id, "error");
        setTimeout(() => setCard(item.id, "idle"), 900);
      }
    }, 400);
  };

  const renderCard = (item: StoreItem, variant: "grid" | "row" = "grid") => {
    const affordable =
      item.currency === "paws" ? paws >= item.cost : gems >= item.cost;
    const status =
      cardStatus.itemId === item.id ? cardStatus.status : "idle";
    return (
      <StoreItemCard
        key={item.id}
        item={item}
        affordable={affordable}
        status={status}
        onPurchase={setSelectedItem}
        variant={variant}
      />
    );
  };

  return (
    <NyaLayout title="Store" showBack={false}>
      {/* ── Tab switcher ── */}
      <div className="flex gap-1 bg-muted/60 p-1 rounded-2xl mb-6">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="relative flex-1 py-2 text-xs font-heading font-semibold transition-colors"
          >
            <span
              className={
                activeTab === tab.id ? "text-white" : "text-muted-foreground"
              }
            >
              {tab.label}
            </span>
            {activeTab === tab.id && (
              <motion.span
                layoutId="store-tab"
                className="absolute inset-0 -z-10 rounded-xl bg-gradient-to-r from-pink-400 to-violet-400"
                transition={{ type: "spring", stiffness: 350, damping: 26 }}
              />
            )}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === "powerups" && (
            <div className="grid grid-cols-2 gap-3">
              {POWERUP_ITEMS.map((item) => renderCard(item))}
            </div>
          )}

          {activeTab === "currency" && (
            <div className="space-y-6">
              {/* Paws section */}
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <PawPrint className="w-4 h-4 text-pink-400" />
                  <h3 className="font-heading font-bold text-sm text-foreground uppercase tracking-wide">
                    Paws
                  </h3>
                </div>
                <div className="space-y-3">
                  {CURRENCY_ITEMS.filter((i) => i.section === "paws").map((item) =>
                    renderCard(item, "row"),
                  )}
                </div>
              </section>

              {/* Gems section */}
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <Gem className="w-4 h-4 text-cyan-300" />
                  <h3 className="font-heading font-bold text-sm text-foreground uppercase tracking-wide">
                    Gems
                  </h3>
                </div>
                <div className="space-y-3">
                  {CURRENCY_ITEMS.filter((i) => i.section === "gems").map((item) =>
                    renderCard(item, "row"),
                  )}
                </div>
              </section>
            </div>
          )}

          {activeTab === "special" && (
            <div className="space-y-3">
              {SPECIAL_ITEMS.map((item) => renderCard(item, "row"))}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <PurchaseModal
        item={selectedItem}
        loading={loading}
        error={error}
        onClose={() => {
          setSelectedItem(null);
          setError(null);
        }}
        onConfirm={handleConfirm}
      />
    </NyaLayout>
  );
}