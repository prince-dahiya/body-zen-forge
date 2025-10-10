-- Insert more exercise videos for every body part
INSERT INTO public.exercise_videos (title, description, video_url, duration, category, difficulty, calories_burned) VALUES
-- Chest exercises
('10 Min Beginner Chest', 'Perfect chest workout for beginners', 'https://www.youtube.com/embed/Eh5GTRb3XWE', 10, 'chest', 'beginner', 100),
('15 Min Intermediate Chest', 'Build a stronger chest', 'https://www.youtube.com/embed/VmB7GqgKXXY', 15, 'chest', 'intermediate', 150),
('20 Min Advanced Chest', 'Maximum chest pump', 'https://www.youtube.com/embed/7l-bcSz7KkU', 20, 'chest', 'advanced', 200),

-- Back exercises
('10 Min Back Workout', 'Strengthen your back muscles', 'https://www.youtube.com/embed/GVvEu0NmYZg', 10, 'back', 'beginner', 95),
('15 Min Back Strength', 'Build back strength', 'https://www.youtube.com/embed/oAPCPqowVTA', 15, 'back', 'intermediate', 145),
('20 Min Back Builder', 'Advanced back training', 'https://www.youtube.com/embed/pLTU1rQ2Ip0', 20, 'back', 'advanced', 190),

-- Shoulder exercises
('10 Min Shoulder Workout', 'Build strong shoulders', 'https://www.youtube.com/embed/2kSEMoXxnZk', 10, 'shoulders', 'beginner', 90),
('15 Min Shoulder Burn', 'Intense shoulder training', 'https://www.youtube.com/embed/q5sNYB1Q6aM', 15, 'shoulders', 'intermediate', 140),

-- Arm exercises
('10 Min Arm Workout', 'Tone your arms', 'https://www.youtube.com/embed/kss5fN0BIdE', 10, 'arms', 'beginner', 85),
('15 Min Arm Builder', 'Build bigger arms', 'https://www.youtube.com/embed/IjsaY9STPxw', 15, 'arms', 'intermediate', 130),
('20 Min Arm Pump', 'Maximum arm workout', 'https://www.youtube.com/embed/CJy9zJvA5zs', 20, 'arms', 'advanced', 170),

-- Leg exercises
('10 Min Leg Workout', 'Strengthen your legs', 'https://www.youtube.com/embed/ZTpgHMddYKo', 10, 'legs', 'beginner', 110),
('15 Min Leg Burner', 'Intense leg training', 'https://www.youtube.com/embed/mGvzVjuY8SY', 15, 'legs', 'intermediate', 160),
('20 Min Leg Destroyer', 'Advanced leg workout', 'https://www.youtube.com/embed/F7OxqfCMxFI', 20, 'legs', 'advanced', 220),

-- Core exercises
('10 Min Core Workout', 'Build a strong core', 'https://www.youtube.com/embed/DHD1-2P94DI', 10, 'core', 'beginner', 80),
('15 Min Ab Workout', 'Sculpt your abs', 'https://www.youtube.com/embed/DG6qUfOj7-k', 15, 'core', 'intermediate', 120),
('20 Min Core Shredder', 'Advanced core training', 'https://www.youtube.com/embed/VRmRYwvdAYk', 20, 'core', 'advanced', 160),

-- Full body exercises
('10 Min Full Body Beginner', 'Complete body workout for beginners', 'https://www.youtube.com/embed/l06JbVDYw0U', 10, 'full-body', 'beginner', 130),
('20 Min Full Body Burn', 'Intense full body workout', 'https://www.youtube.com/embed/Cuc8BxM9mzI', 20, 'full-body', 'intermediate', 240),
('25 Min Full Body Beast', 'Advanced total body workout', 'https://www.youtube.com/embed/6W09KRJkrfU', 25, 'full-body', 'advanced', 300),

-- HIIT exercises
('10 Min HIIT Beginner', 'Start with HIIT training', 'https://www.youtube.com/embed/8Q4p3by4gVQ', 10, 'hiit', 'beginner', 140),
('15 Min HIIT Cardio', 'Fat burning HIIT', 'https://www.youtube.com/embed/ntBuQW8h4RQ', 15, 'hiit', 'intermediate', 200),
('25 Min HIIT Extreme', 'Maximum intensity HIIT', 'https://www.youtube.com/embed/cZnsLVArIt8', 25, 'hiit', 'advanced', 320);