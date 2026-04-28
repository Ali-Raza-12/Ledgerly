import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppLayout } from "@/components/AppLayout";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index.tsx";
import { AddExpense } from "./pages/AddExpense";
import { History } from "./pages/History";
import { BikeTracker } from "./pages/BikeTracker";
import { Analytics } from "./pages/Analytics";
import { Lending } from "./pages/Lending";
import { Balance } from "./pages/Balance";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const AuthRoutes = () => {
  const { pathname } = useLocation();
  const isAuthRoute = pathname === "/signin" || pathname === "/signup";

  if (isAuthRoute) {
    return (
      <Routes>
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
      </Routes>
    );
  }

  return (
    <ProtectedRoute>
      <AppLayout>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/balance" element={<Balance />} />
          <Route path="/add" element={<AddExpense />} />
          <Route path="/history" element={<History />} />
          <Route path="/bike" element={<BikeTracker />} />
          <Route path="/lending" element={<Lending />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AppLayout>
    </ProtectedRoute>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AuthRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
