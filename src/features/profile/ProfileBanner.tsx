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
    ((user.xp - currentLevelXp) / (nextLevelXp - currentLevelXp)) * 100,
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
      {/* ── Banner — 16:9 aspect ratio ── */}
      <div className="relative overflow-hidden aspect-[16/9]">
        {user.customBannerUrl ? (
          <img
            src={user.customBannerUrl}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className={`absolute inset-0 bg-gradient-to-br ${banner.gradient}`} />
        )}
        {/* Gradient overlay for depth and text legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
        <BannerUploadButton />
        {/* Date badge */}
        <div className="absolute bottom-3 right-3 flex items-center gap-1.5 text-[10px] font-bold bg-black/40 backdrop-blur-md text-white px-2.5 py-1 rounded-full">
          <Calendar className="w-2.5 h-2.5" /> {joinedDate}
        </div>
      </div>

      {/* ── Avatar + info ── */}
      <div className="bg-card px-5 pb-5 -mt-10 relative">
        <div className="flex items-end justify-between">
          <div className="relative">
            {/* Avatar with double ring for professional look */}
            <div className="rounded-full ring-4 ring-card p-0.5 shadow-lg">
              {user.customAvatarUrl ? (
                <img
                  src={user.customAvatarUrl}
                  alt={user.pseudonym}
                  className="w-[80px] h-[80px] rounded-full object-cover ring-2 ring-primary/50"
                />
              ) : (
                <div className="rounded-full ring-2 ring-primary/50">
                  <CatAvatar avatarId={parseInt(user.avatar) || 1} size={80} />
                </div>
              )}
            </div>
            {/* Edit avatar (picks from preset cats) */}
            <button
              onClick={onEditAvatar}
              className="absolute bottom-0 left-0 w-7 h-7 rounded-full bg-primary flex items-center justify-center shadow-lg ring-2 ring-card group-active:scale-90 transition-transform"
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

        {/* Name + title */}
        <div className="mt-3">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="font-heading font-bold text-xl text-foreground">
              {user.pseudonym}
            </h2>
            {title && (
              <span className="text-[10px] font-bold bg-primary/15 text-primary px-2.5 py-0.5 rounded-full border border-primary/20">
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