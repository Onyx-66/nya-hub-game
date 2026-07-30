import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, Pencil, Users, Trophy, Settings } from "lucide-react";
import NyaLayout from "@/components/nya/NyaLayout";
import NyaButton from "@/components/nya/NyaButton";
import { useAuthStore } from "@/store/authStore";
import { useEconomyStore } from "@/store/economyStore";
import ProfileBanner from "@/features/profile/ProfileBanner";
import ProfileStatsGrid from "@/features/profile/ProfileStatsGrid";
import ProfileAchievements from "@/features/profile/ProfileAchievements";
import DailyRewardCard from "@/features/profile/DailyRewardCard";
import AvatarPickerModal from "@/features/profile/AvatarPickerModal";
import BioEditorModal from "@/features/profile/BioEditorModal";
import { useChallengeStore } from "@/store/challengeStore";

export default function ProfileScreen() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { paws, gems } = useEconomyStore();
  const [showAvatar, setShowAvatar] = useState(false);
  const [showBio, setShowBio] = useState(false);

  useEffect(() => {
    useChallengeStore.getState().addProgress("profileVisited", 1);
  }, []);

  if (!user) {
    return (
      <NyaLayout title="Profile" showBack={false}>
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin" />
        </div>
      </NyaLayout>
    );
  }

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <NyaLayout title="Profile" showBack={false}>
      <div className="space-y-5">
        {/* Banner + avatar + bio */}
        <ProfileBanner
          onEditAvatar={() => setShowAvatar(true)}
          onEditBio={() => setShowBio(true)}
        />

        {/* Currency summary */}
        <div className="flex gap-3">
          <div className="flex-1 bg-pink-400/10 rounded-2xl p-3 text-center">
            <p className="text-2xl font-bold text-pink-400">{paws.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Paws</p>
          </div>
          <div className="flex-1 bg-cyan-400/10 rounded-2xl p-3 text-center">
            <p className="text-2xl font-bold text-cyan-300">{gems}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Gems</p>
          </div>
        </div>

        {/* Daily reward countdown */}
        <DailyRewardCard />

        {/* Stats grid */}
        <ProfileStatsGrid />

        {/* Achievements */}
        <ProfileAchievements />

        {/* Quick links */}
        <div className="grid grid-cols-3 gap-3">
          <button
            onClick={() => navigate("/friends")}
            className="flex flex-col items-center gap-1.5 py-3 rounded-2xl bg-muted/50 hover:bg-muted transition-colors"
          >
            <Users className="w-5 h-5 text-primary" />
            <span className="text-xs font-heading font-medium text-foreground">Friends</span>
          </button>
          <button
            onClick={() => navigate("/achievements")}
            className="flex flex-col items-center gap-1.5 py-3 rounded-2xl bg-muted/50 hover:bg-muted transition-colors"
          >
            <Trophy className="w-5 h-5 text-gold" />
            <span className="text-xs font-heading font-medium text-foreground">Achievements</span>
          </button>
          <button
            onClick={() => navigate("/settings")}
            className="flex flex-col items-center gap-1.5 py-3 rounded-2xl bg-muted/50 hover:bg-muted transition-colors"
          >
            <Settings className="w-5 h-5 text-muted-foreground" />
            <span className="text-xs font-heading font-medium text-foreground">Settings</span>
          </button>
        </div>

        {/* Actions */}
        <div className="space-y-3 pt-2">
          <NyaButton
            fullWidth
            variant="secondary"
            onClick={() => setShowBio(true)}
          >
            <Pencil className="w-4 h-4" /> Edit Bio
          </NyaButton>
          <NyaButton
            fullWidth
            variant="ghost"
            onClick={handleLogout}
            className="text-destructive hover:bg-destructive/10"
          >
            <LogOut className="w-4 h-4" /> Logout
          </NyaButton>
        </div>
      </div>

      <AvatarPickerModal open={showAvatar} onClose={() => setShowAvatar(false)} />
      <BioEditorModal open={showBio} onClose={() => setShowBio(false)} />
    </NyaLayout>
  );
}