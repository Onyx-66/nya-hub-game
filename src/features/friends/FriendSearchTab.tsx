import { motion, AnimatePresence } from "framer-motion";
import { Search, UserPlus } from "lucide-react";
import CatAvatar from "@/components/nya/CatAvatar";
import { useFriendsStore } from "@/store/friendsStore";
import { useAuthStore } from "@/store/authStore";

export default function FriendSearchTab() {
  const { searchQuery, searchResults, searchPlayers, addFriend } = useFriendsStore();
  const { user } = useAuthStore();

  const hasQuery = searchQuery.trim().length > 0;

  return (
    <div className="space-y-4">
      {/* Search bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => searchPlayers(e.target.value, user?.pseudonym)}
          placeholder="Search players by name..."
          className="w-full bg-card rounded-2xl pl-10 pr-4 py-3 text-sm text-foreground border border-border/50 focus:border-primary transition-colors outline-none"
        />
      </div>

      {/* Results */}
      {!hasQuery ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-pink-400 to-violet-500 flex items-center justify-center shadow-lg mb-3">
            <Search className="w-8 h-8 text-white" />
          </div>
          <p className="text-sm text-muted-foreground">
            Start typing to find players
          </p>
        </div>
      ) : searchResults.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-sm text-muted-foreground">
            No players found for "{searchQuery}"
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground px-1">
            {searchResults.length} player{searchResults.length !== 1 ? "s" : ""} found
          </p>
          <AnimatePresence mode="popLayout">
            {searchResults.map((player) => (
              <motion.div
                key={player.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex items-center gap-3 bg-card rounded-2xl p-3 border border-border/50"
              >
                <CatAvatar avatarId={player.avatarId} size={44} className="shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-heading font-bold text-sm text-foreground truncate">
                    {player.pseudonym}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {player.country.flag} {player.country.name}
                  </p>
                </div>
                <button
                  onClick={() => addFriend(player)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold active:scale-95 transition-transform shrink-0"
                >
                  <UserPlus className="w-3.5 h-3.5" /> Add
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}