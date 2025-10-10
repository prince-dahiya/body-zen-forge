import { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Video, Clock, Flame, Filter } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

interface ExerciseVideo {
  id: string;
  title: string;
  description: string;
  video_url: string;
  duration: number;
  category: string;
  difficulty: string;
  calories_burned: number;
}

const Exercises = () => {
  const [videos, setVideos] = useState<ExerciseVideo[]>([]);
  const [filteredVideos, setFilteredVideos] = useState<ExerciseVideo[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState("all");
  const [loading, setLoading] = useState(true);

  const categories = ["all", "hiit", "chest", "back", "legs", "arms", "core", "full-body"];
  const difficulties = ["all", "beginner", "intermediate", "advanced"];

  useEffect(() => {
    loadVideos();
  }, []);

  useEffect(() => {
    filterVideos();
  }, [selectedCategory, selectedDifficulty, videos]);

  const loadVideos = async () => {
    const { data, error } = await supabase
      .from("exercise_videos")
      .select("*")
      .order("duration", { ascending: true });

    if (error) {
      toast.error("Failed to load exercise videos");
      return;
    }

    setVideos(data || []);
    setLoading(false);
  };

  const filterVideos = () => {
    let filtered = videos;

    if (selectedCategory !== "all") {
      filtered = filtered.filter(v => v.category === selectedCategory);
    }

    if (selectedDifficulty !== "all") {
      filtered = filtered.filter(v => v.difficulty === selectedDifficulty);
    }

    setFilteredVideos(filtered);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner": return "bg-green-500/10 text-green-500";
      case "intermediate": return "bg-yellow-500/10 text-yellow-500";
      case "advanced": return "bg-red-500/10 text-red-500";
      default: return "bg-primary/10 text-primary";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-lg bg-gradient-to-br from-primary to-secondary">
            <Video className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Exercise Library</h1>
            <p className="text-muted-foreground">Follow along with guided workout videos</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex items-center gap-2 flex-1">
            <Filter className="h-5 w-5 text-muted-foreground" />
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat === "all" ? "All Categories" : cat.replace("-", " ").toUpperCase()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex-1">
            <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
              <SelectTrigger>
                <SelectValue placeholder="Difficulty" />
              </SelectTrigger>
              <SelectContent>
                {difficulties.map((diff) => (
                  <SelectItem key={diff} value={diff}>
                    {diff === "all" ? "All Levels" : diff.charAt(0).toUpperCase() + diff.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Video Grid */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading exercises...</p>
          </div>
        ) : filteredVideos.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No exercises found with these filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVideos.map((video) => (
              <Card key={video.id} className="overflow-hidden hover:border-primary transition-all">
                <div className="aspect-video bg-muted">
                  <iframe
                    src={video.video_url}
                    title={video.title}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
                <CardHeader>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <CardTitle className="text-lg">{video.title}</CardTitle>
                    <Badge className={getDifficultyColor(video.difficulty)}>
                      {video.difficulty}
                    </Badge>
                  </div>
                  <CardDescription>{video.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{video.duration} min</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Flame className="h-4 w-4" />
                      <span>{video.calories_burned} cal</span>
                    </div>
                    <Badge variant="outline" className="ml-auto">
                      {video.category}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Exercises;
