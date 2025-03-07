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
import { ScrollArea } from "@/components/ui/scroll-area";
import { History, RotateCcw, Loader2 } from "lucide-react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";

interface Version {
  id: string;
  created_at: string;
  version_number: number;
  commit_message: string;
  html: string;
  css: string;
  js: string;
}

interface VersionHistoryDialogProps {
  projectId?: string;
  projectName?: string;
  currentHtml: string;
  currentCss: string;
  currentJs: string;
  onRestoreVersion: (version: {
    html: string;
    css: string;
    js: string;
  }) => void;
}

export default function VersionHistoryDialog({
  projectId,
  projectName,
  currentHtml,
  currentCss,
  currentJs,
  onRestoreVersion,
}: VersionHistoryDialogProps) {
  const [open, setOpen] = useState(false);
  const [versions, setVersions] = useState<Version[]>([]);
  const [loading, setLoading] = useState(true);
  const [commitMessage, setCommitMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const fetchVersions = async () => {
    if (!projectId || !isSupabaseConfigured()) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const { data, error } = await supabase
        .from("versions")
        .select("*")
        .eq("project_id", projectId)
        .order("version_number", { ascending: false });

      if (error) throw error;

      setVersions(data || []);
    } catch (error) {
      console.error("Error fetching versions:", error);
      toast({
        title: "Failed to load version history",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && projectId) {
      fetchVersions();
    }
  }, [open, projectId]);

  const handleCreateVersion = async () => {
    if (!projectId) return;

    setIsSaving(true);

    try {
      // Get the latest version number
      const { data: latestVersion } = await supabase
        .from("versions")
        .select("version_number")
        .eq("project_id", projectId)
        .order("version_number", { ascending: false })
        .limit(1)
        .single();

      const nextVersionNumber = (latestVersion?.version_number || 0) + 1;

      // Create new version
      const { error } = await supabase.from("versions").insert({
        project_id: projectId,
        version_number: nextVersionNumber,
        commit_message: commitMessage.trim() || `Version ${nextVersionNumber}`,
        html: currentHtml,
        css: currentCss,
        js: currentJs,
      });

      if (error) throw error;

      toast({
        title: "Version saved",
        description: "Your changes have been saved as a new version",
      });

      setCommitMessage("");
      fetchVersions();
    } catch (error) {
      console.error("Error creating version:", error);
      toast({
        title: "Failed to save version",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleRestoreVersion = (version: Version) => {
    onRestoreVersion({
      html: version.html,
      css: version.css,
      js: version.js,
    });

    toast({
      title: "Version restored",
      description: `Project restored to version ${version.version_number}`,
    });

    setOpen(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <History className="h-4 w-4 mr-1" /> Version History
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Version History</DialogTitle>
          <DialogDescription>
            {projectName
              ? `View and restore previous versions of "${projectName}"`
              : "View and restore previous versions"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4 border-b">
          <div className="flex space-x-2">
            <Input
              placeholder="Commit message (optional)"
              value={commitMessage}
              onChange={(e) => setCommitMessage(e.target.value)}
              disabled={isSaving}
            />
            <Button onClick={handleCreateVersion} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Version"
              )}
            </Button>
          </div>
        </div>

        <div className="py-4">
          <h3 className="text-sm font-medium mb-3">Previous Versions</h3>
          {loading ? (
            <div className="flex justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : versions.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No versions saved yet
            </p>
          ) : (
            <ScrollArea className="h-[300px]">
              <div className="space-y-3">
                {versions.map((version) => (
                  <div
                    key={version.id}
                    className="flex items-center justify-between p-3 rounded-md hover:bg-accent"
                  >
                    <div>
                      <p className="text-sm font-medium">
                        Version {version.version_number}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(version.created_at)}
                      </p>
                      {version.commit_message && (
                        <p className="text-sm mt-1">{version.commit_message}</p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRestoreVersion(version)}
                      title="Restore this version"
                    >
                      <RotateCcw className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
