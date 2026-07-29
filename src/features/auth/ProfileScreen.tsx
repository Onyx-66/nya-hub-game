import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Gamepad2,
  Trophy,
  Star,
  Award,
  LogOut,
  Pencil,
} from "lucide-react";
import NyaLayout from "@/components/nya/NyaLayout";
import NyaButton from "@/components/nya/NyaButton";
import Modal from "@/components/nya/Modal";
import { useAuthStore } from "@/store/authStore";
import { useEconomyStore } from "@/store/economyStore";

export default function ProfileScreen() {
  const navigate = useNavigate();
  const { user, logout, changePseudonym } = useAuthStore();
  const { paws, gems } = useEconomyStore();
  const [nameError, setNameError] = useState("");
  const [showNameModal, setShowNameModal] = useState(false);
  const [newName, setNewName] = useState("");

  if (!user) {
    return (
      <NyaLayout title="Profile" showBack={false}>
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin" />
        </div>
      </NyaLayout>
    );
  }

  const highScore = Object.values(user.gameStats.highScores).reduce(
    (max, s) => Math.max(max, s),
    0
  );

  const handleSaveName = () => {
    const ok = changePseudonym(newName.trim());
    if (ok) {
      setShowNameModal(false);
      setNewName("");
      setNameError("");
    } else {
      setNameError("That name is already taken");
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const stats = [
    {
      icon: Gamepad2,
      label: "Games Played",
      value: user.gameStats.gamesPlayed,
      color: "text-violet-400",
    },
    {
      icon: Trophy,
      label: "High Score",
      value: highScore,
      color: "text-yellow-400",
    },
    {
      icon: Star,
      label: "Level",
      value: user.level,
      color: "text-pink-400",
    },
    {
      icon: Award,
      label: "Achievements",
      value: user.gameStats.achievements.length,
      color: "text-emerald-400",
    },
  ];

  return (
    <NyaLayout title="Profile" showBack={false}>
      <div className="space-y-5">
        {/* ── Avatar + Pseudonym Card ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-card rounded-3xl p-6 border border-border/50 flex flex-col items-center text-center"
        >
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-pink-400 to-violet-500 flex items-center justify-center text-5xl shadow-xl mb-3">
            {user.avatar}
          </div>
          <h2 className="font-heading font-bold text-2xl text-foreground">
            {user.pseudonym}
          </h2>
          <span className="text-xs font-bold bg-primary/15 text-primary px-3 py-1 rounded-full mt-2">
            Level {user.level}
          </span>

          {/* currencies */}
          <div className="flex gap-3 mt-4 w-full">
            <div className="flex-1 bg-pink-400/10 rounded-2xl p-3 text-center">
              <p className="text-2xl font-bold text-pink-400">{paws}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Paws</p>
            </div>
            <div className="flex-1 bg-cyan-400/10 rounded-2xl p-3 text-center">
              <p className="text-2xl font-bold text-cyan-300">{gems}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Gems</p>
            </div>
          </div>
        </motion.div>

        {/* ── Stats Grid ── */}
        <div className="grid grid-cols-2 gap-3">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 + i * 0.05 }}
              className="bg-card rounded-2xl p-4 border border-border/50"
            >
              <stat.icon className={`w-5 h-5 ${stat.color} mb-2`} />
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>

        {/* ── Actions ── */}
        <div className="space-y-3 pt-2">
          <NyaButton
            fullWidth
            onClick={() => {
              setNewName(user.pseudonym);
              setShowNameModal(true);
            }}
          >
            <Pencil className="w-4 h-4" /> Change Pseudonym
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

      {/* ── Change Pseudonym Modal ── */}
      <Modal
        open={showNameModal}
        onClose={() => setShowNameModal(false)}
        title="Change Pseudonym"
      >
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Pick a new name for your cat persona!
          </p>
          <input
            type="text"
            value={newName}
            onChange={(e) => {
              setNewName(e.target.value);
              setNameError("");
            }}
            maxLength={20}
            placeholder="Enter new pseudonym..."
            className="w-full bg-muted/50 rounded-2xl px-4 py-3 text-foreground font-heading font-semibold outline-none border border-border/50 focus:border-primary transition-colors"
            onKeyDown={(e) => e.key === "Enter" && handleSaveName()}
            autoFocus
          />
          {nameError && (
            <p className="text-xs text-red-400 mt-1">{nameError}</p>
          )}
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
    </NyaLayout>
  );
}