import { Home, ShoppingBag, Trophy, User } from "lucide-react";
import { NavLink } from "react-router-dom";

const items = [
  { to: "/", label: "Games", icon: Home },
  { to: "/store", label: "Store", icon: ShoppingBag },
  { to: "/rankings", label: "Ranks", icon: Trophy },
  { to: "/profile", label: "Profile", icon: User },
];

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-border/50 bg-background/90 backdrop-blur-xl">
      <div className="max-w-md md:max-w-2xl mx-auto grid grid-cols-4 px-2 py-1.5">
        {items.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 py-2 rounded-2xl transition-colors ${
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`
            }
          >
            <Icon className="w-5 h-5" />
            <span className="text-[10px] font-heading font-medium">{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}