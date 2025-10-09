import { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Flame, Trash2 } from "lucide-react";

interface CalorieEntry {
  id: string;
  meal_name: string;
  calories: number;
  protein?: number;
  carbs?: number;
  fats?: number;
  meal_type?: string;
  date: string;
}

const MEAL_TYPES = ["breakfast", "lunch", "dinner", "snack"];

const Calories = () => {
  const [mealName, setMealName] = useState("");
  const [calories, setCalories] = useState("");
  const [protein, setProtein] = useState("");
  const [carbs, setCarbs] = useState("");
  const [fats, setFats] = useState("");
  const [mealType, setMealType] = useState<string>("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [entries, setEntries] = useState<CalorieEntry[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadEntries();
  }, [date]);

  const loadEntries = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("calorie_entries")
      .select("*")
      .eq("user_id", user.id)
      .eq("date", date)
      .order("created_at", { ascending: false });

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

  const totalCalories = entries.reduce((sum, entry) => sum + entry.calories, 0);
  const totalProtein = entries.reduce((sum, entry) => sum + (entry.protein || 0), 0);
  const totalCarbs = entries.reduce((sum, entry) => sum + (entry.carbs || 0), 0);
  const totalFats = entries.reduce((sum, entry) => sum + (entry.fats || 0), 0);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-lg bg-gradient-to-br from-accent to-orange-400">
            <Flame className="h-6 w-6 text-accent-foreground" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Calorie Tracker</h1>
            <p className="text-muted-foreground">Monitor your daily nutrition</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Add Entry Card */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Log Meal</CardTitle>
              <CardDescription>Add a new calorie entry</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Meal Name</Label>
                <Input
                  placeholder="Grilled Chicken Salad"
                  value={mealName}
                  onChange={(e) => setMealName(e.target.value)}
                />
              </div>
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

          {/* Daily Summary & History */}
          <div className="lg:col-span-2 space-y-6">
            {/* Daily Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Calories
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-accent">{totalCalories}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Protein
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{totalProtein.toFixed(1)}g</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Carbs
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{totalCarbs.toFixed(1)}g</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Fats
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{totalFats.toFixed(1)}g</p>
                </CardContent>
              </Card>
            </div>

            {/* Today's Meals */}
            <Card>
              <CardHeader>
                <CardTitle>Today's Meals</CardTitle>
                <CardDescription>
                  {new Date(date).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {entries.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      No meals logged for this day yet.
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
    </div>
  );
};

export default Calories;
