import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Play, ShoppingBag, User, Users, Settings, PawPrint } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import LoginModal from "./LoginModal";

interface NavCard {
  icon: typeof Play;
  label: string;
  description: string;
  path: string;
  span2?: boolean;
}

const NAV_CARDS: NavCard[] = [
  {
    icon: Play,
    label: "Enter",
    description: "Explore all 8 games",
    path: "/hub",
    span2: true,
  },
  { icon: ShoppingBag, label: "Store", description: "Power-ups & items", path: "/store" },
  { icon: User, label: "Profile", description: "Your stats", path: "/profile" },
  { icon: Users, label: "Friends", description: "Connect", path: "/friends" },
  { icon: Settings, label: "Settings", description: "Preferences", path: "/settings" },
];

// Floating paw print positions
const PAW_PRINTS = [
  { left: "8%", delay: 0, duration: 8 },
  { left: "22%", delay: 2, duration: 10 },
  { left: "45%", delay: 4, duration: 7 },
  { left: "68%", delay: 1, duration: 9 },
  { left: "85%", delay: 3, duration: 11 },
  { left: "15%", delay: 5, duration: 12 },
  { left: "55%", delay: 2.5, duration: 8.5 },
  { left: "78%", delay: 6, duration: 9.5 },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [showLogin, setShowLogin] = useState(false);
  const [loginTarget, setLoginTarget] = useState<string>("/hub");

  const handleCardClick = (path: string) => {
    if (!user) {
      setLoginTarget(path);
      setShowLogin(true);
    } else {
      navigate(path);
    }
  };

  const handleLoginSuccess = () => {
    navigate(loginTarget);
  };

  const cards = useMemo(
    () =>
      NAV_CARDS.map((card, i) => ({
        ...card,
        icon: card.icon,
        index: i,
      })),
    []
  );

  return (
    <div className="fixed inset-0 bg-background flex flex-col items-center justify-between overflow-hidden py-8 px-4">
      {/* Floating paw prints */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {PAW_PRINTS.map((paw, i) => (
          <motion.div
            key={i}
            initial={{ y: "110vh", opacity: 0 }}
            animate={{ y: "-15vh", opacity: [0, 0.15, 0.15, 0] }}
            transition={{
              duration: paw.duration,
              delay: paw.delay,
              repeat: Infinity,
              ease: "linear",
            }}
            className="absolute"
            style={{ left: paw.left }}
          >
            <PawPrint className="w-8 h-8 text-primary/30" />
          </motion.div>
        ))}
      </div>

      {/* Top: Logo */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative flex flex-col items-center gap-2 z-10 mt-8"
      >
        <h1
          className="font-heading text-5xl tracking-tight bg-gradient-to-r from-pink-400 to-violet-400 bg-clip-text text-transparent"
          style={{ fontSize: "3rem" }}
        >
          NYA HUB
        </h1>
        <p className="text-sm text-muted-foreground">8 Games, One Universe</p>
      </motion.div>

      {/* Middle: Navigation grid */}
      <div className="relative z-10 w-full max-w-md mx-auto">
        <div className="grid grid-cols-2 gap-3">
          {cards.map((card) => (
            <motion.button
              key={card.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + card.index * 0.1, duration: 0.4 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleCardClick(card.path)}
              className={`relative overflow-hidden rounded-2xl p-4 flex flex-col items-center justify-center gap-2 text-center shadow-lg transition-colors ${
                card.span2 ? "col-span-2" : ""
              } ${
                card.span2
                  ? "bg-gradient-to-br from-pink-400 to-violet-400 text-white"
                  : "bg-card border border-border/50 text-foreground"
              }`}
            >
              {card.span2 && (
                <>
                  <motion.div
                    animate={{ scale: [1, 1.02, 1] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute inset-0"
                  />
                  <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-white/10 blur-xl" />
                </>
              )}
              <card.icon className="w-7 h-7 relative" />
              <div className="relative">
                <p className="font-heading font-bold text-base">{card.label}</p>
                <p
                  className={`text-[11px] ${
                    card.span2 ? "text-white/70" : "text-muted-foreground"
                  }`}
                >
                  {card.description}
                </p>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Bottom: Version */}
      <div className="relative z-10 text-center">
        <p className="text-xs text-muted-foreground">v1.0.0</p>
      </div>

      {/* Login Modal */}
      <LoginModal
        isOpen={showLogin}
        onClose={() => setShowLogin(false)}
        onLogin={handleLoginSuccess}
      />
    </div>
  );
}