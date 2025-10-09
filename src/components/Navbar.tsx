import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Dumbbell, LogOut, Home, Activity, Weight, Flame, Timer, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Navbar = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Logged out successfully");
    navigate("/auth");
  };

  return (
    <nav className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="p-2 rounded-lg bg-gradient-to-r from-primary to-secondary group-hover:opacity-80 transition-opacity">
              <Dumbbell className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-xl bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              FitTrack Pro
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2 text-sm hover:text-primary transition-colors">
              <Home className="h-4 w-4" />
              Dashboard
            </Link>
            <Link to="/bmi" className="flex items-center gap-2 text-sm hover:text-primary transition-colors">
              <TrendingUp className="h-4 w-4" />
              BMI
            </Link>
            <Link to="/weight" className="flex items-center gap-2 text-sm hover:text-primary transition-colors">
              <Weight className="h-4 w-4" />
              Weight
            </Link>
            <Link to="/workouts" className="flex items-center gap-2 text-sm hover:text-primary transition-colors">
              <Dumbbell className="h-4 w-4" />
              Workouts
            </Link>
            <Link to="/hiit" className="flex items-center gap-2 text-sm hover:text-primary transition-colors">
              <Timer className="h-4 w-4" />
              HIIT
            </Link>
            <Link to="/runs" className="flex items-center gap-2 text-sm hover:text-primary transition-colors">
              <Activity className="h-4 w-4" />
              Runs
            </Link>
            <Link to="/calories" className="flex items-center gap-2 text-sm hover:text-primary transition-colors">
              <Flame className="h-4 w-4" />
              Calories
            </Link>
          </div>

          <Button 
            onClick={handleLogout} 
            variant="outline"
            className="flex items-center gap-2"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </div>
      </div>
    </nav>
  );
};
