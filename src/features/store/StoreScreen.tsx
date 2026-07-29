import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { PawPrint, Gem, Check, X, ShoppingCart } from "lucide-react";
import NyaLayout from "@/components/nya/NyaLayout";
import NyaButton from "@/components/nya/NyaButton";
import Modal from "@/components/nya/Modal";
import { useEconomyStore } from "@/store/economyStore";
import { useAuthStore } from "@/store/authStore";

// =============================================
// Mock Store Data
// =============================================

interface StoreItem {
  id: string;
  name: string;
  description: string;
  icon: string;
  price: number;
  currency: "paws" | "gems" | "real";
  type: "powerup" | "currency" | "special";
  /** For currency exchange items: what the purchase grants */
  grant?: { currency: "paws" | "gems"; amount: number };
}

const storeItems: StoreItem[] = [
  // ── Powerups ──
  {
    id: "extra-life",
    name: "Extra Life",
    description: "One more chance when you fail!",
    icon: "💗",
    price: 100,
    currency: "paws",
    type: "powerup",
  },
  {
    id: "bomb-boost",
    name: "Bomb Boost",
    description: "Clear nearby obstacles instantly.",
    icon: "💣",
    price: 5,
    currency: "gems",
    type: "powerup",
  },
  // ── Currency Exchange ──
  {
    id: "pile-of-gems",
    name: "Pile of Gems",
    description: "Exchange Paws for 10 Gems.",
    icon: "💎",
    price: 500,
    currency: "paws",
    type: "currency",
    grant: { currency: "gems", amount: 10 },
  },
  {
    id: "sack-of-paws",
    name: "Sack of Paws",
    description: "Exchange Gems for 200 Paws.",
    icon: "🐾",
    price: 2,
    currency: "gems",
    type: "currency",
    grant: { currency: "paws", amount: 200 },
  },
  // ── Special ──
  {
    id: "remove-ads",
    name: "Remove Ads",
    description: "Enjoy an ad-free experience forever.",
    icon: "🚫",
    price: 4.99,
    currency: "real",
    type: "special",
  },
];

const sectionConfig = [
  { type: "powerup" as const, title: "Powerups" },
  { type: "currency" as const, title: "Currency Exchange" },
  { type: "special" as const, title: "Special" },
];

// =============================================
// Component
// =============================================

interface ModalState {
  open: boolean;
  success: boolean;
  itemName: string;
  message: string;
}

export default function StoreScreen() {
  const { paws, gems, spendPaws, spendGems, addPaws, addGems } =
    useEconomyStore();
  const { user, login } = useAuthStore();
  const [modal, setModal] = useState<ModalState>({
    open: false,
    success: false,
    itemName: "",
    message: "",
  });

  // Auto-login if no session (mock auth — ensures economy is initialized)
  useEffect(() => {
    if (!user) login();
  }, [user, login]);

  const handleBuy = (item: StoreItem) => {
    // Special item: real money, coming soon
    if (item.currency === "real") {
      setModal({
        open: true,
        success: false,
        itemName: item.name,
        message: "Real money purchases are coming soon!",
      });
      return;
    }

    // Attempt to spend currency
    const success =
      item.currency === "paws"
        ? spendPaws(item.price, item.name)
        : spendGems(item.price);

    if (success) {
      // Grant currency exchange rewards
      if (item.grant) {
        if (item.grant.currency === "gems") {
          addGems(item.grant.amount);
        } else {
          addPaws(item.grant.amount, `Purchased ${item.name}`);
        }
      }
      setModal({
        open: true,
        success: true,
        itemName: item.name,
        message: item.grant
          ? `You received ${item.grant.amount} ${
              item.grant.currency === "gems" ? "Gems" : "Paws"
            }!`
          : "Purchase successful!",
      });
    } else {
      setModal({
        open: true,
        success: false,
        itemName: item.name,
        message: `Not enough ${item.currency === "paws" ? "Paws" : "Gems"}!`,
      });
    }
  };

  return (
    <NyaLayout title="Store" showBack={false}>
      <div className="space-y-6">
        {sectionConfig.map((section) => {
          const sectionItems = storeItems.filter(
            (i) => i.type === section.type
          );

          return (
            <div key={section.type}>
              <h3 className="font-heading font-bold text-sm text-muted-foreground uppercase tracking-wider mb-3">
                {section.title}
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {sectionItems.map((item, i) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className={`bg-card rounded-2xl p-4 border border-border/50 flex flex-col items-center text-center ${
                      item.type === "special" ? "col-span-2" : ""
                    }`}
                  >
                    <div className="w-14 h-14 rounded-2xl bg-muted/60 flex items-center justify-center text-3xl mb-2">
                      {item.icon}
                    </div>
                    <h4 className="font-heading font-semibold text-sm text-foreground">
                      {item.name}
                    </h4>
                    <p className="text-[11px] text-muted-foreground mt-0.5 mb-3 line-clamp-2">
                      {item.description}
                    </p>

                    {item.currency === "real" ? (
                      <button
                        onClick={() => handleBuy(item)}
                        className="w-full flex items-center justify-center gap-1.5 bg-gradient-to-r from-violet-400 to-pink-400 text-white text-[11px] font-bold py-2 rounded-xl active:scale-95 transition-transform"
                      >
                        <ShoppingCart className="w-3.5 h-3.5" /> Buy with Real
                        Money - Coming Soon
                      </button>
                    ) : (
                      <button
                        onClick={() => handleBuy(item)}
                        className={`w-full flex items-center justify-center gap-1.5 text-xs font-bold py-2 rounded-xl transition-all active:scale-95 ${
                          item.currency === "paws"
                            ? "bg-pink-400/15 text-pink-400 hover:bg-pink-400/25"
                            : "bg-cyan-400/15 text-cyan-300 hover:bg-cyan-400/25"
                        }`}
                      >
                        {item.currency === "paws" ? (
                          <PawPrint className="w-3.5 h-3.5" />
                        ) : (
                          <Gem className="w-3.5 h-3.5" />
                        )}
                        {item.price}
                      </button>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Success / Error Modal ── */}
      <Modal
        open={modal.open}
        onClose={() => setModal((m) => ({ ...m, open: false }))}
      >
        <div className="text-center py-2">
          <div
            className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
              modal.success ? "bg-emerald-400/15" : "bg-destructive/15"
            }`}
          >
            {modal.success ? (
              <Check className="w-8 h-8 text-emerald-400" />
            ) : (
              <X className="w-8 h-8 text-destructive" />
            )}
          </div>
          <h3 className="font-heading font-bold text-lg text-foreground">
            {modal.success ? "Success!" : "Oops!"}
          </h3>
          <p className="text-sm text-muted-foreground mt-1">{modal.message}</p>
          <p className="text-xs text-muted-foreground/70 mt-0.5">
            {modal.itemName}
          </p>
          <div className="mt-5">
            <NyaButton
              fullWidth
              onClick={() => setModal((m) => ({ ...m, open: false }))}
            >
              OK
            </NyaButton>
          </div>
        </div>
      </Modal>
    </NyaLayout>
  );
}