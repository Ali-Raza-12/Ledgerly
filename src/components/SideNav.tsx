import { NavLink } from "react-router-dom";
import { Home, Clock, Car, BarChart3, Plus, Wallet, HandCoins, LineChart } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { to: "/", label: "Dashboard", icon: Home },
  { to: "/balance", label: "Balance", icon: LineChart },
  { to: "/add", label: "Add expense", icon: Plus },
  { to: "/history", label: "History", icon: Clock },
  { to: "/lending", label: "Lending", icon: HandCoins },
  { to: "/bike", label: "Vehicle", icon: Car },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
];

export function SideNav() {
  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 self-start border-r border-border bg-sidebar/60 backdrop-blur-xl lg:flex lg:flex-col">
      <div className="flex h-20 items-center gap-3 border-b border-border px-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-primary shadow-glow">
          <Wallet className="h-5 w-5 text-primary-foreground" />
        </div>
        <div>
          <div className="font-semibold tracking-tight">Ledgerly</div>
          <div className="text-xs text-muted-foreground">Personal finance hub</div>
        </div>
      </div>

      <nav className="app-scrollbar flex-1 space-y-1 overflow-y-auto px-3 py-6">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            className={({ isActive }) =>
              cn(
                "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-300",
                isActive
                  ? "border border-primary/20 bg-primary/10 text-primary shadow-glow"
                  : "border border-transparent text-muted-foreground hover:translate-x-0.5 hover:border-border hover:bg-secondary hover:text-foreground",
              )
            }
          >
            <item.icon className="h-4 w-4 transition-transform duration-300 group-hover:scale-110" />
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
