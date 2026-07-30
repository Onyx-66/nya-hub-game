import { useState } from "react";
import { motion } from "framer-motion";
import {
  Volume2,
  Music,
  Vibrate,
  Pencil,
  Smile,
  Globe,
  Trash2,
  Download,
  Shield,
  FileText,
  Star,
  Share2,
  Mail,
  ChevronRight,
  RotateCcw,
  Bell,
  Trophy,
  Coins,
} from "lucide-react";
import NyaLayout from "@/components/nya/NyaLayout";
import NyaButton from "@/components/nya/NyaButton";
import ThemePicker from "@/components/nya/ThemePicker";
import Modal from "@/components/nya/Modal";
import Toggle from "@/components/ui/Toggle";
import { audioService } from "@/services/audioService";
import { useAuthStore } from "@/store/authStore";
import { useGameStore } from "@/store/useGameStore";
import { useOnboardingStore } from "@/store/onboardingStore";
import { usePreferencesStore } from "@/store/preferencesStore";
import { useToast } from "@/components/ui/use-toast";

const AVATARS = ["🐱", "😺", "😸", "😻", "😼", "🐈‍⬛", "👑", "🚀"];
const APP_VERSION = "1.0.0";

const COUNTRY_FLAGS: Record<string, string> = {
  Tunisia: "🇹🇳",
  "United States": "🇺🇸",
  France: "🇫🇷",
  Germany: "🇩🇪",
  Japan: "🇯🇵",
  Brazil: "🇧🇷",
  Egypt: "🇪🇬",
  "Saudi Arabia": "🇸🇦",
  Canada: "🇨🇦",
  "United Kingdom": "🇬🇧",
};

interface RowProps {
  icon: React.ElementType;
  label: string;
  onClick?: () => void;
  right?: React.ReactNode;
  destructive?: boolean;
}

