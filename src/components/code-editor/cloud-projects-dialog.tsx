import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FolderOpen, Search, Trash2 } from "lucide-react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";

interface CloudProjectsDialogProps {
  onSelectProject: (project: {
    id?: string;
    html: string;
    css: string;
    js: string;
    name: string;
    is_public?: boolean;
    user_id?: string;
  }) => void;
}

interface Project {
  id: string;
  name: string;
  html: string;
  css: string;
  js: string;
  created_at: string;
  is_public: boolean;
  user_id: string | null;
}

export default function CloudProjectsDialog({
  onSelectProject,
}: CloudProjectsDialogProps) {
  const [open, setOpen] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  const fetchProjects = async () => {
    setIsLoading(true);

    if (!isSupabaseConfigured()) {
      setIsLoading(false);
      setProjects([]);
      toast({
        title: "Supabase not configured",
        description:
          "Cloud projects are not available in demo mode. Please configure Supabase to use this feature.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser();

      let query = supabase
        .from("projects")
        .select("*")
        .order("created_at", { ascending: false });

      // If user is logged in, show their private projects + public projects
      // If not logged in, only show public projects
      if (user) {
        query = query.or(`is_public.eq.true,user_id.eq.${user.id}`);
      } else {
        query = query.eq("is_public", true);
      }

      const { data, error } = await query;

      if (error) throw error;
      setProjects(data || []);
    } catch (error) {
      console.error("Error fetching projects:", error);
      toast({
        title: "Failed to load projects",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteProject = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();

    if (!confirm("Are you sure you want to delete this project?")) return;

    try {
      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser();

      // Check if project belongs to user
      const { data: project } = await supabase
        .from("projects")
        .select("user_id")
        .eq("id", id)
        .single();

      if (project?.user_id && project.user_id !== user?.id) {
        toast({
          title: "Permission denied",
          description: "You can only delete your own projects",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase.from("projects").delete().eq("id", id);

      if (error) throw error;

      setProjects(projects.filter((p) => p.id !== id));

      toast({
        title: "Project deleted",
        description: "The project has been deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting project:", error);
      toast({
        title: "Failed to delete project",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (open) {
      fetchProjects();
    }
  }, [open]);

  const filteredProjects = projects.filter((project) =>
    project.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <FolderOpen className="h-4 w-4 mr-1" /> Open Project
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Cloud Projects</DialogTitle>
          <DialogDescription>
            Browse and open your saved projects
          </DialogDescription>
        </DialogHeader>

        <div className="relative mb-4">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search projects..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <ScrollArea className="h-[300px] rounded-md border p-2">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-sm text-muted-foreground">
                Loading projects...
              </p>
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-sm text-muted-foreground">
                {searchQuery
                  ? "No projects match your search"
                  : "No projects found"}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredProjects.map((project) => (
                <div
                  key={project.id}
                  className="flex items-center justify-between p-3 rounded-md hover:bg-accent cursor-pointer"
                  onClick={() => {
                    onSelectProject({
                      id: project.id,
                      html: project.html,
                      css: project.css,
                      js: project.js,
                      name: project.name,
                      is_public: project.is_public,
                      user_id: project.user_id,
                    });
                    setOpen(false);
                  }}
                >
                  <div>
                    <h3 className="font-medium">{project.name}</h3>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(project.created_at)} •{" "}
                      {project.is_public ? "Public" : "Private"}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => handleDeleteProject(project.id, e)}
                    title="Delete project"
                  >
                    <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
