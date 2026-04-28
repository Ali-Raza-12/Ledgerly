import { createContext, ReactNode, useContext, useEffect, useState } from "react";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  createdAt: string;
};

type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signOut: () => void;
  updateProfile: (patch: Partial<Pick<AuthUser, "name" | "email" | "avatarUrl">>) => void;
};

const STORAGE_KEY = "ledger.auth.user";
const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setUser(JSON.parse(raw));
    } catch {}
    setLoading(false);
  }, []);

  const persist = (u: AuthUser | null) => {
    setUser(u);
    if (u) localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
    else localStorage.removeItem(STORAGE_KEY);
  };

  // NOTE: Frontend-only scaffolding. Supabase auth will replace these.
  const signIn = async (email: string, _password: string) => {
    await new Promise((r) => setTimeout(r, 600));
    const name = email.split("@")[0].replace(/[._-]/g, " ");
    persist({
      id: crypto.randomUUID(),
      name: name.charAt(0).toUpperCase() + name.slice(1),
      email,
      createdAt: new Date().toISOString(),
    });
  };

  const signUp = async (name: string, email: string, _password: string) => {
    await new Promise((r) => setTimeout(r, 700));
    persist({
      id: crypto.randomUUID(),
      name,
      email,
      createdAt: new Date().toISOString(),
    });
  };

  const signOut = () => persist(null);

  const updateProfile: AuthContextValue["updateProfile"] = (patch) => {
    if (!user) return;
    persist({ ...user, ...patch });
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
