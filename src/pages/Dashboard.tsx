import { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Dumbbell, Flame, TrendingUp, Weight, Timer } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import heroImage from "@/assets/fitness-hero.jpg";

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalWorkouts: 0,
    totalRuns: 0,
    todayCalories: 0,
    latestWeight: 0,
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Get workout count
    const { count: workoutCount } = await supabase
      .from("workout_logs")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id);

    // Get run count
    const { count: runCount } = await supabase
      .from("run_logs")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id);

    // Get today's calories
    const today = new Date().toISOString().split("T")[0];
    const { data: calorieData } = await supabase
      .from("calorie_entries")
      .select("calories")
      .eq("user_id", user.id)
      .eq("date", today);

    const todayCalories = calorieData?.reduce((sum, entry) => sum + entry.calories, 0) || 0;

    // Get latest weight
    const { data: weightData } = await supabase
      .from("weight_entries")
      .select("weight")
      .eq("user_id", user.id)
      .order("date", { ascending: false })
      .limit(1)
      .single();

    setStats({
      totalWorkouts: workoutCount || 0,
      totalRuns: runCount || 0,
      todayCalories,
      latestWeight: weightData?.weight || 0,
    });
  };

  const statCards = [
    {
      title: "Total Workouts",
      value: stats.totalWorkouts,
      icon: Dumbbell,
      link: "/workouts",
      gradient: "from-primary to-primary-glow",
    },
    {
      title: "Total Runs",
      value: stats.totalRuns,
      icon: Activity,
      link: "/runs",
      gradient: "from-secondary to-green-400",
    },
    {
      title: "Today's Calories",
      value: stats.todayCalories,
      icon: Flame,
      link: "/calories",
      gradient: "from-accent to-orange-400",
    },
    {
      title: "Current Weight",
      value: `${stats.latestWeight} kg`,
      icon: Weight,
      link: "/weight",
      gradient: "from-primary to-secondary",
    },
  ];

  const quickActions = [
    { title: "BMI Calculator", icon: TrendingUp, link: "/bmi", color: "primary" },
    { title: "Log Workout", icon: Dumbbell, link: "/workouts", color: "secondary" },
    { title: "HIIT Timer", icon: Timer, link: "/hiit", color: "accent" },
    { title: "Track Run", icon: Activity, link: "/runs", color: "primary" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <div className="relative h-64 overflow-hidden">
        <img 
          src={heroImage} 
          alt="Fitness" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background/90 to-background/50 flex items-center">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Welcome Back!
            </h1>
            <p className="text-lg text-muted-foreground">
              Track your progress and achieve your fitness goals
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat) => (
            <Link key={stat.title} to={stat.link}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
                <CardHeader className="pb-2">
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${stat.gradient} flex items-center justify-center mb-2 group-hover:scale-110 transition-transform`}>
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{stat.value}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Jump to your most used features</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {quickActions.map((action) => (
                <Link key={action.title} to={action.link}>
                  <div className="p-4 rounded-lg border hover:border-primary transition-colors cursor-pointer group">
                    <action.icon className="h-8 w-8 mb-2 text-primary group-hover:scale-110 transition-transform" />
                    <p className="font-medium">{action.title}</p>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
