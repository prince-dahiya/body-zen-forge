import { useState, useEffect, useRef } from "react";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Play, Pause, RotateCcw, CheckCircle2, Clock, TrendingUp, Plus, X, Dumbbell } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Exercise {
  id: number;
  name: string;
  duration: number;
  restAfter: number;
  image: string;
  description: string;
  category: string;
}

const defaultWorkout: Exercise[] = [
  { id: 1, name: "Jumping Jacks", duration: 30, restAfter: 10, image: "🏃", description: "Full body cardio", category: "HIIT" },
  { id: 2, name: "Wall Sit", duration: 30, restAfter: 10, image: "🪑", description: "Lower body strength", category: "Legs" },
  { id: 3, name: "Push-ups", duration: 30, restAfter: 10, image: "💪", description: "Upper body strength", category: "Chest" },
  { id: 4, name: "Abdominal Crunches", duration: 30, restAfter: 10, image: "🧘", description: "Core strength", category: "Core" },
  { id: 5, name: "Step-up onto Chair", duration: 30, restAfter: 10, image: "🪜", description: "Lower body cardio", category: "Legs" },
  { id: 6, name: "Squats", duration: 30, restAfter: 10, image: "🦵", description: "Lower body strength", category: "Legs" },
  { id: 7, name: "Tricep Dips", duration: 30, restAfter: 10, image: "💺", description: "Triceps strength", category: "Arms" },
  { id: 8, name: "Plank", duration: 30, restAfter: 10, image: "🏋️", description: "Core stability", category: "Core" },
  { id: 9, name: "High Knees", duration: 30, restAfter: 10, image: "🏃‍♀️", description: "Cardio exercise", category: "HIIT" },
  { id: 10, name: "Lunges", duration: 30, restAfter: 10, image: "🚶", description: "Lower body strength", category: "Legs" },
  { id: 11, name: "Push-up with Rotation", duration: 30, restAfter: 10, image: "🔄", description: "Upper body & core", category: "Chest" },
  { id: 12, name: "Side Plank", duration: 30, restAfter: 0, image: "📐", description: "Core & obliques", category: "Core" },
];

const allExercises: Exercise[] = [
  // HIIT
  { id: 101, name: "Jumping Jacks", duration: 30, restAfter: 10, image: "🏃", description: "Full body cardio", category: "HIIT" },
  { id: 102, name: "High Knees", duration: 30, restAfter: 10, image: "🏃‍♀️", description: "Cardio exercise", category: "HIIT" },
  { id: 103, name: "Burpees", duration: 30, restAfter: 10, image: "🤸", description: "Full body explosive", category: "HIIT" },
  { id: 104, name: "Mountain Climbers", duration: 30, restAfter: 10, image: "⛰️", description: "Core & cardio", category: "HIIT" },
  { id: 105, name: "Jump Squats", duration: 30, restAfter: 10, image: "🦘", description: "Explosive lower body", category: "HIIT" },
  
  // Chest
  { id: 201, name: "Push-ups", duration: 30, restAfter: 10, image: "💪", description: "Upper body strength", category: "Chest" },
  { id: 202, name: "Wide Push-ups", duration: 30, restAfter: 10, image: "🏋️", description: "Chest focus", category: "Chest" },
  { id: 203, name: "Diamond Push-ups", duration: 30, restAfter: 10, image: "💎", description: "Inner chest", category: "Chest" },
  { id: 204, name: "Push-up with Rotation", duration: 30, restAfter: 10, image: "🔄", description: "Chest & core", category: "Chest" },
  { id: 205, name: "Incline Push-ups", duration: 30, restAfter: 10, image: "📐", description: "Upper chest", category: "Chest" },
  
  // Back
  { id: 301, name: "Superman", duration: 30, restAfter: 10, image: "🦸", description: "Lower back strength", category: "Back" },
  { id: 302, name: "Reverse Snow Angels", duration: 30, restAfter: 10, image: "😇", description: "Upper back", category: "Back" },
  { id: 303, name: "Prone Back Extension", duration: 30, restAfter: 10, image: "🧘‍♂️", description: "Back muscles", category: "Back" },
  { id: 304, name: "Arm Raises", duration: 30, restAfter: 10, image: "🙋", description: "Shoulder & back", category: "Back" },
  
  // Arms
  { id: 401, name: "Tricep Dips", duration: 30, restAfter: 10, image: "💺", description: "Triceps strength", category: "Arms" },
  { id: 402, name: "Arm Circles", duration: 30, restAfter: 10, image: "⭕", description: "Shoulder endurance", category: "Arms" },
  { id: 403, name: "Plank to Down Dog", duration: 30, restAfter: 10, image: "🐕", description: "Arms & shoulders", category: "Arms" },
  { id: 404, name: "Pike Push-ups", duration: 30, restAfter: 10, image: "🔺", description: "Shoulders focus", category: "Arms" },
  
  // Running/Cardio
  { id: 501, name: "Running in Place", duration: 30, restAfter: 10, image: "🏃‍♂️", description: "Cardio endurance", category: "Running" },
  { id: 502, name: "High Knees Run", duration: 30, restAfter: 10, image: "🏃‍♀️", description: "Intense cardio", category: "Running" },
  { id: 503, name: "Butt Kicks", duration: 30, restAfter: 10, image: "🦵", description: "Hamstring cardio", category: "Running" },
  { id: 504, name: "Side Shuffles", duration: 30, restAfter: 10, image: "↔️", description: "Lateral movement", category: "Running" },
  
  // Core
  { id: 601, name: "Plank", duration: 30, restAfter: 10, image: "🏋️", description: "Core stability", category: "Core" },
  { id: 602, name: "Side Plank", duration: 30, restAfter: 10, image: "📐", description: "Obliques", category: "Core" },
  { id: 603, name: "Abdominal Crunches", duration: 30, restAfter: 10, image: "🧘", description: "Core strength", category: "Core" },
  { id: 604, name: "Bicycle Crunches", duration: 30, restAfter: 10, image: "🚴", description: "Full core workout", category: "Core" },
  
  // Legs
  { id: 701, name: "Squats", duration: 30, restAfter: 10, image: "🦵", description: "Lower body strength", category: "Legs" },
  { id: 702, name: "Lunges", duration: 30, restAfter: 10, image: "🚶", description: "Leg strength", category: "Legs" },
  { id: 703, name: "Wall Sit", duration: 30, restAfter: 10, image: "🪑", description: "Isometric strength", category: "Legs" },
  { id: 704, name: "Step-ups", duration: 30, restAfter: 10, image: "🪜", description: "Lower body cardio", category: "Legs" },
];

