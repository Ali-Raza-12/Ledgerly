import { NavLink, useNavigate } from "react-router-dom";
import { Home, Clock, Bike, BarChart3, Plus, Wallet, HandCoins, LineChart, User, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const items = [
  { to: "/", label: "Dashboard", icon: Home },
  { to: "/balance", label: "Balance", icon: LineChart },
  { to: "/add", label: "Add expense", icon: Plus },
  { to: "/history", label: "History", icon: Clock },
  { to: "/bike", label: "Bike Tracker", icon: Bike },
  { to: "/lending", label: "Lending", icon: HandCoins },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/profile", label: "Profile", icon: User },
];

export function SideNav() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const initials = (user?.name ?? "U").split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase();

  return (
    <aside className="hidden lg:flex flex-col w-64 shrink-0 border-r border-border bg-sidebar/60 backdrop-blur-xl sticky top-0 h-screen self-start">
      <div className="flex items-center gap-3 px-6 h-20 border-b border-border">
        <div className="h-10 w-10 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow">
          <Wallet className="h-5 w-5 text-primary-foreground" />
        </div>
        <div>
          <div className="font-semibold tracking-tight">Ledger</div>
          <div className="text-xs text-muted-foreground">Expense tracker</div>
        </div>
      </div>
      <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
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
      {user && (
        <div className="px-3 pb-3 pt-3 border-t border-border">
          <button
            onClick={() => navigate("/profile")}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-secondary transition-colors group"
          >
            <Avatar className="h-9 w-9 ring-1 ring-primary/30">
              <AvatarFallback className="bg-gradient-primary text-primary-foreground text-xs font-semibold">{initials}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1 text-left">
              <div className="text-sm font-medium truncate">{user.name}</div>
              <div className="text-xs text-muted-foreground truncate">{user.email}</div>
            </div>
            <LogOut
              className="h-4 w-4 text-muted-foreground hover:text-destructive"
              onClick={(e) => {
                e.stopPropagation();
                signOut();
                navigate("/signin", { replace: true });
              }}
            />
          </button>
        </div>
      )}
    </aside>
  );
}
