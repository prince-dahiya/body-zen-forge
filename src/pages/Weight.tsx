import { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Weight as WeightIcon, Trash2 } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface WeightEntry {
  id: string;
  weight: number;
  date: string;
}

const Weight = () => {
  const [weight, setWeight] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [entries, setEntries] = useState<WeightEntry[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadEntries();
  }, []);

  const loadEntries = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("weight_entries")
      .select("*")
      .eq("user_id", user.id)
      .order("date", { ascending: false });

    if (error) {
      toast.error("Failed to load weight entries");
      return;
    }

    setEntries(data || []);
  };

  const addEntry = async () => {
    if (!weight) {
      toast.error("Please enter a weight");
      return;
    }

    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from("weight_entries").insert({
      user_id: user.id,
      weight: parseFloat(weight),
      date,
    });

    if (error) {
      toast.error("Failed to add entry");
    } else {
      toast.success("Weight entry added!");
      setWeight("");
      loadEntries();
    }
    setLoading(false);
  };

  const deleteEntry = async (id: string) => {
    const { error } = await supabase.from("weight_entries").delete().eq("id", id);
    if (error) {
      toast.error("Failed to delete entry");
    } else {
      toast.success("Entry deleted");
      loadEntries();
    }
  };

  const chartData = entries
    .slice()
    .reverse()
    .map((entry) => ({
      date: new Date(entry.date).toLocaleDateString(),
      weight: entry.weight,
    }));

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-lg bg-gradient-to-br from-primary to-secondary">
            <WeightIcon className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Weight Tracker</h1>
            <p className="text-muted-foreground">Monitor your weight progress</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Add Entry Card */}
          <Card>
            <CardHeader>
              <CardTitle>Log Weight</CardTitle>
              <CardDescription>Add a new weight entry</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="weight">Weight (kg)</Label>
                <Input
                  id="weight"
                  type="number"
                  step="0.1"
                  placeholder="70.5"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
              <Button 
                onClick={addEntry}
                disabled={loading}
                className="w-full bg-gradient-to-r from-primary to-secondary"
              >
                {loading ? "Adding..." : "Add Entry"}
              </Button>
            </CardContent>
          </Card>

          {/* Chart Card */}
          {chartData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Progress Chart</CardTitle>
                <CardDescription>Your weight over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="weight" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Entries List */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Weight History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {entries.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No weight entries yet. Add your first entry above!
                </p>
              ) : (
                entries.map((entry) => (
                  <div 
                    key={entry.id}
                    className="flex items-center justify-between p-4 rounded-lg border hover:border-primary transition-colors"
                  >
                    <div>
                      <p className="font-medium">{entry.weight} kg</p>
                      <p className="text-sm text-muted-foreground">
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
  );
};

export default Weight;
