import { useState } from "react";
import { Volume2, Vibrate, Moon, Info, RotateCcw } from "lucide-react";
import { usePlayerStore } from "@/store/usePlayerStore";

function Toggle({ on, onClick }: { on: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`w-11 h-6 rounded-full transition-colors relative ${
        on ? "bg-primary" : "bg-muted"
      }`}
    >
      <span
        className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
          on ? "translate-x-5" : "translate-x-0.5"
        }`}
      />
    </button>
  );
}

export default function SettingsPage() {
  const { name, setName, reset } = usePlayerStore();
  const [sound, setSound] = useState(true);
  const [vibrate, setVibrate] = useState(true);
  const [darkMode, setDarkMode] = useState(true);

  const settings = [
    { icon: Volume2, label: "Sound Effects", on: sound, toggle: () => setSound(!sound) },
    { icon: Vibrate, label: "Haptic Feedback", on: vibrate, toggle: () => setVibrate(!vibrate) },
    { icon: Moon, label: "Dark Mode", on: darkMode, toggle: () => setDarkMode(!darkMode) },
  ];

  return (
    <div className="px-4 py-5 space-y-5">
      <div>
        <h1 className="font-display font-bold text-2xl text-foreground">Settings</h1>
      </div>

      {/* profile */}
      <div className="bg-card rounded-2xl p-4 border border-border/50">
        <label className="text-xs text-muted-foreground">Player Name</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full mt-1 bg-transparent text-foreground font-heading font-semibold text-lg outline-none border-b border-border/50 pb-1 focus:border-primary transition-colors"
        />
      </div>

      {/* toggles */}
      <div className="bg-card rounded-2xl border border-border/50 overflow-hidden">
        {settings.map((s, i) => (
          <div
            key={s.label}
            className={`flex items-center gap-3 p-4 ${
              i < settings.length - 1 ? "border-b border-border/50" : ""
            }`}
          >
            <s.icon className="w-5 h-5 text-muted-foreground" />
            <span className="flex-1 text-sm font-medium text-foreground">
              {s.label}
            </span>
            <Toggle on={s.on} onClick={s.toggle} />
          </div>
        ))}
      </div>

      {/* about */}
      <div className="bg-card rounded-2xl p-4 border border-border/50 flex items-center gap-3">
        <Info className="w-5 h-5 text-muted-foreground" />
        <div className="flex-1">
          <p className="text-sm font-medium text-foreground">About Nya Hub</p>
          <p className="text-xs text-muted-foreground">Version 1.0.0</p>
        </div>
      </div>

      {/* reset */}
      <button
        onClick={() => {
          if (confirm("Reset all progress? This cannot be undone.")) reset();
        }}
        className="w-full flex items-center justify-center gap-2 p-4 rounded-2xl border border-destructive/30 text-destructive text-sm font-bold hover:bg-destructive/5 transition-colors"
      >
        <RotateCcw className="w-4 h-4" />
        Reset Progress
      </button>
    </div>
  );
}