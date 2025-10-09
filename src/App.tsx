import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthGuard } from "./components/AuthGuard";
import Dashboard from "./pages/Dashboard";
import Auth from "./pages/Auth";
import BMI from "./pages/BMI";
import Weight from "./pages/Weight";
import Workouts from "./pages/Workouts";
import HIIT from "./pages/HIIT";
import Runs from "./pages/Runs";
import Calories from "./pages/Calories";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route path="/" element={<AuthGuard><Dashboard /></AuthGuard>} />
          <Route path="/bmi" element={<AuthGuard><BMI /></AuthGuard>} />
          <Route path="/weight" element={<AuthGuard><Weight /></AuthGuard>} />
          <Route path="/workouts" element={<AuthGuard><Workouts /></AuthGuard>} />
          <Route path="/hiit" element={<AuthGuard><HIIT /></AuthGuard>} />
          <Route path="/runs" element={<AuthGuard><Runs /></AuthGuard>} />
          <Route path="/calories" element={<AuthGuard><Calories /></AuthGuard>} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
