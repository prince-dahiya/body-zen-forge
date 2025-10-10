import { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Settings as SettingsIcon, Target, TrendingDown, Activity } from "lucide-react";

interface Profile {
  full_name: string;
  age: number;
  gender: string;
  height: number;
  weight?: number;
  calorie_goal: number;
  activity_level: string;
  goal: string;
}

const Settings = () => {
  const [profile, setProfile] = useState<Partial<Profile>>({});
  const [loading, setLoading] = useState(false);
  const [calculatedCalories, setCalculatedCalories] = useState<number | null>(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (!error && data) {
      setProfile(data);
    }
  };

  const calculateCalories = () => {
    const { age, gender, height, weight } = profile;
    
    if (!age || !gender || !height || !weight) {
      toast.error("Please fill in all basic information first");
      return;
    }

    // BMR calculation using Mifflin-St Jeor Equation
    let bmr: number;
    if (gender === "male") {
      bmr = 10 * weight + 6.25 * height - 5 * age + 5;
    } else {
      bmr = 10 * weight + 6.25 * height - 5 * age - 161;
    }

    // Activity level multipliers
    const activityMultipliers: Record<string, number> = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      "very-active": 1.9,
    };

    const multiplier = activityMultipliers[profile.activity_level || "sedentary"];
    let tdee = bmr * multiplier;

    // Goal adjustments
    if (profile.goal === "lose-weight") {
      tdee -= 500; // 500 calorie deficit for weight loss
    } else if (profile.goal === "gain-muscle") {
      tdee += 300; // 300 calorie surplus for muscle gain
    }

    setCalculatedCalories(Math.round(tdee));
    setProfile({ ...profile, calorie_goal: Math.round(tdee) });
    toast.success(`Calculated: ${Math.round(tdee)} calories/day`);
  };

  const saveProfile = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: profile.full_name,
        age: profile.age,
        gender: profile.gender,
        height: profile.height,
        calorie_goal: profile.calorie_goal,
        activity_level: profile.activity_level,
        goal: profile.goal,
      })
      .eq("id", user.id);

    if (error) {
      toast.error("Failed to save settings");
    } else {
      toast.success("Settings saved successfully!");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-lg bg-gradient-to-br from-primary to-secondary">
            <SettingsIcon className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Settings</h1>
            <p className="text-muted-foreground">Customize your fitness goals</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Your personal details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input
                  placeholder="John Doe"
                  value={profile.full_name || ""}
                  onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Age</Label>
                  <Input
                    type="number"
                    placeholder="25"
                    value={profile.age || ""}
                    onChange={(e) => setProfile({ ...profile, age: parseInt(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Gender</Label>
                  <Select 
                    value={profile.gender} 
                    onValueChange={(value) => setProfile({ ...profile, gender: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Height (cm)</Label>
                <Input
                  type="number"
                  placeholder="175"
                  value={profile.height || ""}
                  onChange={(e) => setProfile({ ...profile, height: parseFloat(e.target.value) })}
                />
              </div>
            </CardContent>
          </Card>

          {/* Fitness Goals */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Fitness Goals
              </CardTitle>
              <CardDescription>Set your targets</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <TrendingDown className="h-4 w-4" />
                  Goal
                </Label>
                <Select 
                  value={profile.goal} 
                  onValueChange={(value) => setProfile({ ...profile, goal: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select goal" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lose-weight">Lose Weight</SelectItem>
                    <SelectItem value="maintain">Maintain Weight</SelectItem>
                    <SelectItem value="gain-muscle">Gain Muscle</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  Activity Level
                </Label>
                <Select 
                  value={profile.activity_level} 
                  onValueChange={(value) => setProfile({ ...profile, activity_level: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select activity level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sedentary">Sedentary (little or no exercise)</SelectItem>
                    <SelectItem value="light">Light (1-3 days/week)</SelectItem>
                    <SelectItem value="moderate">Moderate (3-5 days/week)</SelectItem>
                    <SelectItem value="active">Active (6-7 days/week)</SelectItem>
                    <SelectItem value="very-active">Very Active (2x per day)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="p-4 rounded-lg bg-muted/50 space-y-2">
                <p className="text-sm font-medium">Need help calculating?</p>
                <p className="text-xs text-muted-foreground">
                  We'll calculate your daily calorie target based on your information and goals.
                </p>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={calculateCalories}
                >
                  Calculate My Calories
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Calorie Target */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Daily Calorie Target</CardTitle>
              <CardDescription>
                Set your daily calorie goal or use our calculator
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Calories per Day</Label>
                <Input
                  type="number"
                  placeholder="2000"
                  value={profile.calorie_goal || ""}
                  onChange={(e) => setProfile({ ...profile, calorie_goal: parseInt(e.target.value) })}
                />
                <p className="text-xs text-muted-foreground">
                  {profile.goal === "lose-weight" && "💡 For weight loss: 500 cal deficit recommended"}
                  {profile.goal === "gain-muscle" && "💡 For muscle gain: 300 cal surplus recommended"}
                  {profile.goal === "maintain" && "💡 For maintenance: match your TDEE"}
                </p>
              </div>

              {calculatedCalories && (
                <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                  <p className="text-sm font-medium text-primary">
                    ✓ Calculated: {calculatedCalories} calories/day
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Based on your age, gender, height, activity level, and goal
                  </p>
                </div>
              )}

              <Button 
                onClick={saveProfile}
                disabled={loading}
                className="w-full bg-gradient-to-r from-primary to-secondary"
              >
                {loading ? "Saving..." : "Save Settings"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Settings;
