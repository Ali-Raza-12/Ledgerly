import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, Mail, Save, Shield, User as UserIcon, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { PageHeader } from "@/components/PageHeader";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export default function Profile() {
  const { user, signOut, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");

  if (!user) return null;

  const initials = user.name.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase();
  const joined = new Date(user.createdAt).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });

  const onSave = (e: FormEvent) => {
    e.preventDefault();
    updateProfile({ name, email });
    toast.success("Profile updated");
  };

  const onLogout = () => {
    signOut();
    toast.success("Signed out");
    navigate("/signin", { replace: true });
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Profile" subtitle="Manage your account and preferences" />

      {/* Hero card */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 relative overflow-hidden">
        <div className="absolute -top-20 -right-20 h-56 w-56 rounded-full bg-primary/15 blur-3xl pointer-events-none" />
        <div className="relative flex items-center gap-5">
          <Avatar className="h-20 w-20 ring-2 ring-primary/40 shadow-glow">
            <AvatarFallback className="bg-gradient-primary text-primary-foreground text-2xl font-semibold">{initials}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <div className="text-xl font-semibold truncate">{user.name}</div>
            <div className="text-sm text-muted-foreground truncate flex items-center gap-1.5"><Mail className="h-3.5 w-3.5" />{user.email}</div>
            <div className="text-xs text-muted-foreground mt-1.5 flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" />Joined {joined}</div>
          </div>
        </div>
      </div>

      {/* Edit profile */}
      <div className="glass-card rounded-3xl p-6 sm:p-8">
        <div className="flex items-center gap-2 mb-5">
          <UserIcon className="h-4 w-4 text-primary" />
          <h2 className="font-semibold">Account details</h2>
        </div>
        <form onSubmit={onSave} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="p-name" className="text-xs uppercase tracking-wider text-muted-foreground">Full name</Label>
            <Input id="p-name" value={name} onChange={(e) => setName(e.target.value)} className="h-12 bg-secondary/60 border-border" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="p-email" className="text-xs uppercase tracking-wider text-muted-foreground">Email</Label>
            <Input id="p-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="h-12 bg-secondary/60 border-border" />
          </div>
          <Button type="submit" className="bg-gradient-primary text-primary-foreground font-semibold shadow-glow">
            <Save className="h-4 w-4" /> Save changes
          </Button>
        </form>
      </div>

      {/* Security / sign out */}
      <div className="glass-card rounded-3xl p-6 sm:p-8">
        <div className="flex items-center gap-2 mb-5">
          <Shield className="h-4 w-4 text-primary" />
          <h2 className="font-semibold">Security</h2>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 rounded-2xl bg-secondary/40 border border-border">
          <div>
            <div className="font-medium">Sign out of this device</div>
            <div className="text-sm text-muted-foreground">You'll need to sign back in to access your data.</div>
          </div>
          <Button onClick={onLogout} variant="destructive" className="shrink-0">
            <LogOut className="h-4 w-4" /> Sign out
          </Button>
        </div>
      </div>
    </div>
  );
}
