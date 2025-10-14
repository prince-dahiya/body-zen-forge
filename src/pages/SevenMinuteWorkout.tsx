import { useState, useEffect, useRef } from "react";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Play, Pause, RotateCcw, CheckCircle2, Clock, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Exercise {
  id: number;
  name: string;
  duration: number; // seconds
  restAfter: number; // seconds
  image: string;
  description: string;
}

const exercises: Exercise[] = [
  { id: 1, name: "Jumping Jacks", duration: 30, restAfter: 10, image: "🏃", description: "Full body cardio exercise" },
  { id: 2, name: "Wall Sit", duration: 30, restAfter: 10, image: "🪑", description: "Lower body strength" },
  { id: 3, name: "Push-ups", duration: 30, restAfter: 10, image: "💪", description: "Upper body strength" },
  { id: 4, name: "Abdominal Crunches", duration: 30, restAfter: 10, image: "🧘", description: "Core strength" },
  { id: 5, name: "Step-up onto Chair", duration: 30, restAfter: 10, image: "🪜", description: "Lower body cardio" },
  { id: 6, name: "Squats", duration: 30, restAfter: 10, image: "🦵", description: "Lower body strength" },
  { id: 7, name: "Tricep Dips", duration: 30, restAfter: 10, image: "💺", description: "Triceps strength" },
  { id: 8, name: "Plank", duration: 30, restAfter: 10, image: "🏋️", description: "Core stability" },
  { id: 9, name: "High Knees", duration: 30, restAfter: 10, image: "🏃‍♀️", description: "Cardio exercise" },
  { id: 10, name: "Lunges", duration: 30, restAfter: 10, image: "🚶", description: "Lower body strength" },
  { id: 11, name: "Push-up with Rotation", duration: 30, restAfter: 10, image: "🔄", description: "Upper body & core" },
  { id: 12, name: "Side Plank", duration: 30, restAfter: 0, image: "📐", description: "Core & obliques" },
];

export default function SevenMinuteWorkout() {
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(exercises[0].duration);
  const [isResting, setIsResting] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [totalCalories, setTotalCalories] = useState(0);
  const intervalRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  const currentExercise = exercises[currentExerciseIndex];
  const progress = ((currentExerciseIndex / exercises.length) * 100);

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
    setTimeLeft(exercises[0].duration);
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
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8 text-center animate-fade-in">
          <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            7-Minute Workout
          </h1>
          <p className="text-muted-foreground">
            High-intensity circuit training for maximum results in minimal time
          </p>
        </div>

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

              <Button onClick={resetWorkout} size="lg" className="gap-2">
                <RotateCcw className="h-5 w-5" />
                Do Another Workout
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
