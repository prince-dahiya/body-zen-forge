import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Dumbbell, LogOut, Home, Play } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const Navbar = () => {
  const navigate = useNavigate();

  const startWorkout = (duration: string) => {
    navigate(`/exercises?filter=hiit&duration=${duration}`);
  };

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
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2">
                  <Play className="h-4 w-4" />
                  <span>Quick Workout</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>HIIT Workouts</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => startWorkout("7")}>
                  <Play className="h-4 w-4 mr-2" />
                  7 Minute HIIT
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => startWorkout("15")}>
                  <Play className="h-4 w-4 mr-2" />
                  15 Minute HIIT
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => startWorkout("20")}>
                  <Play className="h-4 w-4 mr-2" />
                  20 Minute HIIT
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => startWorkout("30")}>
                  <Play className="h-4 w-4 mr-2" />
                  30 Minute HIIT
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => startWorkout("45")}>
                  <Play className="h-4 w-4 mr-2" />
                  45 Minute HIIT
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("/exercises")}>
                  View All Exercises
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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
