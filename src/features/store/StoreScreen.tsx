import { motion } from "framer-motion";
import { Coins, Gem, Check } from "lucide-react";
import { useState } from "react";
import { storeItems } from "@/services/games";
import { usePlayerStore } from "@/store/usePlayerStore";
import type { Currency } from "@/types";
import NyaLayout from "@/components/nya/NyaLayout";

export default function StoreScreen() {
  const { coins, gems, spendCoins, spendGems, addCoins } = usePlayerStore();
  const [purchased, setPurchased] = useState<string | null>(null);

  const handleBuy = (id: string, price: number, currency: Currency) => {
    const ok = currency === "paws" ? spendCoins(price) : spendGems(price);
    if (ok) {
      if (id.startsWith("paws-")) {
        addCoins(parseInt(id.split("-")[1]));
      }
      setPurchased(id);
      setTimeout(() => setPurchased(null), 1500);
    }
  };

  return (
    <NyaLayout title="Store" showBack={false}>
      <div className="space-y-5">
        {/* balance */}
        <div className="flex gap-3">
          <div className="flex-1 bg-muted/50 rounded-2xl p-4 flex items-center gap-2">
            <Coins className="w-5 h-5 text-yellow-400 fill-yellow-400" />
            <span className="font-bold text-foreground">{coins}</span>
          </div>
          <div className="flex-1 bg-muted/50 rounded-2xl p-4 flex items-center gap-2">
            <Gem className="w-5 h-5 text-cyan-400 fill-cyan-400" />
            <span className="font-bold text-foreground">{gems}</span>
          </div>
        </div>

        {/* items */}
        <div className="space-y-3">
          {storeItems.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-card rounded-2xl p-4 flex items-center gap-3 border border-border/50"
            >
              <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center text-2xl shrink-0">
                {item.icon}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-heading font-semibold text-sm text-foreground">
                  {item.name}
                </h3>
                <p className="text-xs text-muted-foreground truncate">
                  {item.description}
                </p>
              </div>
              <button
                onClick={() => handleBuy(item.id, item.price, item.currency)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                  purchased === item.id
                    ? "bg-green-500 text-white"
                    : item.currency === "paws"
                    ? "bg-yellow-400/20 text-yellow-400 hover:bg-yellow-400/30"
                    : "bg-cyan-400/20 text-cyan-400 hover:bg-cyan-400/30"
                }`}
              >
                {purchased === item.id ? (
                  <>
                    <Check className="w-3.5 h-3.5" /> Done
                  </>
                ) : (
                  <>
                    {item.currency === "paws" ? (
                      <Coins className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                    ) : (
                      <Gem className="w-3.5 h-3.5 fill-cyan-400 text-cyan-400" />
                    )}
                    {item.price}
                  </>
                )}
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </NyaLayout>
  );
}