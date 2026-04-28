import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { Home, Bike, BarChart3, Plus, LineChart } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { to: "/", label: "Home", icon: Home },
  { to: "/balance", label: "Balance", icon: LineChart },
  { to: "/bike", label: "Bike", icon: Bike },
  { to: "/analytics", label: "Stats", icon: BarChart3 },
];

export function BottomNav() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 safe-bottom">
      <div className="mx-3 mb-3 glass-surface rounded-3xl shadow-card">
        <div className="grid grid-cols-5 items-center px-2 py-2">
          {items.slice(0, 2).map((it) => (
            <NavItem key={it.to} {...it} active={pathname === it.to} />
          ))}
          <div className="flex justify-center">
            <button
              onClick={() => navigate("/add")}
              aria-label="Add expense"
              className="-mt-8 h-14 w-14 rounded-full bg-gradient-primary text-primary-foreground shadow-fab flex items-center justify-center transition-bounce hover:scale-105 active:scale-95 animate-pulse-glow"
              style={{ transition: "var(--transition-bounce)" }}
            >
              <Plus className="h-6 w-6" strokeWidth={2.5} />
            </button>
          </div>
          {items.slice(2).map((it) => (
            <NavItem key={it.to} {...it} active={pathname === it.to} />
          ))}
        </div>
      </div>
    </nav>
  );
}

function NavItem({ to, label, icon: Icon, active }: { to: string; label: string; icon: typeof Home; active: boolean }) {
  return (
    <NavLink
      to={to}
      className={cn(
        "flex flex-col items-center justify-center gap-1 py-1.5 rounded-2xl transition-colors",
        active ? "text-primary" : "text-muted-foreground"
      )}
    >
      <Icon className={cn("h-5 w-5", active && "drop-shadow-[0_0_8px_hsl(var(--primary)/0.6)]")} />
      <span className="text-[10px] font-medium tracking-wide">{label}</span>
    </NavLink>
  );
}
