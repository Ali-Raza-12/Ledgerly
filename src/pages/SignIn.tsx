import { FormEvent, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Loader2, Lock, Mail, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export default function SignIn() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation() as { state?: { from?: string } };
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email || !password) return toast.error("Enter your email and password");
    setLoading(true);
    try {
      await signIn(email, password);
      toast.success("Welcome back");
      navigate(location.state?.from || "/", { replace: true });
    } catch {
      toast.error("Could not sign in");
    } finally {
      setLoading(false);
    }
  };

  return <AuthShell title="Welcome back" subtitle="Sign in to continue tracking your money">
    <form onSubmit={onSubmit} className="space-y-5">
      <Field id="email" label="Email" icon={<Mail className="h-4 w-4" />}>
        <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10 h-12 bg-secondary/60 border-border" autoComplete="email" />
      </Field>
      <Field id="password" label="Password" icon={<Lock className="h-4 w-4" />}>
        <Input id="password" type={show ? "text" : "password"} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="pl-10 pr-10 h-12 bg-secondary/60 border-border" autoComplete="current-password" />
        <button type="button" onClick={() => setShow((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </Field>
      <Button type="submit" disabled={loading} className="w-full h-12 bg-gradient-primary text-primary-foreground font-semibold hover:opacity-90 shadow-glow">
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sign in"}
      </Button>
    </form>
    <p className="mt-6 text-center text-sm text-muted-foreground">
      New here? <Link to="/signup" className="text-primary font-medium hover:underline">Create account</Link>
    </p>
  </AuthShell>;
}

export function AuthShell({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="min-h-screen w-full flex items-center justify-center px-4 py-10 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-hero pointer-events-none" />
      <div className="absolute -top-32 -right-32 h-80 w-80 rounded-full bg-primary/20 blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 h-80 w-80 rounded-full bg-accent/20 blur-[120px] pointer-events-none" />
      <div className="relative w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="h-14 w-14 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-glow mb-4">
            <Wallet className="h-7 w-7 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
        </div>
        <div className="glass-card rounded-3xl p-6 sm:p-8">{children}</div>
        <p className="text-center text-xs text-muted-foreground mt-6">Premium • Secure • Encrypted</p>
      </div>
    </div>
  );
}

export function Field({ id, label, icon, children }: { id: string; label: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-xs uppercase tracking-wider text-muted-foreground">{label}</Label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">{icon}</span>
        {children}
      </div>
    </div>
  );
}
