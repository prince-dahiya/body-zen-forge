import { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Dumbbell, Trash2 } from "lucide-react";

interface WorkoutLog {
  id: string;
  exercise_name: string;
  body_part: string;
  sets: number;
  reps: number;
  weight: number;
  date: string;
}

const BODY_PARTS = [
  "Chest", "Back", "Shoulders", "Arms", "Legs", "Core", "Full Body", "Cardio"
];

const EXERCISES_BY_PART: Record<string, string[]> = {
  Chest: ["Bench Press", "Push-ups", "Dumbbell Flyes", "Cable Crossover"],
  Back: ["Pull-ups", "Rows", "Lat Pulldown", "Deadlift"],
  Shoulders: ["Shoulder Press", "Lateral Raises", "Front Raises", "Shrugs"],
  Arms: ["Bicep Curls", "Tricep Dips", "Hammer Curls", "Skull Crushers"],
  Legs: ["Squats", "Lunges", "Leg Press", "Calf Raises"],
  Core: ["Planks", "Crunches", "Russian Twists", "Leg Raises"],
  "Full Body": ["Burpees", "Mountain Climbers", "Kettlebell Swings"],
  Cardio: ["Running", "Cycling", "Rowing", "Jump Rope"],
};

const Workouts = () => {
  const [bodyPart, setBodyPart] = useState("");
  const [exerciseName, setExerciseName] = useState("");
  const [sets, setSets] = useState("");
  const [reps, setReps] = useState("");
  const [weight, setWeight] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [logs, setLogs] = useState<WorkoutLog[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("workout_logs")
      .select("*")
      .eq("user_id", user.id)
      .order("date", { ascending: false })
      .limit(20);

    if (error) {
      toast.error("Failed to load workout logs");
      return;
    }

    setLogs(data || []);
  };

  const addLog = async () => {
    if (!bodyPart || !exerciseName) {
      toast.error("Please select body part and exercise");
      return;
    }

    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from("workout_logs").insert({
      user_id: user.id,
      exercise_name: exerciseName,
      body_part: bodyPart,
      sets: sets ? parseInt(sets) : null,
      reps: reps ? parseInt(reps) : null,
      weight: weight ? parseFloat(weight) : null,
      date,
    });

    if (error) {
      toast.error("Failed to add workout log");
    } else {
      toast.success("Workout logged!");
      setExerciseName("");
      setSets("");
      setReps("");
      setWeight("");
      loadLogs();
    }
    setLoading(false);
  };

  const deleteLog = async (id: string) => {
    const { error } = await supabase.from("workout_logs").delete().eq("id", id);
    if (error) {
      toast.error("Failed to delete log");
    } else {
      toast.success("Log deleted");
      loadLogs();
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-lg bg-gradient-to-br from-primary to-secondary">
            <Dumbbell className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Workout Logger</h1>
            <p className="text-muted-foreground">Track your exercises by body part</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Log Workout Card */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Log Workout</CardTitle>
              <CardDescription>Record your exercise</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Body Part</Label>
                <Select value={bodyPart} onValueChange={(value) => {
                  setBodyPart(value);
                  setExerciseName("");
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select body part" />
                  </SelectTrigger>
                  <SelectContent>
                    {BODY_PARTS.map((part) => (
                      <SelectItem key={part} value={part}>
                        {part}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {bodyPart && (
                <div className="space-y-2">
                  <Label>Exercise</Label>
                  <Select value={exerciseName} onValueChange={setExerciseName}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select exercise" />
                    </SelectTrigger>
                    <SelectContent>
                      {EXERCISES_BY_PART[bodyPart]?.map((exercise) => (
                        <SelectItem key={exercise} value={exercise}>
                          {exercise}
                        </SelectItem>
                      ))}
                      <SelectItem value="custom">Custom Exercise</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {exerciseName === "custom" && (
                <div className="space-y-2">
                  <Label>Custom Exercise Name</Label>
                  <Input
                    placeholder="Enter exercise name"
                    onChange={(e) => setExerciseName(e.target.value)}
                  />
                </div>
              )}

              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-2">
                  <Label>Sets</Label>
                  <Input
                    type="number"
                    placeholder="3"
                    value={sets}
                    onChange={(e) => setSets(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Reps</Label>
                  <Input
                    type="number"
                    placeholder="10"
                    value={reps}
                    onChange={(e) => setReps(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Weight (kg)</Label>
                  <Input
                    type="number"
                    placeholder="50"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
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
                onClick={addLog}
                disabled={loading}
                className="w-full bg-gradient-to-r from-primary to-secondary"
              >
                {loading ? "Logging..." : "Log Workout"}
              </Button>
            </CardContent>
          </Card>

          {/* Workout History */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Workout History</CardTitle>
              <CardDescription>Your recent workouts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {logs.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No workouts logged yet. Start tracking your progress!
                  </p>
                ) : (
                  logs.map((log) => (
                    <div 
                      key={log.id}
                      className="flex items-center justify-between p-4 rounded-lg border hover:border-primary transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="px-2 py-1 text-xs rounded-full bg-primary/10 text-primary">
                            {log.body_part}
                          </span>
                          <p className="font-medium">{log.exercise_name}</p>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {log.sets && log.reps && `${log.sets} sets × ${log.reps} reps`}
                          {log.weight && ` @ ${log.weight} kg`}
                          {" • "}
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
  );
};

export default Workouts;