export default function SevenMinuteWorkout() {
  const [isCustomizing, setIsCustomizing] = useState(true);
  const [selectedExercises, setSelectedExercises] = useState<Exercise[]>([]);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isResting, setIsResting] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [totalCalories, setTotalCalories] = useState(0);
  const intervalRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  const exercises = selectedExercises.length > 0 ? selectedExercises : defaultWorkout;
  const currentExercise = exercises[currentExerciseIndex];
  const progress = ((currentExerciseIndex / exercises.length) * 100);

  const addExercise = (exercise: Exercise) => {
    setSelectedExercises([...selectedExercises, { ...exercise, id: Date.now() }]);
    toast.success(`Added ${exercise.name}`);
  };

  const removeExercise = (index: number) => {
    setSelectedExercises(selectedExercises.filter((_, i) => i !== index));
  };

  const startWorkout = () => {
    if (selectedExercises.length === 0) {
      toast.error("Please add at least one exercise");
      return;
    }
    setIsCustomizing(false);
    setTimeLeft(selectedExercises[0].duration);
  };

  const backToCustomize = () => {
    resetWorkout();
    setIsCustomizing(true);
  };

  const useDefaultWorkout = () => {
    setSelectedExercises(defaultWorkout);
    toast.success("Classic 7-Minute Workout loaded");
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const playBeep = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    const ctx = audioContextRef.current;
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.frequency.value = 800;
    oscillator.type = "sine";
    gainNode.gain.value = 0.3;

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.1);
  };

  const startTimer = () => {
    if (isCompleted) return;
    
    setIsRunning(true);
    intervalRef.current = window.setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          playBeep();
          handleExerciseComplete();
          return 0;
        }
        if (prev <= 4) playBeep();
        return prev - 1;
      });
    }, 1000);
  };

  const pauseTimer = () => {
    setIsRunning(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const handleExerciseComplete = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);

    if (isResting) {
      // Move to next exercise
      if (currentExerciseIndex < exercises.length - 1) {
        const nextIndex = currentExerciseIndex + 1;
        setCurrentExerciseIndex(nextIndex);
        setTimeLeft(exercises[nextIndex].duration);
        setIsResting(false);
        setIsRunning(false);
      } else {
        // Workout complete
        completeWorkout();
      }
    } else {
      // Start rest period
      if (currentExercise.restAfter > 0) {
        setIsResting(true);
        setTimeLeft(currentExercise.restAfter);
        setIsRunning(false);
      } else {
        completeWorkout();
      }
    }
  };

  const completeWorkout = async () => {
    setIsCompleted(true);
    setIsRunning(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
    
    const calories = 50; // Estimated 50 calories for 7-minute workout
    setTotalCalories(calories);

    // Save to database
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { error } = await supabase.from("workout_logs").insert({
          user_id: user.id,
          exercise_name: "7-Minute Workout",
          body_part: "Full Body",
          duration: 7,
          date: new Date().toISOString().split('T')[0],
        });

        if (error) throw error;
        toast.success(`Workout complete! Estimated ${calories} calories burned 🎉`);
      }
    } catch (error) {
      console.error("Error saving workout:", error);
      toast.error("Completed workout but couldn't save to history");
    }
  };

  const resetWorkout = () => {
    pauseTimer();
    setCurrentExerciseIndex(0);
    if (exercises.length > 0) {
      setTimeLeft(exercises[0].duration);
    }
    setIsResting(false);
    setIsCompleted(false);
    setTotalCalories(0);
  };

  useEffect(() => {
    if (isRunning) {
      startTimer();
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, isResting, currentExerciseIndex]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8 text-center animate-fade-in">
          <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Custom Workout Builder
          </h1>
          <p className="text-muted-foreground">
            Create your personalized workout from HIIT, strength, and cardio exercises
          </p>
        </div>

        {isCustomizing ? (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Exercise Library */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Dumbbell className="h-5 w-5" />
                    Exercise Library
                  </CardTitle>
                  <CardDescription>Choose exercises to build your workout</CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="HIIT" className="w-full">
                    <TabsList className="grid w-full grid-cols-4 lg:grid-cols-7">
                      <TabsTrigger value="HIIT">HIIT</TabsTrigger>
                      <TabsTrigger value="Chest">Chest</TabsTrigger>
                      <TabsTrigger value="Back">Back</TabsTrigger>
                      <TabsTrigger value="Arms">Arms</TabsTrigger>
                      <TabsTrigger value="Running">Run</TabsTrigger>
                      <TabsTrigger value="Core">Core</TabsTrigger>
                      <TabsTrigger value="Legs">Legs</TabsTrigger>
                    </TabsList>
                    
                    {["HIIT", "Chest", "Back", "Arms", "Running", "Core", "Legs"].map((category) => (
                      <TabsContent key={category} value={category} className="mt-4">
                        <ScrollArea className="h-[400px] pr-4">
                          <div className="grid sm:grid-cols-2 gap-3">
                            {allExercises
                              .filter((ex) => ex.category === category)
                              .map((exercise) => (
                                <Card key={exercise.id} className="hover:shadow-md transition-shadow">
                                  <CardContent className="p-4">
                                    <div className="flex items-start justify-between gap-3">
                                      <div className="flex-1">
                                        <div className="text-3xl mb-2">{exercise.image}</div>
                                        <h3 className="font-semibold text-sm mb-1">{exercise.name}</h3>
                                        <p className="text-xs text-muted-foreground mb-2">
                                          {exercise.description}
                                        </p>
                                        <Badge variant="secondary" className="text-xs">
                                          {exercise.duration}s
                                        </Badge>
                                      </div>
                                      <Button
                                        size="sm"
                                        onClick={() => addExercise(exercise)}
                                        className="shrink-0"
                                      >
                                        <Plus className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </CardContent>
                                </Card>
                              ))}
                          </div>
                        </ScrollArea>
                      </TabsContent>
                    ))}
                  </Tabs>
                </CardContent>
              </Card>
            </div>

            {/* Selected Workout */}
            <div className="lg:col-span-1">
              <Card className="sticky top-4">
                <CardHeader>
                  <CardTitle className="text-lg">Your Workout</CardTitle>
                  <CardDescription>
                    {selectedExercises.length} exercises selected
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {selectedExercises.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-sm text-muted-foreground mb-4">
                        No exercises selected yet
                      </p>
                      <Button onClick={useDefaultWorkout} variant="outline" size="sm">
                        Use Classic 7-Min Workout
                      </Button>
                    </div>
                  ) : (
                    <>
                      <ScrollArea className="h-[300px]">
                        <div className="space-y-2 pr-4">
                          {selectedExercises.map((exercise, index) => (
                            <div
                              key={exercise.id}
                              className="flex items-center gap-2 p-2 rounded-lg bg-muted/50"
                            >
                              <span className="text-lg">{exercise.image}</span>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{exercise.name}</p>
                                <p className="text-xs text-muted-foreground">{exercise.duration}s</p>
                              </div>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => removeExercise(index)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>

                      <div className="space-y-2 pt-4 border-t">
                        <div className="flex justify-between text-sm">
                          <span>Total Time:</span>
                          <span className="font-semibold">
                            ~{Math.ceil(selectedExercises.reduce((acc, ex) => acc + ex.duration + ex.restAfter, 0) / 60)} min
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Est. Calories:</span>
                          <span className="font-semibold">
                            ~{Math.ceil(selectedExercises.length * 4)} kcal
                          </span>
                        </div>
                      </div>

                      <Button onClick={startWorkout} className="w-full gap-2" size="lg">
                        <Play className="h-5 w-5" />
                        Start Workout
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto">

          {!isCompleted ? (
            <>
              {/* Progress Bar */}
            <Card className="mb-6">
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Exercise {currentExerciseIndex + 1} of {exercises.length}</span>
                    <span>{Math.round(progress)}% Complete</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
              </CardContent>
            </Card>

            {/* Exercise Display */}
            <Card className="mb-6">
              <CardHeader className="text-center pb-4">
                <div className="text-8xl mb-4">{currentExercise.image}</div>
                <CardTitle className="text-3xl">
                  {isResting ? "Rest" : currentExercise.name}
                </CardTitle>
                <CardDescription className="text-lg">
                  {isResting ? "Get ready for next exercise" : currentExercise.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <div className="relative">
                  <div className={`text-8xl font-bold mb-6 transition-colors ${
                    timeLeft <= 3 ? 'text-destructive animate-pulse' : 
                    isResting ? 'text-secondary' : 'text-primary'
                  }`}>
                    {timeLeft}
                  </div>
                  <p className="text-sm text-muted-foreground mb-6">seconds remaining</p>
                </div>

                {/* Controls */}
                <div className="flex gap-3 justify-center">
                  {!isRunning ? (
                    <Button onClick={startTimer} size="lg" className="gap-2">
                      <Play className="h-5 w-5" />
                      {currentExerciseIndex === 0 && timeLeft === exercises[0].duration ? "Start Workout" : "Resume"}
                    </Button>
                  ) : (
                    <Button onClick={pauseTimer} size="lg" variant="secondary" className="gap-2">
                      <Pause className="h-5 w-5" />
                      Pause
                    </Button>
                  )}
                  <Button onClick={resetWorkout} size="lg" variant="outline" className="gap-2">
                    <RotateCcw className="h-5 w-5" />
                    Reset
                  </Button>
                  <Button onClick={backToCustomize} size="lg" variant="outline" className="gap-2">
                    <Dumbbell className="h-5 w-5" />
                    Customize
                  </Button>
                </div>
              </CardContent>
            </Card>

              {/* Exercise List */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Exercise Sequence</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {exercises.map((exercise, index) => (
                      <div
                        key={exercise.id}
                        className={`p-3 rounded-lg border-2 transition-all ${
                          index === currentExerciseIndex
                            ? 'border-primary bg-primary/10 scale-105'
                            : index < currentExerciseIndex
                            ? 'border-green-500/50 bg-green-500/10'
                            : 'border-border'
                        }`}
                      >
                        <div className="text-2xl mb-1">{exercise.image}</div>
                        <div className="text-xs font-medium">{exercise.name}</div>
                        <div className="text-xs text-muted-foreground">{exercise.duration}s</div>
                        {index < currentExerciseIndex && (
                          <CheckCircle2 className="h-4 w-4 text-green-500 mt-1" />
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            /* Completion Screen */
            <Card className="text-center">
            <CardHeader>
              <div className="text-8xl mb-4">🎉</div>
              <CardTitle className="text-3xl mb-2">Workout Complete!</CardTitle>
              <CardDescription className="text-lg">
                Great job! You've completed the 7-Minute Workout
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 rounded-lg bg-primary/10">
                  <Clock className="h-6 w-6 mx-auto mb-2 text-primary" />
                  <div className="text-2xl font-bold">7:00</div>
                  <div className="text-xs text-muted-foreground">Duration</div>
                </div>
                <div className="p-4 rounded-lg bg-secondary/10">
                  <TrendingUp className="h-6 w-6 mx-auto mb-2 text-secondary" />
                  <div className="text-2xl font-bold">~{totalCalories}</div>
                  <div className="text-xs text-muted-foreground">Calories</div>
                </div>
                <div className="p-4 rounded-lg bg-green-500/10">
                  <CheckCircle2 className="h-6 w-6 mx-auto mb-2 text-green-500" />
                  <div className="text-2xl font-bold">{exercises.length}</div>
                  <div className="text-xs text-muted-foreground">Exercises</div>
                </div>
              </div>

              <div className="flex gap-3 justify-center">
                <Button onClick={resetWorkout} size="lg" className="gap-2">
                  <RotateCcw className="h-5 w-5" />
                  Do Another Workout
                </Button>
                <Button onClick={backToCustomize} size="lg" variant="outline" className="gap-2">
                  <Dumbbell className="h-5 w-5" />
                  Create New Workout
                </Button>
              </div>
            </CardContent>
          </Card>
          )}
          </div>
        )}
      </div>
    </div>
  );
}
