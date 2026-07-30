import { motion } from "framer-motion";
import { Pencil, Calendar } from "lucide-react";
import CatAvatar from "@/components/nya/CatAvatar";
import { useAuthStore } from "@/store/authStore";
import { getBanner, getTitle } from "@/data/profileCatalog";
import PhotoUploadButton from "./PhotoUploadButton";
import BannerUploadButton from "./BannerUploadButton";

interface ProfileBannerProps {
  onEditAvatar: () => void;
  onEditBio: () => void;
}

/** XP needed to reach the next level from current XP. */
function xpForLevel(level: number): number {
  // levelFromXP uses sqrt(xp/100)+1, so xp = (level-1)^2 * 100
  return Math.pow(level - 1, 2) * 100;
}

export default function ProfileBanner({ onEditAvatar, onEditBio }: ProfileBannerProps) {
  const { user } = useAuthStore();
  if (!user) return null;

  const banner = getBanner(user.bannerId);
  const title = getTitle(user.title);
  const currentLevelXp = xpForLevel(user.level);
  const nextLevelXp = xpForLevel(user.level + 1);
  const xpProgress = Math.min(
    100,
    ((user.xp - currentLevelXp) / (nextLevelXp - currentLevelXp)) * 100
  );

  const joinedDate = new Date(user.joinedDate ?? new Date().toISOString()).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="rounded-3xl overflow-hidden border border-border/50 shadow-xl"
    >
      {/* Banner — custom image or gradient */}
      <div className="h-28 relative overflow-hidden">
        {user.customBannerUrl ? (
          <img src={user.customBannerUrl} alt="" className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          <div className={`absolute inset-0 bg-gradient-to-r ${banner.gradient}`} />
        )}
        <div className="absolute inset-0 bg-black/10" />
        <BannerUploadButton />
        <div className="absolute -bottom-1 right-4 flex items-center gap-1 text-[10px] font-bold bg-black/30 backdrop-blur-sm text-white px-2.5 py-1 rounded-full">
          <Calendar className="w-2.5 h-2.5" /> {joinedDate}
        </div>
      </div>

      {/* Avatar + info */}
      <div className="bg-card px-5 pb-5 -mt-12 relative">
        <div className="flex items-end justify-between">
          <div className="relative group rounded-full ring-4 ring-card">
            {user.customAvatarUrl ? (
              <img
                src={user.customAvatarUrl}
                alt={user.pseudonym}
                className="w-[88px] h-[88px] rounded-full object-cover ring-2 ring-primary/40"
              />
            ) : (
              <CatAvatar avatarId={parseInt(user.avatar) || 1} size={88} className="ring-2 ring-primary/40" />
            )}
            {/* Edit avatar (picks from preset cats) */}
            <button
              onClick={onEditAvatar}
              className="absolute bottom-0 left-0 w-7 h-7 rounded-full bg-primary flex items-center justify-center shadow-lg group-active:scale-90 transition-transform"
              aria-label="Choose avatar"
            >
              <Pencil className="w-3.5 h-3.5 text-primary-foreground" />
            </button>
            {/* Upload photo from device */}
            <div className="absolute bottom-0 right-0">
              <PhotoUploadButton />
            </div>
          </div>
        </div>

        <div className="mt-3">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="font-heading font-bold text-xl text-foreground">
              {user.pseudonym}
            </h2>
            {title && (
              <span className="text-[10px] font-bold bg-primary/15 text-primary px-2.5 py-0.5 rounded-full">
                {title.name}
              </span>
            )}
          </div>
          {user.country && (
            <p className="text-xs text-muted-foreground mt-0.5">{user.country}</p>
          )}
          {user.bio ? (
            <button
              onClick={onEditBio}
              className="text-sm text-foreground/80 mt-1.5 text-left max-w-full group"
            >
              <span className="group-hover:text-primary transition-colors">{user.bio}</span>
            </button>
          ) : (
            <button
              onClick={onEditBio}
              className="text-xs text-muted-foreground mt-1.5 flex items-center gap-1 hover:text-primary transition-colors"
            >
              <Pencil className="w-3 h-3" /> Add a bio
            </button>
          )}
        </div>

        {/* Level + XP bar */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="font-heading font-bold text-primary">Level {user.level}</span>
            <span className="text-muted-foreground">
              {user.xp.toLocaleString()} XP
            </span>
          </div>
          <div className="h-2.5 rounded-full bg-muted overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${xpProgress}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="h-full rounded-full bg-gradient-to-r from-primary to-accent"
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}