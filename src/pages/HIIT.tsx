import { useState, useEffect, useRef } from "react";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Timer, Play, Pause, RotateCcw } from "lucide-react";

const HIIT = () => {
  const [workTime, setWorkTime] = useState(30);
  const [restTime, setRestTime] = useState(15);
  const [rounds, setRounds] = useState(8);
  
  const [currentRound, setCurrentRound] = useState(1);
  const [timeLeft, setTimeLeft] = useState(workTime);
  const [isWork, setIsWork] = useState(true);
  const [isRunning, setIsRunning] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Create audio for beep sound (using Web Audio API)
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    audioRef.current = new Audio();
    
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  useEffect(() => {
    if (isRunning && !isFinished) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            playBeep();
            
            if (isWork) {
              // Switch to rest
              setIsWork(false);
              return restTime;
            } else {
              // Switch to work
              if (currentRound >= rounds) {
                setIsRunning(false);
                setIsFinished(true);
                return 0;
              }
              setCurrentRound((r) => r + 1);
              setIsWork(true);
              return workTime;
            }
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, isWork, currentRound, rounds, workTime, restTime, isFinished]);

  const playBeep = () => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 800;
    oscillator.type = "sine";
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  };

  const startTimer = () => {
    setIsRunning(true);
    setIsFinished(false);
  };

  const pauseTimer = () => {
    setIsRunning(false);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setIsFinished(false);
    setCurrentRound(1);
    setIsWork(true);
    setTimeLeft(workTime);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-lg bg-gradient-to-br from-accent to-orange-400">
              <Timer className="h-6 w-6 text-accent-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">HIIT Timer</h1>
              <p className="text-muted-foreground">High-Intensity Interval Training</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Settings Card */}
            <Card>
              <CardHeader>
                <CardTitle>Timer Settings</CardTitle>
                <CardDescription>Configure your HIIT workout</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Work Time (seconds)</Label>
                  <Input
                    type="number"
                    value={workTime}
                    onChange={(e) => setWorkTime(parseInt(e.target.value) || 30)}
                    disabled={isRunning}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Rest Time (seconds)</Label>
                  <Input
                    type="number"
                    value={restTime}
                    onChange={(e) => setRestTime(parseInt(e.target.value) || 15)}
                    disabled={isRunning}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Rounds</Label>
                  <Input
                    type="number"
                    value={rounds}
                    onChange={(e) => setRounds(parseInt(e.target.value) || 8)}
                    disabled={isRunning}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Timer Display Card */}
            <Card className={`${isWork ? 'bg-secondary/10' : 'bg-accent/10'} transition-colors`}>
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">
                  {isFinished ? "Workout Complete!" : isWork ? "WORK" : "REST"}
                </CardTitle>
                <CardDescription>
                  Round {currentRound} of {rounds}
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center space-y-6">
                <div className={`text-7xl font-bold ${isWork ? 'text-secondary' : 'text-accent'}`}>
                  {formatTime(timeLeft)}
                </div>

                <div className="flex gap-3 justify-center">
                  {!isRunning && !isFinished && (
                    <Button
                      onClick={startTimer}
                      size="lg"
                      className="bg-gradient-to-r from-secondary to-green-400"
                    >
                      <Play className="h-5 w-5 mr-2" />
                      Start
                    </Button>
                  )}
                  {isRunning && (
                    <Button
                      onClick={pauseTimer}
                      size="lg"
                      variant="outline"
                    >
                      <Pause className="h-5 w-5 mr-2" />
                      Pause
                    </Button>
                  )}
                  <Button
                    onClick={resetTimer}
                    size="lg"
                    variant="outline"
                  >
                    <RotateCcw className="h-5 w-5 mr-2" />
                    Reset
                  </Button>
                </div>

                {isFinished && (
                  <div className="p-4 rounded-lg bg-secondary/20 border border-secondary">
                    <p className="text-lg font-semibold text-secondary">
                      Great work! 🎉
                    </p>
                    <p className="text-sm text-muted-foreground">
                      You completed {rounds} rounds
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Workout Suggestions */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>HIIT Workout Ideas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  "Burpees",
                  "Mountain Climbers",
                  "Jump Squats",
                  "High Knees",
                  "Push-ups",
                  "Jumping Jacks",
                  "Plank Jacks",
                  "Bicycle Crunches",
                ].map((exercise) => (
                  <div key={exercise} className="p-3 rounded-lg border hover:border-primary transition-colors">
                    <p className="font-medium">{exercise}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default HIIT;
