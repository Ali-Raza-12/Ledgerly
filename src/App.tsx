import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppLayout } from "@/components/AppLayout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AuthProvider } from "@/context/AuthContext";

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

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    }
  }
});

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/signin" element={<SignIn />} />
      <Route path="/signup" element={<SignUp />} />

      {/* Protected Routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Index />} />
        <Route path="balance" element={<Balance />} />
        <Route path="add" element={<AddExpense />} />
        <Route path="history" element={<History />} />
        <Route path="bike" element={<BikeTracker />} />
        <Route path="lending" element={<Lending />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="profile" element={<Profile />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />

      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>

    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
