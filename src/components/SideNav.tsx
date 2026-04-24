import { NavLink } from "react-router-dom";
import { Home, Clock, Bike, BarChart3, Plus, Wallet, HandCoins } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { to: "/", label: "Dashboard", icon: Home },
  { to: "/add", label: "Add expense", icon: Plus },
  { to: "/history", label: "History", icon: Clock },
  { to: "/bike", label: "Bike Tracker", icon: Bike },
  { to: "/lending", label: "Lending", icon: HandCoins },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
];

export function SideNav() {
  return (
    <aside className="hidden lg:flex flex-col w-64 shrink-0 border-r border-border bg-sidebar/60 backdrop-blur-xl">
      <div className="flex items-center gap-3 px-6 h-20 border-b border-border">
        <div className="h-10 w-10 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow">
          <Wallet className="h-5 w-5 text-primary-foreground" />
        </div>
        <div>
          <div className="font-semibold tracking-tight">Ledger</div>
          <div className="text-xs text-muted-foreground">Expense tracker</div>
        </div>
      </div>
      <nav className="flex-1 px-3 py-6 space-y-1">
        {items.map((it) => (
          <NavLink
            key={it.to}
            to={it.to}
            end={it.to === "/"}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary/10 text-primary border border-primary/20"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              )
            }
          >
            <it.icon className="h-4 w-4" />
            {it.label}
          </NavLink>
        ))}
      </nav>
      <div className="px-6 py-5 text-xs text-muted-foreground border-t border-border">
        <div>Premium • v1.0</div>
      </div>
    </aside>
  );
}
