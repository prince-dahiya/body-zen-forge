import { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Apple, Trash2, Search, TrendingDown, Target, Flame, TrendingUp, Activity, Settings } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface CalorieEntry {
  id: string;
  meal_name: string;
  meal_type: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  date: string;
}

interface Food {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  serving_size: string;
}

interface Profile {
  calorie_goal: number | null;
  goal: string | null;
  activity_level: string | null;
  age: number | null;
  gender: string | null;
  height: number | null;
  full_name: string | null;
}

const MEAL_TYPES = ["breakfast", "lunch", "dinner", "snack"];

const Calories = () => {
  const [mealName, setMealName] = useState("");
  const [mealType, setMealType] = useState("");
  const [calories, setCalories] = useState("");
  const [protein, setProtein] = useState("");
  const [carbs, setCarbs] = useState("");
  const [fats, setFats] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [entries, setEntries] = useState<CalorieEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [foods, setFoods] = useState<Food[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [profile, setProfile] = useState<Profile | null>(null);
  const [todayCalories, setTodayCalories] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [calculatedCalories, setCalculatedCalories] = useState<number | null>(null);
  const [currentWeight, setCurrentWeight] = useState<number | null>(null);

  useEffect(() => {
    loadEntries();
    loadFoods();
    loadProfile();
    loadCurrentWeight();
  }, []);

  useEffect(() => {
    calculateTodayCalories();
  }, [entries]);

  const calculateTodayCalories = () => {
    const today = new Date().toISOString().split("T")[0];
    const todayEntries = entries.filter(e => e.date === today);
    const total = todayEntries.reduce((sum, e) => sum + e.calories, 0);
    setTodayCalories(total);
  };

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

  const loadCurrentWeight = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("weight_entries")
      .select("weight")
      .eq("user_id", user.id)
      .order("date", { ascending: false })
      .limit(1)
      .single();

    if (data) {
      setCurrentWeight(data.weight);
    }
  };

  const calculateCalories = () => {
    const { age, gender, height } = profile || {};
    const weight = currentWeight;
    
    if (!age || !gender || !height || !weight) {
      toast.error("Please add your age, gender, height in Settings and log your current weight first");
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

    const multiplier = activityMultipliers[profile?.activity_level || "sedentary"];
    let tdee = bmr * multiplier;

    // Goal adjustments
    if (profile?.goal === "lose-weight") {
      tdee -= 500;
    } else if (profile?.goal === "gain-muscle") {
      tdee += 300;
    }

    setCalculatedCalories(Math.round(tdee));
    setProfile({ ...profile, calorie_goal: Math.round(tdee) } as Profile);
    toast.success(`Calculated: ${Math.round(tdee)} calories/day`);
  };

  const saveCalorieGoal = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from("profiles")
      .update({
        calorie_goal: profile?.calorie_goal,
        activity_level: profile?.activity_level,
        goal: profile?.goal,
      })
      .eq("id", user.id);

    if (error) {
      toast.error("Failed to save calorie goal");
    } else {
      toast.success("Calorie goal saved!");
      setShowSettings(false);
    }
    setLoading(false);
  };

  const loadFoods = async () => {
    const { data, error } = await supabase
      .from("foods")
      .select("*")
      .order("name");

    if (!error && data) {
      setFoods(data);
    }
  };

  const loadEntries = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("calorie_entries")
      .select("*")
      .eq("user_id", user.id)
      .order("date", { ascending: false })
      .limit(20);

    if (error) {
      toast.error("Failed to load calorie entries");
      return;
    }

    setEntries(data || []);
  };

  const addEntry = async () => {
    if (!mealName || !calories) {
      toast.error("Please enter meal name and calories");
      return;
    }

    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from("calorie_entries").insert({
      user_id: user.id,
      meal_name: mealName,
      calories: parseInt(calories),
      protein: protein ? parseFloat(protein) : null,
      carbs: carbs ? parseFloat(carbs) : null,
      fats: fats ? parseFloat(fats) : null,
      meal_type: mealType || null,
      date,
    });

    if (error) {
      toast.error("Failed to add entry");
    } else {
      toast.success("Calorie entry added!");
      setMealName("");
      setCalories("");
      setProtein("");
      setCarbs("");
      setFats("");
      setMealType("");
      loadEntries();
    }
    setLoading(false);
  };

  const deleteEntry = async (id: string) => {
    const { error } = await supabase.from("calorie_entries").delete().eq("id", id);
    if (error) {
      toast.error("Failed to delete entry");
    } else {
      toast.success("Entry deleted");
      loadEntries();
    }
  };

  const selectFood = (food: Food) => {
    setMealName(food.name);
    setCalories(food.calories.toString());
    setProtein(food.protein?.toString() || "");
    setCarbs(food.carbs?.toString() || "");
    setFats(food.fats?.toString() || "");
    setSearchQuery("");
  };

  const filteredFoods = foods.filter(f => 
    f.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const calorieGoal = profile?.calorie_goal || 2000;
  const calorieProgress = Math.min((todayCalories / calorieGoal) * 100, 100);
  const remainingCalories = calorieGoal - todayCalories;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-lg bg-gradient-to-br from-accent to-orange-400">
            <Apple className="h-6 w-6 text-accent-foreground" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Calorie Tracker</h1>
            <p className="text-muted-foreground">Monitor your daily nutrition and reach your goals</p>
          </div>
        </div>

        {/* Daily Progress */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Calories</CardTitle>
              <Flame className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{todayCalories}</div>
              <p className="text-xs text-muted-foreground">
                calories consumed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Progress</CardTitle>
              <TrendingUp className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <Progress value={calorieProgress} className="h-2" />
              <p className="text-sm text-muted-foreground mt-2">
                Goal: {calorieGoal} cal/day
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Remaining</CardTitle>
              <Target className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{remainingCalories}</div>
              <p className="text-sm text-muted-foreground">
                {remainingCalories > 0 ? "Calories left today" : "Goal reached!"}
              </p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:border-primary transition-all" onClick={() => setShowSettings(!showSettings)}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Settings</CardTitle>
              <Settings className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-sm font-medium">Calorie Goal</div>
              <p className="text-xs text-muted-foreground">
                Click to adjust
              </p>
            </CardContent>
          </Card>
        </div>

        {showSettings && (
          <Card className="mb-6 border-primary/50">
            <CardHeader>
              <CardTitle>Calorie Goal Settings</CardTitle>
              <CardDescription>Customize your daily calorie target</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Fitness Goal</Label>
                  <Select 
                    value={profile?.goal || ""} 
                    onValueChange={(value) => setProfile({ ...profile, goal: value } as Profile)}
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
                    value={profile?.activity_level || ""} 
                    onValueChange={(value) => setProfile({ ...profile, activity_level: value } as Profile)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select activity level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sedentary">Sedentary</SelectItem>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="moderate">Moderate</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="very-active">Very Active</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-muted/50 space-y-2">
                <p className="text-sm font-medium">Auto-Calculate Calories</p>
                <p className="text-xs text-muted-foreground">
                  Based on your profile, current weight, and goals
                </p>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={calculateCalories}
                >
                  Calculate My Calories
                </Button>
              </div>

              <div className="space-y-2">
                <Label>Daily Calorie Target</Label>
                <Input
                  type="number"
                  placeholder="2000"
                  value={profile?.calorie_goal || ""}
                  onChange={(e) => setProfile({ ...profile, calorie_goal: parseInt(e.target.value) } as Profile)}
                />
                {calculatedCalories && (
                  <p className="text-xs text-primary">
                    ✓ Calculated: {calculatedCalories} cal/day
                  </p>
                )}
              </div>

              <Button 
                onClick={saveCalorieGoal}
                disabled={loading}
                className="w-full"
              >
                {loading ? "Saving..." : "Save Calorie Goal"}
              </Button>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Log Meal Card */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Log Meal</CardTitle>
              <CardDescription>Track your food intake</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Tabs defaultValue="manual" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="manual">Manual</TabsTrigger>
                  <TabsTrigger value="database">Food Database</TabsTrigger>
                </TabsList>
                
                <TabsContent value="database" className="space-y-4">
                  <div className="space-y-2">
                    <Label>Search Foods</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search for foods..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  {searchQuery && (
                    <div className="max-h-64 overflow-y-auto border rounded-lg">
                      {filteredFoods.length === 0 ? (
                        <p className="p-4 text-sm text-muted-foreground text-center">
                          No foods found
                        </p>
                      ) : (
                        filteredFoods.map((food) => (
                          <button
                            key={food.id}
                            onClick={() => selectFood(food)}
                            className="w-full p-3 text-left hover:bg-accent transition-colors border-b last:border-b-0"
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-medium">{food.name}</p>
                                <p className="text-sm text-muted-foreground">
                                  {food.serving_size}
                                </p>
                              </div>
                              <span className="text-sm font-semibold">
                                {food.calories} cal
                              </span>
                            </div>
                            <div className="flex gap-3 mt-1 text-xs text-muted-foreground">
                              <span>P: {food.protein}g</span>
                              <span>C: {food.carbs}g</span>
                              <span>F: {food.fats}g</span>
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="manual" className="space-y-4">
                  <div className="space-y-2">
                    <Label>Meal Name</Label>
                    <Input
                      placeholder="e.g., Grilled Chicken"
                      value={mealName}
                      onChange={(e) => setMealName(e.target.value)}
                    />
                  </div>
                </TabsContent>
              </Tabs>

              <div className="space-y-2">
                <Label>Meal Type</Label>
                <Select value={mealType} onValueChange={setMealType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {MEAL_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Calories</Label>
                <Input
                  type="number"
                  placeholder="500"
                  value={calories}
                  onChange={(e) => setCalories(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-2">
                  <Label>Protein (g)</Label>
                  <Input
                    type="number"
                    placeholder="30"
                    value={protein}
                    onChange={(e) => setProtein(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Carbs (g)</Label>
                  <Input
                    type="number"
                    placeholder="50"
                    value={carbs}
                    onChange={(e) => setCarbs(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Fats (g)</Label>
                  <Input
                    type="number"
                    placeholder="15"
                    value={fats}
                    onChange={(e) => setFats(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Date</Label>
                <Input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>

              <Button 
                onClick={addEntry}
                disabled={loading}
                className="w-full bg-gradient-to-r from-accent to-orange-400"
              >
                {loading ? "Adding..." : "Add Entry"}
              </Button>
            </CardContent>
          </Card>

          {/* Meal History */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Meal History</CardTitle>
              <CardDescription>Your recent meals</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {entries.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No meals logged yet. Start tracking your nutrition!
                  </p>
                ) : (
                  entries.map((entry) => (
                    <div 
                      key={entry.id}
                      className="flex items-center justify-between p-4 rounded-lg border hover:border-primary transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {entry.meal_type && (
                            <span className="px-2 py-1 text-xs rounded-full bg-accent/10 text-accent">
                              {entry.meal_type}
                            </span>
                          )}
                          <p className="font-medium">{entry.meal_name}</p>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {entry.calories} cal
                          {entry.protein && ` • P: ${entry.protein}g`}
                          {entry.carbs && ` • C: ${entry.carbs}g`}
                          {entry.fats && ` • F: ${entry.fats}g`}
                          {" • "}
                          {new Date(entry.date).toLocaleDateString()}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteEntry(entry.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Calories;
