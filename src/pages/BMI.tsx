import { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { TrendingUp } from "lucide-react";

const BMI = () => {
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [bmi, setBmi] = useState<number | null>(null);
  const [category, setCategory] = useState("");

  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: profile } = await supabase
      .from("profiles")
      .select("height")
      .eq("id", user.id)
      .single();

    if (profile?.height) {
      setHeight(profile.height.toString());
    }

    // Get latest weight
    const { data: weightData } = await supabase
      .from("weight_entries")
      .select("weight")
      .eq("user_id", user.id)
      .order("date", { ascending: false })
      .limit(1)
      .single();

    if (weightData?.weight) {
      setWeight(weightData.weight.toString());
    }
  };

  const calculateBMI = () => {
    const heightInM = parseFloat(height) / 100;
    const weightInKg = parseFloat(weight);

    if (!heightInM || !weightInKg) {
      toast.error("Please enter valid height and weight");
      return;
    }

    const bmiValue = weightInKg / (heightInM * heightInM);
    setBmi(parseFloat(bmiValue.toFixed(1)));

    // Determine category
    if (bmiValue < 18.5) setCategory("Underweight");
    else if (bmiValue < 25) setCategory("Normal weight");
    else if (bmiValue < 30) setCategory("Overweight");
    else setCategory("Obese");
  };

  const getBMIColor = () => {
    if (!bmi) return "text-foreground";
    if (bmi < 18.5) return "text-blue-500";
    if (bmi < 25) return "text-secondary";
    if (bmi < 30) return "text-accent";
    return "text-destructive";
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-lg bg-gradient-to-br from-primary to-secondary">
              <TrendingUp className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">BMI Calculator</h1>
              <p className="text-muted-foreground">Calculate your Body Mass Index</p>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Enter Your Details</CardTitle>
              <CardDescription>
                BMI is a measure of body fat based on height and weight
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="height">Height (cm)</Label>
                  <Input
                    id="height"
                    type="number"
                    placeholder="175"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="weight">Weight (kg)</Label>
                  <Input
                    id="weight"
                    type="number"
                    placeholder="70"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                  />
                </div>
              </div>

              <Button 
                onClick={calculateBMI}
                className="w-full bg-gradient-to-r from-primary to-secondary"
              >
                Calculate BMI
              </Button>

              {bmi !== null && (
                <div className="mt-6 p-6 rounded-lg border bg-card text-center">
                  <p className="text-sm text-muted-foreground mb-2">Your BMI</p>
                  <p className={`text-5xl font-bold mb-2 ${getBMIColor()}`}>
                    {bmi}
                  </p>
                  <p className={`text-xl font-medium ${getBMIColor()}`}>
                    {category}
                  </p>
                  
                  <div className="mt-6 space-y-2 text-sm text-left">
                    <div className="flex justify-between">
                      <span>Underweight</span>
                      <span className="text-blue-500">&lt; 18.5</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Normal weight</span>
                      <span className="text-secondary">18.5 - 24.9</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Overweight</span>
                      <span className="text-accent">25 - 29.9</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Obese</span>
                      <span className="text-destructive">≥ 30</span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default BMI;
