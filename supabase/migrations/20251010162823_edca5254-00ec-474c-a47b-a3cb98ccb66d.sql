-- Create exercise_videos table
CREATE TABLE public.exercise_videos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  video_url TEXT NOT NULL,
  thumbnail_url TEXT,
  duration INTEGER NOT NULL, -- in minutes
  category TEXT NOT NULL, -- 'hiit', 'chest', 'back', 'legs', 'arms', 'core', 'full-body'
  difficulty TEXT NOT NULL, -- 'beginner', 'intermediate', 'advanced'
  calories_burned INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create foods table for calorie tracking
CREATE TABLE public.foods (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  calories INTEGER NOT NULL,
  protein NUMERIC,
  carbs NUMERIC,
  fats NUMERIC,
  serving_size TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add calorie_goal to profiles
ALTER TABLE public.profiles 
ADD COLUMN calorie_goal INTEGER,
ADD COLUMN activity_level TEXT, -- 'sedentary', 'light', 'moderate', 'active', 'very-active'
ADD COLUMN goal TEXT; -- 'lose-weight', 'maintain', 'gain-muscle'

-- Enable RLS for exercise_videos (public read)
ALTER TABLE public.exercise_videos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view exercise videos"
ON public.exercise_videos
FOR SELECT
USING (true);

-- Enable RLS for foods (public read)
ALTER TABLE public.foods ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view foods"
ON public.foods
FOR SELECT
USING (true);

-- Insert sample exercise videos
INSERT INTO public.exercise_videos (title, description, video_url, thumbnail_url, duration, category, difficulty, calories_burned) VALUES
('30 Min Full Body HIIT', 'Intense 30-minute HIIT workout for maximum fat burn', 'https://www.youtube.com/embed/ml6cT4AZdqI', '', 30, 'hiit', 'intermediate', 350),
('7 Min Chest Workout', 'Quick and effective chest exercises', 'https://www.youtube.com/embed/4Y2ZdHCOXok', '', 7, 'chest', 'beginner', 80),
('7 Min Back Workout', 'Strengthen your back in 7 minutes', 'https://www.youtube.com/embed/eGo4IYlbE5g', '', 7, 'back', 'beginner', 75),
('7 Min Leg Workout', 'Build strong legs fast', 'https://www.youtube.com/embed/gnav51TF5e0', '', 7, 'legs', 'beginner', 90),
('7 Min Arm Workout', 'Tone your arms quickly', 'https://www.youtube.com/embed/DHmoZnUOF2g', '', 7, 'arms', 'beginner', 70),
('7 Min Core Workout', 'Strengthen your core muscles', 'https://www.youtube.com/embed/1919eTCoESo', '', 7, 'core', 'beginner', 65),
('20 Min HIIT Cardio', 'High intensity cardio blast', 'https://www.youtube.com/embed/M0uO8X3_tEA', '', 20, 'hiit', 'intermediate', 250),
('15 Min Full Body', 'Complete body workout', 'https://www.youtube.com/embed/gC_L9qAHVJ8', '', 15, 'full-body', 'beginner', 150);

-- Insert sample foods
INSERT INTO public.foods (name, calories, protein, carbs, fats, serving_size) VALUES
('Chicken Breast', 165, 31, 0, 3.6, '100g'),
('Brown Rice', 112, 2.6, 24, 0.9, '100g'),
('Broccoli', 34, 2.8, 7, 0.4, '100g'),
('Salmon', 208, 20, 0, 13, '100g'),
('Eggs', 155, 13, 1.1, 11, '2 large'),
('Oatmeal', 389, 16.9, 66.3, 6.9, '100g'),
('Banana', 89, 1.1, 23, 0.3, '1 medium'),
('Greek Yogurt', 59, 10, 3.6, 0.4, '100g'),
('Sweet Potato', 86, 1.6, 20, 0.1, '100g'),
('Almonds', 579, 21, 22, 50, '100g'),
('Apple', 52, 0.3, 14, 0.2, '1 medium'),
('Tuna', 132, 28, 0, 1.3, '100g'),
('Avocado', 160, 2, 9, 15, '100g'),
('Spinach', 23, 2.9, 3.6, 0.4, '100g'),
('Quinoa', 120, 4.4, 21.3, 1.9, '100g');