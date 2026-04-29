import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { Home, Clock, Bike, BarChart3, Plus, HandCoins, LineChart, User } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { to: "/", label: "Home", icon: Home },
  { to: "/balance", label: "Balance", icon: LineChart },
  { to: "/history", label: "History", icon: Clock },
  { to: "/bike", label: "Bike", icon: Bike },
  { to: "/lending", label: "Lending", icon: HandCoins },
  { to: "/analytics", label: "Stats", icon: BarChart3 },
  { to: "/profile", label: "Profile", icon: User },
];

export function BottomNav() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 safe-bottom lg:hidden">
      <div className="mx-3 mb-3 rounded-3xl glass-surface shadow-card">
        <div className="scrollbar-hide flex items-center gap-1 overflow-x-auto px-2 py-2">
          <div className="flex justify-center px-1">
            <button
              onClick={() => navigate("/add")}
              aria-label="Add expense"
              className="-mt-8 flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-primary text-primary-foreground shadow-fab transition-bounce hover:scale-105 active:scale-95 animate-pulse-glow"
              style={{ transition: "var(--transition-bounce)" }}
            >
              <Plus className="h-6 w-6" strokeWidth={2.5} />
            </button>
          </div>

          {items.map((item) => (
            <NavItem
              key={item.to}
              {...item}
              active={pathname === item.to}
            />
          ))}
        </div>
      </div>
    </nav>
  );
}

function NavItem({
  to,
  label,
  icon: Icon,
  active,
}: {
  to: string;
  label: string;
  icon: typeof Home;
  active: boolean;
}) {
  return (
    <NavLink
      to={to}
      className={cn(
        "flex min-w-[68px] shrink-0 flex-col items-center justify-center gap-1 rounded-2xl px-2 py-1.5 transition-colors",
        active ? "text-primary" : "text-muted-foreground",
      )}
    >
      <Icon className={cn("h-5 w-5", active && "drop-shadow-[0_0_8px_hsl(var(--primary)/0.6)]")} />
      <span className="text-[10px] font-medium tracking-wide">{label}</span>
    </NavLink>
  );
}
