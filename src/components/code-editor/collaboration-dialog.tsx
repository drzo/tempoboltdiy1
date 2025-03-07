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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Users, Trash2, UserPlus, Mail } from "lucide-react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";

interface CollaborationDialogProps {
  projectId?: string;
  projectName?: string;
  isOwner: boolean;
}

interface Collaborator {
  id: string;
  user_id: string;
  email: string;
  permission_level: "view" | "edit" | "admin";
  created_at: string;
}

export default function CollaborationDialog({
  projectId,
  projectName,
  isOwner,
}: CollaborationDialogProps) {
  const [open, setOpen] = useState(false);
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [permissionLevel, setPermissionLevel] = useState<
    "view" | "edit" | "admin"
  >("view");
  const [isAdding, setIsAdding] = useState(false);
  const { toast } = useToast();

  const fetchCollaborators = async () => {
    if (!projectId || !isSupabaseConfigured()) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // Get collaborators for this project
      const { data: collaboratorsData, error: collaboratorsError } =
        await supabase
          .from("collaborators")
          .select("id, user_id, permission_level, created_at")
          .eq("project_id", projectId);

      if (collaboratorsError) throw collaboratorsError;

      // Get user emails for each collaborator
      const collaboratorsWithEmails = await Promise.all(
        collaboratorsData.map(async (collaborator) => {
          // Get user email from auth.users
          const { data: userData, error: userError } = await supabase.rpc(
            "get_user_email",
            { user_id: collaborator.user_id },
          );

          if (userError) {
            console.error("Error fetching user email:", userError);
            return {
              ...collaborator,
              email: "Unknown user",
            };
          }

          return {
            ...collaborator,
            email: userData || "Unknown user",
          };
        }),
      );

      setCollaborators(collaboratorsWithEmails);
    } catch (error) {
      console.error("Error fetching collaborators:", error);
      toast({
        title: "Failed to load collaborators",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && projectId) {
      fetchCollaborators();
    }
  }, [open, projectId]);

  const handleAddCollaborator = async () => {
    if (!projectId || !email.trim()) {
      toast({
        title: "Email required",
        description: "Please enter an email address",
        variant: "destructive",
      });
      return;
    }

    setIsAdding(true);

    try {
      // First, get the user ID for the email
      const { data: userData, error: userError } = await supabase.rpc(
        "get_user_id_by_email",
        { email_address: email.trim() },
      );

      if (userError) throw userError;

      if (!userData) {
        toast({
          title: "User not found",
          description: "No user with that email address was found",
          variant: "destructive",
        });
        setIsAdding(false);
        return;
      }

      // Add the collaborator
      const { error: addError } = await supabase.from("collaborators").insert({
        project_id: projectId,
        user_id: userData,
        permission_level: permissionLevel,
      });

      if (addError) {
        if (addError.code === "23505") {
          // Unique violation
          toast({
            title: "Already a collaborator",
            description: "This user is already a collaborator on this project",
            variant: "destructive",
          });
        } else {
          throw addError;
        }
      } else {
        toast({
          title: "Collaborator added",
          description: `${email} has been added as a collaborator with ${permissionLevel} permissions`,
        });
        setEmail("");
        fetchCollaborators();
      }
    } catch (error) {
      console.error("Error adding collaborator:", error);
      toast({
        title: "Failed to add collaborator",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsAdding(false);
    }
  };

  const handleRemoveCollaborator = async (
    collaboratorId: string,
    collaboratorEmail: string,
  ) => {
    if (!projectId || !isOwner) return;

    try {
      const { error } = await supabase
        .from("collaborators")
        .delete()
        .eq("id", collaboratorId);

      if (error) throw error;

      toast({
        title: "Collaborator removed",
        description: `${collaboratorEmail} has been removed from this project`,
      });

      setCollaborators(collaborators.filter((c) => c.id !== collaboratorId));
    } catch (error) {
      console.error("Error removing collaborator:", error);
      toast({
        title: "Failed to remove collaborator",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  const handleUpdatePermission = async (
    collaboratorId: string,
    newPermission: "view" | "edit" | "admin",
    collaboratorEmail: string,
  ) => {
    if (!projectId || !isOwner) return;

    try {
      const { error } = await supabase
        .from("collaborators")
        .update({ permission_level: newPermission })
        .eq("id", collaboratorId);

      if (error) throw error;

      toast({
        title: "Permission updated",
        description: `${collaboratorEmail}'s permission has been updated to ${newPermission}`,
      });

      setCollaborators(
        collaborators.map((c) =>
          c.id === collaboratorId
            ? { ...c, permission_level: newPermission }
            : c,
        ),
      );
    } catch (error) {
      console.error("Error updating collaborator permission:", error);
      toast({
        title: "Failed to update permission",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Users className="h-4 w-4 mr-1" /> Collaborators
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Project Collaborators</DialogTitle>
          <DialogDescription>
            {projectName
              ? `Manage collaborators for "${projectName}"`
              : "Manage who can access this project"}
          </DialogDescription>
        </DialogHeader>

        {isOwner && (
          <div className="space-y-4 py-4 border-b">
            <div className="space-y-2">
              <Label htmlFor="email">Add Collaborator</Label>
              <div className="flex space-x-2">
                <div className="flex-1">
                  <Input
                    id="email"
                    placeholder="Email address"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isAdding}
                  />
                </div>
                <Select
                  value={permissionLevel}
                  onValueChange={(value: "view" | "edit" | "admin") =>
                    setPermissionLevel(value)
                  }
                  disabled={isAdding}
                >
                  <SelectTrigger className="w-[110px]">
                    <SelectValue placeholder="Permission" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="view">View</SelectItem>
                    <SelectItem value="edit">Edit</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button
              onClick={handleAddCollaborator}
              disabled={isAdding || !email.trim()}
              className="w-full"
            >
              {isAdding ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Add Collaborator
                </>
              )}
            </Button>
          </div>
        )}

        <div className="py-4">
          <h3 className="text-sm font-medium mb-3">Current Collaborators</h3>
          {loading ? (
            <div className="flex justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : collaborators.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No collaborators yet
            </p>
          ) : (
            <ScrollArea className="h-[200px]">
              <div className="space-y-3">
                {collaborators.map((collaborator) => (
                  <div
                    key={collaborator.id}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">
                          {collaborator.email}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Added:{" "}
                          {new Date(
                            collaborator.created_at,
                          ).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {isOwner && (
                        <Select
                          value={collaborator.permission_level}
                          onValueChange={(value: "view" | "edit" | "admin") =>
                            handleUpdatePermission(
                              collaborator.id,
                              value,
                              collaborator.email,
                            )
                          }
                        >
                          <SelectTrigger className="w-[90px] h-8">
                            <SelectValue placeholder="Permission" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="view">View</SelectItem>
                            <SelectItem value="edit">Edit</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                      {isOwner && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            handleRemoveCollaborator(
                              collaborator.id,
                              collaborator.email,
                            )
                          }
                          title="Remove collaborator"
                        >
                          <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                        </Button>
                      )}
                    </div>
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
