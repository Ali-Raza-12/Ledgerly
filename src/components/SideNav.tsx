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
  const displayName =
    (typeof user?.user_metadata?.name === "string" ? user.user_metadata.name : undefined) ||
    user?.email?.split("@")[0] ||
    "User";
  const initials = displayName.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate("/signin", { replace: true });
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 self-start border-r border-border bg-sidebar/60 backdrop-blur-xl lg:flex lg:flex-col">
      <div className="flex h-20 items-center gap-3 border-b border-border px-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-primary shadow-glow">
          <Wallet className="h-5 w-5 text-primary-foreground" />
        </div>
        <div>
          <div className="font-semibold tracking-tight">Ledger</div>
          <div className="text-xs text-muted-foreground">Expense tracker</div>
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
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "border border-primary/20 bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground",
              )
            }
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      {user && (
        <div className="border-t border-border px-3 pb-3 pt-3">
          <div className="rounded-xl border border-border bg-secondary/30 p-2">
            <button
              type="button"
              onClick={() => navigate("/profile")}
              className="flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left transition-colors hover:bg-secondary"
            >
              <Avatar className="h-9 w-9 ring-1 ring-primary/30">
                <AvatarFallback className="bg-gradient-primary text-xs font-semibold text-primary-foreground">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium">{displayName}</div>
                <div className="truncate text-xs text-muted-foreground">{user.email}</div>
              </div>
            </button>
            <button
              type="button"
              onClick={handleSignOut}
              className="mt-2 flex w-full items-center gap-2 rounded-xl px-2 py-2 text-sm text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}
