import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Loader2, Lock, Mail, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { AuthShell, Field } from "./SignIn";

export default function SignUp() {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) return toast.error("Fill all fields");
    if (password.length < 6) return toast.error("Password must be at least 6 characters");
    setLoading(true);
    try {
      await signUp(name, email, password);
      toast.success("Account created");
      navigate("/", { replace: true });
    } catch {
      toast.error("Could not create account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell title="Create your account" subtitle="Start tracking expenses in seconds">
      <form onSubmit={onSubmit} className="space-y-5">
        <Field id="name" label="Full name" icon={<User className="h-4 w-4" />}>
          <Input id="name" placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} className="pl-10 h-12 bg-secondary/60 border-border" autoComplete="name" />
        </Field>
        <Field id="email" label="Email" icon={<Mail className="h-4 w-4" />}>
          <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10 h-12 bg-secondary/60 border-border" autoComplete="email" />
        </Field>
        <Field id="password" label="Password" icon={<Lock className="h-4 w-4" />}>
          <Input id="password" type={show ? "text" : "password"} placeholder="At least 6 characters" value={password} onChange={(e) => setPassword(e.target.value)} className="pl-10 pr-10 h-12 bg-secondary/60 border-border" autoComplete="new-password" />
          <button type="button" onClick={() => setShow((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
            {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </Field>
        <Button type="submit" disabled={loading} className="w-full h-12 bg-gradient-primary text-primary-foreground font-semibold hover:opacity-90 shadow-glow">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create account"}
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account? <Link to="/signin" className="text-primary font-medium hover:underline">Sign in</Link>
      </p>
    </AuthShell>
  );
}
