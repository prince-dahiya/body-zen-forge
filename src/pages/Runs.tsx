import { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Activity, Trash2 } from "lucide-react";

interface RunLog {
  id: string;
  distance: number;
  duration: number;
  calories: number;
  date: string;
}

const Runs = () => {
  const [distance, setDistance] = useState("");
  const [duration, setDuration] = useState("");
  const [calories, setCalories] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [logs, setLogs] = useState<RunLog[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("run_logs")
      .select("*")
      .eq("user_id", user.id)
      .order("date", { ascending: false });

    if (error) {
      toast.error("Failed to load run logs");
      return;
    }

    setLogs(data || []);
  };

  const calculateCalories = () => {
    // Rough estimate: ~60 calories per km
    const dist = parseFloat(distance);
    if (dist) {
      setCalories((dist * 60).toFixed(0));
    }
  };

  const addLog = async () => {
    if (!distance || !duration) {
      toast.error("Please enter distance and duration");
      return;
    }

    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from("run_logs").insert({
      user_id: user.id,
      distance: parseFloat(distance),
      duration: parseInt(duration),
      calories: calories ? parseInt(calories) : null,
      date,
    });

    if (error) {
      toast.error("Failed to add run log");
    } else {
      toast.success("Run logged!");
      setDistance("");
      setDuration("");
      setCalories("");
      loadLogs();
    }
    setLoading(false);
  };

  const deleteLog = async (id: string) => {
    const { error } = await supabase.from("run_logs").delete().eq("id", id);
    if (error) {
      toast.error("Failed to delete log");
    } else {
      toast.success("Log deleted");
      loadLogs();
    }
  };

  const totalDistance = logs.reduce((sum, log) => sum + log.distance, 0);
  const totalTime = logs.reduce((sum, log) => sum + log.duration, 0);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-lg bg-gradient-to-br from-secondary to-green-400">
            <Activity className="h-6 w-6 text-secondary-foreground" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Run Tracker</h1>
            <p className="text-muted-foreground">Log and track your runs</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Log Run Card */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Log Run</CardTitle>
              <CardDescription>Record your running session</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Distance (km)</Label>
                <Input
                  type="number"
                  step="0.1"
                  placeholder="5.0"
                  value={distance}
                  onChange={(e) => {
                    setDistance(e.target.value);
                    calculateCalories();
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label>Duration (minutes)</Label>
                <Input
                  type="number"
                  placeholder="30"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Calories Burned (optional)</Label>
                <Input
                  type="number"
                  placeholder="300"
                  value={calories}
                  onChange={(e) => setCalories(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Auto-calculated based on distance
                </p>
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
                onClick={addLog}
                disabled={loading}
                className="w-full bg-gradient-to-r from-secondary to-green-400"
              >
                {loading ? "Logging..." : "Log Run"}
              </Button>
            </CardContent>
          </Card>

          {/* Stats & History */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Distance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{totalDistance.toFixed(1)} km</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Time
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{Math.floor(totalTime / 60)}h {totalTime % 60}m</p>
                </CardContent>
              </Card>
            </div>

            {/* Run History */}
            <Card>
              <CardHeader>
                <CardTitle>Run History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {logs.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      No runs logged yet. Start tracking your runs!
                    </p>
                  ) : (
                    logs.map((log) => (
                      <div 
                        key={log.id}
                        className="flex items-center justify-between p-4 rounded-lg border hover:border-primary transition-colors"
                      >
                        <div className="flex-1">
                          <p className="font-medium">
                            {log.distance} km • {log.duration} min
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {log.calories && `${log.calories} cal • `}
                            {new Date(log.date).toLocaleDateString()}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteLog(log.id)}
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

export default Runs;
