import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, UserPlus, Search, Gift, Check, X } from "lucide-react";
import NyaLayout from "@/components/nya/NyaLayout";
import Modal from "@/components/nya/Modal";
import NyaButton from "@/components/nya/NyaButton";
import CatAvatar from "@/components/nya/CatAvatar";
import { useFriendsStore, type Friend } from "@/store/friendsStore";
import { useEconomyStore } from "@/store/economyStore";
import { useAuthStore } from "@/store/authStore";
import { useAchievementStore } from "@/store/achievementStore";
import FriendCard from "./FriendCard";
import FriendSearchTab from "./FriendSearchTab";

type Tab = "friends" | "requests" | "search";

const GIFT_COST_GEMS = 1;
const GIFT_AMOUNT_PAWS = 50;

export default function FriendsScreen() {
  const { friends, requests, removeFriend, acceptRequest, declineRequest, generateMockRequests } =
    useFriendsStore();
  const { spendGems } = useEconomyStore();
  const { addTitle } = useAuthStore();
  const [tab, setTab] = useState<Tab>("friends");
  const [giftFriend, setGiftFriend] = useState<Friend | null>(null);
  const [giftError, setGiftError] = useState("");

  // Generate mock friend requests on first load
  useEffect(() => {
    generateMockRequests(3);
  }, [generateMockRequests]);

  const handleGift = (friend: Friend) => {
    setGiftFriend(friend);
    setGiftError("");
  };

  const handleConfirmGift = () => {
    if (!giftFriend) return;
    if (spendGems(GIFT_COST_GEMS)) {
      const ach = useAchievementStore.getState();
      ach.addProgress("giftsSent", 1);
      ach.addProgress("totalSpent", GIFT_COST_GEMS);
      ach.setProgress("friendsViewed", 1);
      setGiftFriend(null);
    } else {
      setGiftError("Not enough gems! Visit the store to get more.");
    }
  };

  const handleRemove = (friend: Friend) => {
    removeFriend(friend.id);
  };

  const handleAccept = (id: string) => {
    acceptRequest(id);
    const ach = useAchievementStore.getState();
    ach.setProgress("friendsCount", friends.length + 1);
    // Social butterfly achievement
    if (friends.length + 1 >= 1) {
      addTitle("social_butterfly");
    }
  };

  const tabs: { id: Tab; label: string; icon: typeof Users; count: number }[] = [
    { id: "friends", label: "Friends", icon: Users, count: friends.length },
    { id: "requests", label: "Requests", icon: UserPlus, count: requests.length },
    { id: "search", label: "Search", icon: Search, count: 0 },
  ];

  return (
    <NyaLayout title="Friends" showBack={false}>
      <div className="space-y-5">
        {/* Tabs */}
        <div className="flex gap-1.5">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-colors ${
                tab === t.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-card text-muted-foreground border border-border/50"
              }`}
            >
              <t.icon className="w-3.5 h-3.5" /> {t.label}
              {t.count > 0 && (
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                    tab === t.id ? "bg-primary-foreground/20" : "bg-primary/20 text-primary"
                  }`}
                >
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {tab === "friends" && (
              friends.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-pink-400 to-violet-500 flex items-center justify-center shadow-xl mb-4">
                    <Users className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="font-heading font-bold text-lg text-foreground">
                    No friends yet!
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1 max-w-xs">
                    Search for players to add them as friends.
                  </p>
                  <button
                    onClick={() => setTab("search")}
                    className="mt-5 flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-heading font-bold text-sm active:scale-95 transition-transform"
                  >
                    <Search className="w-4 h-4" /> Find Friends
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <AnimatePresence>
                    {friends.map((friend) => (
                      <FriendCard
                        key={friend.id}
                        friend={friend}
                        onGift={handleGift}
                        onRemove={handleRemove}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              )
            )}

            {tab === "requests" && (
              requests.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="w-16 h-16 rounded-3xl bg-muted flex items-center justify-center mb-3">
                    <UserPlus className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    No pending friend requests
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {requests.map((req) => (
                    <motion.div
                      key={req.id}
                      layout
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="flex items-center gap-3 bg-card rounded-2xl p-3 border border-border/50"
                    >
                      <CatAvatar avatarId={req.avatarId} size={44} className="shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-heading font-bold text-sm text-foreground truncate">
                          {req.pseudonym}
                        </p>
                        <p className="text-xs text-muted-foreground">Lv.{req.level}</p>
                      </div>
                      <button
                        onClick={() => handleAccept(req.id)}
                        className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center active:scale-90 transition-transform shrink-0"
                        aria-label="Accept"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => declineRequest(req.id)}
                        className="w-9 h-9 rounded-xl bg-destructive/15 text-destructive flex items-center justify-center active:scale-90 transition-transform shrink-0"
                        aria-label="Decline"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </motion.div>
                  ))}
                </div>
              )
            )}

            {tab === "search" && <FriendSearchTab />}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Gift modal */}
      <Modal open={!!giftFriend} onClose={() => setGiftFriend(null)} title="Send a Gift" size="sm">
        {giftFriend && (
          <div className="space-y-4 text-center">
            <CatAvatar avatarId={giftFriend.avatarId} size={64} className="mx-auto" />
            <div>
              <p className="font-heading font-bold text-foreground">{giftFriend.pseudonym}</p>
              <p className="text-xs text-muted-foreground">Send a gift of paws!</p>
            </div>
            <div className="bg-muted/50 rounded-2xl p-4">
              <div className="flex items-center justify-center gap-2">
                <Gift className="w-5 h-5 text-primary" />
                <span className="font-heading font-bold text-lg text-foreground">
                  {GIFT_AMOUNT_PAWS} Paws
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Costs {GIFT_COST_GEMS} Gem
              </p>
            </div>
            {giftError && <p className="text-xs text-destructive">{giftError}</p>}
            <div className="flex gap-3">
              <NyaButton fullWidth variant="secondary" onClick={() => setGiftFriend(null)}>
                Cancel
              </NyaButton>
              <NyaButton fullWidth onClick={handleConfirmGift}>
                <Gift className="w-4 h-4" /> Send Gift
              </NyaButton>
            </div>
          </div>
        )}
      </Modal>
    </NyaLayout>
  );
}