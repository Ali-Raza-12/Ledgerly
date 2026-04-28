import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Loader } from "./Loader";

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <Loader fullscreen label="Loading" sublabel="Securing your session" />;
  if (!user) return <Navigate to="/signin" replace state={{ from: location.pathname }} />;
  return <>{children}</>;
}
