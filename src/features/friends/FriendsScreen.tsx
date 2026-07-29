import { motion } from "framer-motion";
import { Users, UserPlus, Search } from "lucide-react";
import NyaLayout from "@/components/nya/NyaLayout";

export default function FriendsScreen() {
  return (
    <NyaLayout title="Friends" showBack={false}>
      <div className="space-y-5">
        {/* Tab stubs */}
        <div className="flex gap-2">
          {[
            { label: "Friends", icon: Users, active: true },
            { label: "Requests", icon: UserPlus, active: false },
            { label: "Search", icon: Search, active: false },
          ].map((tab) => (
            <button
              key={tab.label}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-colors ${
                tab.active
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              <tab.icon className="w-4 h-4" /> {tab.label}
            </button>
          ))}
        </div>

        {/* Empty state */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center py-20 text-center"
        >
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-pink-400 to-violet-500 flex items-center justify-center shadow-xl mb-4">
            <Users className="w-10 h-10 text-white" />
          </div>
          <h3 className="font-heading font-bold text-lg text-foreground">
            No friends yet!
          </h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-xs">
            Search for players to add them as friends.
          </p>
          <button className="mt-5 flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-heading font-bold text-sm active:scale-95 transition-transform">
            <Search className="w-4 h-4" /> Find Friends
          </button>
        </motion.div>
      </div>
    </NyaLayout>
  );
}