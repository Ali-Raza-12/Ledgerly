import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ExpensesProvider } from "@/hooks/useExpenses";
import { AppLayout } from "@/components/AppLayout";
import Index from "./pages/Index.tsx";
import { AddExpense } from "./pages/AddExpense";
import { History } from "./pages/History";
import { BikeTracker } from "./pages/BikeTracker";
import { Analytics } from "./pages/Analytics";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <ExpensesProvider>
        <BrowserRouter>
          <AppLayout>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/add" element={<AddExpense />} />
              <Route path="/history" element={<History />} />
              <Route path="/bike" element={<BikeTracker />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AppLayout>
        </BrowserRouter>
      </ExpensesProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
