import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Cloud, Save } from "lucide-react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";

interface CloudSaveDialogProps {
  html: string;
  css: string;
  js: string;
  projectId?: string;
  projectName?: string;
  onSuccess?: (projectId: string) => void;
}

export default function CloudSaveDialog({
  html,
  css,
  js,
  projectId,
  projectName,
  onSuccess,
}: CloudSaveDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [isUpdate, setIsUpdate] = useState(false);
  const [isPublic, setIsPublic] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (projectName) {
      setName(projectName);
      setIsUpdate(!!projectId);
    }
  }, [projectName, projectId]);

  const handleSave = async () => {
    if (!name.trim()) {
      toast({
        title: "Project name required",
        description: "Please enter a name for your project",
        variant: "destructive",
      });
      return;
    }

    if (!isSupabaseConfigured()) {
      toast({
        title: "Supabase not configured",
        description:
          "Cloud save is not available in demo mode. Please configure Supabase to use this feature.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user && !isPublic) {
        toast({
          title: "Authentication required",
          description: "You need to sign in to save private projects",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      let data, error;

      if (isUpdate && projectId) {
        // Update existing project
        const result = await supabase
          .from("projects")
          .update({
            name,
            html,
            css,
            js,
            is_public: isPublic,
            // Don't update user_id as it would change ownership
          })
          .eq("id", projectId)
          .select();

        data = result.data;
        error = result.error;
      } else {
        // Create new project
        const result = await supabase
          .from("projects")
          .insert([
            {
              name,
              html,
              css,
              js,
              is_public: isPublic,
              user_id: user?.id || null,
            },
          ])
          .select();

        data = result.data;
        error = result.error;
      }

      if (error) throw error;

      toast({
        title: isUpdate ? "Project updated" : "Project saved to cloud",
        description: `Your project "${name}" has been ${isUpdate ? "updated" : "saved"} successfully`,
      });

      if (onSuccess && data?.[0]?.id) {
        onSuccess(data[0].id);
      }

      setOpen(false);
    } catch (error) {
      console.error("Error saving project:", error);
      toast({
        title: "Failed to save project",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Cloud className="h-4 w-4 mr-1" />{" "}
          {isUpdate ? "Update Project" : "Save to Cloud"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isUpdate ? "Update Project" : "Save Project to Cloud"}
          </DialogTitle>
          <DialogDescription>
            {isUpdate
              ? "Update your project with the latest changes"
              : "Save your project to access it from anywhere"}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="project-name" className="text-right">
              Name
            </Label>
            <Input
              id="project-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My Awesome Project"
              className="col-span-3"
              autoFocus
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="project-visibility" className="text-right">
              Visibility
            </Label>
            <div className="col-span-3 flex items-center space-x-2">
              <Button
                variant={isPublic ? "default" : "outline"}
                size="sm"
                onClick={() => setIsPublic(true)}
                className="flex-1"
              >
                Public
              </Button>
              <Button
                variant={!isPublic ? "default" : "outline"}
                size="sm"
                onClick={() => setIsPublic(false)}
                className="flex-1"
              >
                Private
              </Button>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading
              ? "Saving..."
              : isUpdate
                ? "Update Project"
                : "Save Project"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
