import { useNavigate } from "react-router-dom";
import { ChevronDown, LogOut, User as UserIcon, Sparkles, Check } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { UserAvatar } from "./UserAvatar";
import { PREMIUM_AVATARS } from "@/lib/avatars";
import { AvatarArt } from "./AvatarArt";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export function TopBar() {
  const { user, signOut, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [pickerOpen, setPickerOpen] = useState(false);

  if (!user) return null;

  const name =
    (typeof user.user_metadata?.name === "string" ? user.user_metadata.name : undefined) ||
    user.email?.split("@")[0] ||
    "User";
  const avatarId = (user.user_metadata?.avatar as string | undefined) ?? "aurora";

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success("Signed out");
      navigate("/signin", { replace: true });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to sign out");
    }
  };

  const handlePickAvatar = async (id: string) => {
    try {
      await updateProfile({ avatar: id });
      toast.success("Avatar updated");
      setPickerOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update avatar");
    }
  };

  return (
    <header className="sticky top-0 z-30 border-b border-border/60 bg-background/70 backdrop-blur-xl">
      <div className="max-w-3xl mx-auto px-4 lg:px-8 h-16 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Welcome back</p>
          <p className="truncate text-sm font-semibold">{name}</p>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className={cn(
                "group flex items-center gap-2 rounded-full border border-border bg-secondary/40 pl-1 pr-2 py-1",
                "transition-all duration-300 hover:border-primary/40 hover:bg-secondary/70 hover:shadow-glow",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
              )}
              aria-label="Open profile menu"
            >
              <UserAvatar name={name} avatarId={avatarId} size="sm" ring={false} />
              <span className="hidden sm:inline text-sm font-medium max-w-[120px] truncate">{name}</span>
              <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform duration-300 group-data-[state=open]:rotate-180" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64 glass-surface border-border p-2">
            <DropdownMenuLabel className="px-2 py-2">
              <div className="flex items-center gap-3">
                <UserAvatar name={name} avatarId={avatarId} size="md" />
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold">{name}</div>
                  <div className="truncate text-xs font-normal text-muted-foreground">{user.email}</div>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onSelect={() => navigate("/profile")}
              className="rounded-lg cursor-pointer focus:bg-primary/10 focus:text-primary"
            >
              <UserIcon className="h-4 w-4" />
              Profile page
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={() => setPickerOpen(true)}
              className="rounded-lg cursor-pointer focus:bg-primary/10 focus:text-primary"
            >
              <Sparkles className="h-4 w-4" />
              Choose avatar
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onSelect={handleSignOut}
              className="rounded-lg cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Dialog open={pickerOpen} onOpenChange={setPickerOpen}>
        <DialogContent className="glass-surface border-border max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Choose your avatar</DialogTitle>
            <DialogDescription>Pick a premium character — ninja, anime, fantasy and more.</DialogDescription>
          </DialogHeader>
          {(["Characters", "Animals", "Fantasy", "Sci-Fi"] as const).map((cat) => (
            <div key={cat} className="pt-3">
              <p className="px-1 pb-2 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">{cat}</p>
              <div className="grid grid-cols-4 gap-3">
                {PREMIUM_AVATARS.filter((a) => a.category === cat).map((a) => {
                  const active = a.id === avatarId;
                  return (
                    <button
                      key={a.id}
                      onClick={() => handlePickAvatar(a.id)}
                      className={cn(
                        "group relative flex flex-col items-center gap-2 rounded-2xl border p-2.5 transition-all duration-300",
                        "hover:-translate-y-0.5 hover:border-primary/40",
                        active ? "border-primary/60 bg-primary/10 shadow-glow" : "border-border bg-secondary/40",
                      )}
                      type="button"
                    >
                      <div
                        className="relative h-14 w-14 overflow-hidden rounded-full shadow-card transition-transform duration-300 group-hover:scale-110"
                        style={{ background: a.gradient }}
                      >
                        <AvatarArt kind={a.id} />
                        {active && (
                          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-glow">
                            <Check className="h-3 w-3" strokeWidth={3} />
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] font-medium text-muted-foreground group-hover:text-foreground">
                        {a.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </DialogContent>
      </Dialog>
    </header>
  );
}
