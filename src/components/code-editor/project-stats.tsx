import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { Loader2, FileCode, Users, Clock } from "lucide-react";

export default function ProjectStats() {
  const [stats, setStats] = useState({
    totalProjects: 0,
    publicProjects: 0,
    privateProjects: 0,
    recentProjects: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      if (!isSupabaseConfigured()) {
        setLoading(false);
        setError("Supabase not configured. Stats unavailable in demo mode.");
        return;
      }

      try {
        // Get total projects count
        const { count: totalCount, error: totalError } = await supabase
          .from("projects")
          .select("*", { count: "exact", head: true });

        if (totalError) throw totalError;

        // Get public projects count
        const { count: publicCount, error: publicError } = await supabase
          .from("projects")
          .select("*", { count: "exact", head: true })
          .eq("is_public", true);

        if (publicError) throw publicError;

        // Get recent projects
        const { data: recentProjects, error: recentError } = await supabase
          .from("projects")
          .select("id, name, created_at, is_public")
          .order("created_at", { ascending: false })
          .limit(5);

        if (recentError) throw recentError;

        setStats({
          totalProjects: totalCount || 0,
          publicProjects: publicCount || 0,
          privateProjects: (totalCount || 0) - (publicCount || 0),
          recentProjects: recentProjects || [],
        });
      } catch (err) {
        console.error("Error fetching project stats:", err);
        setError("Failed to load project statistics");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-40">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground text-center">{error}</p>
        </CardContent>
      </Card>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Projects
            </CardTitle>
            <FileCode className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProjects}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Public Projects
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.publicProjects}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Private Projects
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.privateProjects}</div>
          </CardContent>
        </Card>
      </div>

      {stats.recentProjects.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {stats.recentProjects.map((project: any) => (
                <div
                  key={project.id}
                  className="flex justify-between items-center"
                >
                  <div className="flex items-center">
                    <div className="ml-2">
                      <p className="text-sm font-medium">{project.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(project.created_at)}
                      </p>
                    </div>
                  </div>
                  <div className="text-xs bg-secondary px-2 py-1 rounded-full">
                    {project.is_public ? "Public" : "Private"}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