function Row({ icon: Icon, label, onClick, right, destructive }: RowProps) {
  const Tag = onClick ? "button" : "div";
  return (
    <Tag
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3.5 ${
        onClick ? "hover:bg-muted/40 transition-colors text-left" : ""
      }`}
    >
      <Icon
        className={`w-5 h-5 shrink-0 ${
          destructive ? "text-destructive" : "text-primary"
        }`}
      />
      <span
        className={`flex-1 font-medium text-sm ${
          destructive ? "text-destructive" : "text-foreground"
        }`}
      >
        {label}
      </span>
      {right ?? (onClick && <ChevronRight className="w-4 h-4 text-muted-foreground" />)}
    </Tag>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="font-heading font-bold text-[11px] uppercase tracking-wider text-muted-foreground px-2 mb-2">
        {title}
      </h2>
      <div className="bg-card rounded-2xl border border-border/50 divide-y divide-border/40 overflow-hidden">
        {children}
      </div>
    </div>
  );
}

export default function SettingsScreen() {
  const { user, updateProfile } = useAuthStore();
  const clearGameData = useGameStore((s) => s.clearGameData);
  const resetOnboarding = useOnboardingStore((s) => s.reset);
  const notifSettings = usePreferencesStore((s) => s.notifications);
  const toggleNotif = usePreferencesStore((s) => s.toggleNotification);
  const { toast } = useToast();

  const [sfxOn, setSfxOn] = useState(audioService.isSFXEnabled());
  const [musicOn, setMusicOn] = useState(audioService.isMusicEnabled());
  const [sfxVol, setSfxVol] = useState(audioService.getSFXVolume());
  const [musicVol, setMusicVol] = useState(audioService.getMusicVolume());
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [showNameModal, setShowNameModal] = useState(false);
  const [newName, setNewName] = useState("");
  const [showClearModal, setShowClearModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [legalDoc, setLegalDoc] = useState<null | "privacy" | "terms">(null);

  if (!user) {
    return (
      <NyaLayout title="Settings" showBack={false}>
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin" />
        </div>
      </NyaLayout>
    );
  }

  const prefs = user.preferences;
  const setPref = (key: keyof typeof prefs, value: boolean) =>
    updateProfile({ preferences: { ...prefs, [key]: value } });

  const countryFlag = user.country ? COUNTRY_FLAGS[user.country] ?? "🌍" : "🌍";
  const countryLabel = user.country || "Global";

  const handleSaveName = () => {
    if (newName.trim()) {
      updateProfile({ pseudonym: newName.trim() });
      setShowNameModal(false);
      setNewName("");
      toast({ title: "Pseudonym updated!" });
    }
  };

  const handleClearData = () => {
    clearGameData();
    setShowClearModal(false);
    toast({ title: "Game data cleared", description: "Your progress has been reset." });
  };

  const handleShare = async () => {
    const shareData = {
      title: "Nya Hub",
      text: "Check out Nya Hub — cute cat games! 🐾",
      url: window.location.origin,
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        /* user cancelled */
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareData.url);
        toast({ title: "Link copied to clipboard!" });
      } catch {
        toast({ title: "Sharing not available" });
      }
    }
  };

  return (
    <NyaLayout title="Settings" showBack={false}>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="space-y-6"
      >
        {/* ── SOUND & VIBRATION ── */}
        <Section title="Sound & Vibration">
          <Row
            icon={Volume2}
            label="Sound Effects"
            right={
              <Toggle
                checked={sfxOn}
                onChange={(v) => {
                  if (v !== sfxOn) {
                    audioService.toggleSFX();
                    setSfxOn(audioService.isSFXEnabled());
                    audioService.playSFX("button-click");
                  }
                }}
              />
            }
          />
          {sfxOn && (
            <div className="px-4 py-3 flex items-center gap-3">
              <Volume2 className="w-4 h-4 text-muted-foreground shrink-0" />
              <input
                type="range"
                min={0}
                max={100}
                value={Math.round(sfxVol * 100)}
                onChange={(e) => {
                  const v = Number(e.target.value) / 100;
                  setSfxVol(v);
                  audioService.setSFXVolume(v);
                }}
                className="flex-1 accent-primary h-2"
              />
              <span className="text-xs text-muted-foreground w-8 text-right">
                {Math.round(sfxVol * 100)}%
              </span>
            </div>
          )}
          <Row
            icon={Music}
            label="Background Music"
            right={
              <Toggle
                checked={musicOn}
                onChange={(v) => {
                  if (v !== musicOn) {
                    audioService.toggleMusic();
                    setMusicOn(audioService.isMusicEnabled());
                    if (audioService.isMusicEnabled()) {
                      audioService.playMusic("menu-soft", true);
                    }
                  }
                }}
              />
            }
          />
          {musicOn && (
            <div className="px-4 py-3 flex items-center gap-3">
              <Music className="w-4 h-4 text-muted-foreground shrink-0" />
              <input
                type="range"
                min={0}
                max={100}
                value={Math.round(musicVol * 100)}
                onChange={(e) => {
                  const v = Number(e.target.value) / 100;
                  setMusicVol(v);
                  audioService.setMusicVolume(v);
                }}
                className="flex-1 accent-primary h-2"
              />
              <span className="text-xs text-muted-foreground w-8 text-right">
                {Math.round(musicVol * 100)}%
              </span>
            </div>
          )}
          <Row
            icon={Vibrate}
            label="Vibration"
            right={
              <Toggle
                checked={prefs.hapticsEnabled}
                onChange={(v) => setPref("hapticsEnabled", v)}
              />
            }
          />
        </Section>

        {/* ── NOTIFICATIONS ── */}
        <Section title="Notifications">
          <Row
            icon={Trophy}
            label="Achievement Unlocks"
            right={
              <Toggle
                checked={notifSettings.achievements}
                onChange={(v) => toggleNotif("achievements")}
              />
            }
          />
          <Row
            icon={Star}
            label="Daily Challenges"
            right={
              <Toggle
                checked={notifSettings.challenges}
                onChange={(v) => toggleNotif("challenges")}
              />
            }
          />
          <Row
            icon={Coins}
            label="Currency & Rewards"
            right={
              <Toggle
                checked={notifSettings.economy}
                onChange={(v) => toggleNotif("economy")}
              />
            }
          />
        </Section>

        {/* ── APPEARANCE ── */}
        <Section title="Appearance">
          <ThemePicker />
        </Section>

        {/* ── ACCOUNT ── */}
        <Section title="Account">
          <Row
            icon={Pencil}
            label="Change Pseudonym"
            onClick={() => {
              setNewName(user.pseudonym);
              setShowNameModal(true);
            }}
            right={
              <span className="text-sm text-muted-foreground truncate max-w-[140px]">
                {user.pseudonym}
              </span>
            }
          />
          <Row
            icon={Smile}
            label="Change Avatar"
            onClick={() => setShowAvatarModal(true)}
            right={<span className="text-2xl">{user.avatar}</span>}
          />
          <Row
            icon={Globe}
            label="Country"
            right={
              <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                <span className="text-lg">{countryFlag}</span>
                {countryLabel}
              </span>
            }
          />
        </Section>

        {/* ── DATA ── */}
        <Section title="Data">
          <Row
            icon={Trash2}
            label="Clear Game Data"
            destructive
            onClick={() => setShowClearModal(true)}
          />
          <Row
            icon={Download}
            label="Export Data"
            onClick={() => setShowExportModal(true)}
          />
          <Row
            icon={Shield}
            label="Privacy Policy"
            onClick={() => setLegalDoc("privacy")}
          />
          <Row
            icon={FileText}
            label="Terms of Service"
            onClick={() => setLegalDoc("terms")}
          />
        </Section>

        {/* ── ABOUT ── */}
        <Section title="About">
          <Row
            icon={RotateCcw}
            label="Replay Tutorial"
            onClick={() => {
              resetOnboarding();
              toast({ title: "Tutorial will show on next hub visit!" });
            }}
          />
          <Row
            icon={Star}
            label="Rate the App"
            onClick={() => toast({ title: "Thanks for the love! ⭐" })}
          />
          <Row
            icon={Share2}
            label="Share with Friends"
            onClick={handleShare}
          />
          <Row
            icon={Mail}
            label="Contact Support"
            onClick={() =>
              toast({ title: "Support", description: "Reach us anytime!" })
            }
          />
          <div className="px-4 py-3.5 flex items-center justify-between">
            <span className="text-sm text-muted-foreground">App Version</span>
            <span className="text-sm font-mono text-foreground">v{APP_VERSION}</span>
          </div>
        </Section>

        <p className="text-center text-xs text-muted-foreground pt-2">
          Made with 🐾 for cat lovers everywhere
        </p>
      </motion.div>

      {/* ── Change Pseudonym Modal ── */}
      <Modal
        open={showNameModal}
        onClose={() => setShowNameModal(false)}
        title="Change Pseudonym"
      >
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Pick a new name for your cat persona! 🐱
          </p>
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            maxLength={20}
            placeholder="Enter new pseudonym..."
            className="w-full bg-muted/50 rounded-2xl px-4 py-3 text-foreground font-heading font-semibold outline-none border border-border/50 focus:border-primary transition-colors"
            onKeyDown={(e) => e.key === "Enter" && handleSaveName()}
            autoFocus
          />
          <div className="flex gap-3">
            <NyaButton
              fullWidth
              variant="secondary"
              onClick={() => setShowNameModal(false)}
            >
              Cancel
            </NyaButton>
            <NyaButton
              fullWidth
              onClick={handleSaveName}
              disabled={!newName.trim()}
            >
              Save
            </NyaButton>
          </div>
        </div>
      </Modal>

      {/* ── Change Avatar Modal ── */}
      <Modal
        open={showAvatarModal}
        onClose={() => setShowAvatarModal(false)}
        title="Choose Avatar"
      >
        <div className="grid grid-cols-4 gap-3">
          {AVATARS.map((a) => (
            <button
              key={a}
              type="button"
              onClick={() => {
                updateProfile({ avatar: a });
                setShowAvatarModal(false);
                toast({ title: "Avatar updated!" });
              }}
              className={`aspect-square rounded-2xl text-3xl flex items-center justify-center transition-all ${
                user.avatar === a
                  ? "bg-primary/20 ring-2 ring-primary scale-105"
                  : "bg-muted/40 hover:bg-muted"
              }`}
            >
              {a}
            </button>
          ))}
        </div>
      </Modal>

      {/* ── Clear Data Confirmation ── */}
      <Modal
        open={showClearModal}
        onClose={() => setShowClearModal(false)}
        title="Clear Game Data?"
      >
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            This will permanently reset all your high scores and play history. This
            action cannot be undone.
          </p>
          <div className="flex gap-3">
            <NyaButton
              fullWidth
              variant="secondary"
              onClick={() => setShowClearModal(false)}
            >
              Cancel
            </NyaButton>
            <NyaButton
              fullWidth
              variant="ghost"
              onClick={handleClearData}
              className="text-destructive hover:bg-destructive/10 border border-destructive/30"
            >
              Clear
            </NyaButton>
          </div>
        </div>
      </Modal>

      {/* ── Export Data Modal ── */}
      <Modal
        open={showExportModal}
        onClose={() => setShowExportModal(false)}
        title="Export Data"
      >
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            A downloadable export of your data will be available here soon.
          </p>
          <pre className="text-[10px] leading-relaxed bg-muted/50 rounded-2xl p-3 overflow-x-auto max-h-60 text-muted-foreground font-mono">
            {JSON.stringify(user, null, 2)}
          </pre>
        </div>
      </Modal>

      {/* ── Legal Modal ── */}
      <Modal
        open={legalDoc !== null}
        onClose={() => setLegalDoc(null)}
        title={legalDoc === "privacy" ? "Privacy Policy" : "Terms of Service"}
      >
        <div className="space-y-3 text-sm text-muted-foreground leading-relaxed max-h-[50vh] overflow-y-auto">
          {legalDoc === "privacy" ? (
            <>
              <p>
                Nya Hub respects your privacy. This policy outlines how we handle
                your data.
              </p>
              <p>
                We store your pseudonym, avatar, and game progress locally on your
                device. No personal data is collected or shared with third parties.
              </p>
              <p>
                You can clear all data at any time from the Data section above.
              </p>
            </>
          ) : (
            <>
              <p>By using Nya Hub, you agree to play fair and have fun.</p>
              <p>
                Game scores and achievements are for entertainment purposes. We
                reserve the right to update these terms at any time.
              </p>
              <p>Please enjoy the cat games responsibly. 🐱</p>
            </>
          )}
        </div>
      </Modal>
    </NyaLayout>
  );
}