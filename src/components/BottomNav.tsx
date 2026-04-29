import { useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  Home,
  Clock,
  Car,
  BarChart3,
  Plus,
  HandCoins,
  LineChart,
  User,
  MoreHorizontal,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  DrawerClose,
} from "@/components/ui/drawer";

type NavItemDef = {
  to: string;
  label: string;
  icon: typeof Home;
};

const primaryLeft: NavItemDef[] = [
  { to: "/", label: "Home", icon: Home },
  { to: "/balance", label: "Balance", icon: LineChart },
];

const primaryRight: NavItemDef[] = [
  { to: "/history", label: "History", icon: Clock },
];

const moreItems: NavItemDef[] = [
  { to: "/lending", label: "Lending", icon: HandCoins },
  { to: "/bike", label: "Vehicle", icon: Car },
  { to: "/analytics", label: "Stats", icon: BarChart3 },
  { to: "/profile", label: "Profile", icon: User },
];

export function BottomNav() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [moreOpen, setMoreOpen] = useState(false);

  const moreActive = moreItems.some((i) => i.to === pathname);

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 safe-bottom lg:hidden">
      <div className="mx-3 mb-3 rounded-3xl glass-surface shadow-card">
        <div className="relative grid grid-cols-5 items-center px-2 py-2">
          {primaryLeft.map((item) => (
            <NavItem key={item.to} {...item} active={pathname === item.to} />
          ))}

          <div className="flex justify-center">
            <button
              onClick={() => navigate("/add")}
              aria-label="Add expense"
              className="-mt-8 flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-primary text-primary-foreground shadow-fab transition-bounce hover:scale-105 active:scale-95 animate-pulse-glow"
              style={{ transition: "var(--transition-bounce)" }}
            >
              <Plus className="h-6 w-6" strokeWidth={2.5} />
            </button>
          </div>

          {primaryRight.map((item) => (
            <NavItem key={item.to} {...item} active={pathname === item.to} />
          ))}

          <Drawer open={moreOpen} onOpenChange={setMoreOpen}>
            <DrawerTrigger asChild>
              <button
                aria-label="More"
                className={cn(
                  "flex flex-col items-center justify-center gap-1 rounded-2xl px-2 py-1.5 transition-colors",
                  moreActive ? "text-primary" : "text-muted-foreground",
                )}
              >
                <MoreHorizontal
                  className={cn(
                    "h-5 w-5",
                    moreActive && "drop-shadow-[0_0_8px_hsl(var(--primary)/0.6)]",
                  )}
                />
                <span className="text-[10px] font-medium tracking-wide">More</span>
              </button>
            </DrawerTrigger>
            <DrawerContent className="glass-surface border-border">
              <DrawerHeader className="flex flex-row items-center justify-between pb-2">
                <DrawerTitle className="text-base font-semibold">Quick navigation</DrawerTitle>
                <DrawerClose asChild>
                  <button
                    aria-label="Close"
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </DrawerClose>
              </DrawerHeader>
              <div className="grid grid-cols-4 gap-3 px-4 pb-8">
                {moreItems.map((item) => {
                  const active = pathname === item.to;
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.to}
                      onClick={() => {
                        setMoreOpen(false);
                        navigate(item.to);
                      }}
                      className={cn(
                        "group flex flex-col items-center gap-2 rounded-2xl border p-3 transition-all active:scale-95",
                        active
                          ? "border-primary/40 bg-primary/10 text-primary shadow-glow"
                          : "border-border bg-secondary/40 text-foreground hover:border-primary/30",
                      )}
                    >
                      <span
                        className={cn(
                          "flex h-11 w-11 items-center justify-center rounded-xl transition-colors",
                          active
                            ? "bg-gradient-primary text-primary-foreground"
                            : "bg-background/60 text-muted-foreground group-hover:text-primary",
                        )}
                      >
                        <Icon className="h-5 w-5" />
                      </span>
                      <span className="text-[11px] font-medium tracking-wide">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </DrawerContent>
          </Drawer>
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
        "flex flex-col items-center justify-center gap-1 rounded-2xl px-2 py-1.5 transition-colors",
        active ? "text-primary" : "text-muted-foreground",
      )}
    >
      <Icon className={cn("h-5 w-5", active && "drop-shadow-[0_0_8px_hsl(var(--primary)/0.6)]")} />
      <span className="text-[10px] font-medium tracking-wide">{label}</span>
    </NavLink>
  );
}
