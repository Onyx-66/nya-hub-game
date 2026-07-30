import { motion } from "framer-motion";
import { Gift, Trash2, Star } from "lucide-react";
import CatAvatar from "@/components/nya/CatAvatar";
import type { Friend } from "@/store/friendsStore";

interface FriendCardProps {
  friend: Friend;
  onGift: (friend: Friend) => void;
  onRemove: (friend: Friend) => void;
}

export default function FriendCard({ friend, onGift, onRemove }: FriendCardProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="flex items-center gap-3 bg-card rounded-2xl p-3 border border-border/50"
    >
      <div className="relative shrink-0">
        <CatAvatar avatarId={friend.avatarId} size={44} />
        {friend.isOnline && (
          <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-400 ring-2 ring-card" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-heading font-bold text-sm text-foreground truncate">
          {friend.pseudonym}
        </p>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span className="flex items-center gap-0.5">
            <Star className="w-3 h-3 text-yellow-400" /> Lv.{Math.floor(friend.score / 1000) + 1}
          </span>
          <span>{friend.country.flag}</span>
        </div>
      </div>
      <div className="flex items-center gap-1.5 shrink-0">
        <button
          onClick={() => onGift(friend)}
          className="w-9 h-9 rounded-xl bg-primary/15 text-primary flex items-center justify-center active:scale-90 transition-transform"
          aria-label="Gift paws"
        >
          <Gift className="w-4 h-4" />
        </button>
        <button
          onClick={() => onRemove(friend)}
          className="w-9 h-9 rounded-xl bg-muted/60 text-muted-foreground flex items-center justify-center active:scale-90 transition-transform hover:text-destructive"
          aria-label="Remove friend"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
}