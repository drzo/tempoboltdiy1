import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, User, Lock, Mail, ArrowLeft } from "lucide-react";

interface UserProfileProps {
  onBack: () => void;
}

export default function UserProfile({ onBack }: UserProfileProps) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [projectStats, setProjectStats] = useState({
    total: 0,
    public: 0,
    private: 0,
    recent: [],
  });
  const { toast } = useToast();

  useEffect(() => {
    const getUser = async () => {
      try {
        if (!isSupabaseConfigured()) {
          setLoading(false);
          return;
        }

        const { data } = await supabase.auth.getUser();
        if (data?.user) {
          setUser(data.user);
          setEmail(data.user.email || "");
          fetchUserProjects(data.user.id);
        }
      } catch (error) {
        console.error("Error getting user:", error);
      } finally {
        setLoading(false);
      }
    };

    getUser();
  }, []);

  const fetchUserProjects = async (userId: string) => {
    try {
      // Get total projects count
      const { count: totalCount } = await supabase
        .from("projects")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId);

      // Get public projects count
      const { count: publicCount } = await supabase
        .from("projects")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId)
        .eq("is_public", true);

      // Get recent projects
      const { data: recentProjects } = await supabase
        .from("projects")
        .select("id, name, created_at, is_public")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(5);

      setProjectStats({
        total: totalCount || 0,
        public: publicCount || 0,
        private: (totalCount || 0) - (publicCount || 0),
        recent: recentProjects || [],
      });
    } catch (error) {
      console.error("Error fetching user projects:", error);
    }
  };

  const handleUpdateEmail = async () => {
    if (!email.trim()) {
      toast({
        title: "Email required",
        description: "Please enter your email address",
        variant: "destructive",
      });
      return;
    }

    setIsUpdating(true);

    try {
      const { error } = await supabase.auth.updateUser({ email });

      if (error) throw error;

      toast({
        title: "Verification email sent",
        description: "Please check your email to confirm the change",
      });
    } catch (error) {
      console.error("Error updating email:", error);
      toast({
        title: "Failed to update email",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (!password) {
      toast({
        title: "Password required",
        description: "Please enter a new password",
        variant: "destructive",
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure your passwords match",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: "Password too short",
        description: "Password must be at least 6 characters long",
        variant: "destructive",
      });
      return;
    }

    setIsUpdating(true);

    try {
      const { error } = await supabase.auth.updateUser({ password });

      if (error) throw error;

      toast({
        title: "Password updated",
        description: "Your password has been updated successfully",
      });

      // Clear password fields
      setPassword("");
      setConfirmPassword("");
    } catch (error) {
      console.error("Error updating password:", error);
      toast({
        title: "Failed to update password",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto p-6 max-w-2xl">
        <div className="text-center space-y-4">
          <User className="h-16 w-16 mx-auto text-muted-foreground" />
          <h2 className="text-2xl font-bold">Not Signed In</h2>
          <p className="text-muted-foreground">
            Please sign in to view and manage your profile
          </p>
          <Button onClick={onBack}>Return to Dashboard</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Button variant="ghost" onClick={onBack} className="mb-6">
        <ArrowLeft className="h-4 w-4 mr-2" /> Back to Dashboard
      </Button>

      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">User Profile</h1>
          <p className="text-muted-foreground">
            Manage your account settings and view your projects
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Account Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-center mb-6">
                <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-12 w-12 text-primary" />
                </div>
              </div>

              <div>
                <p className="text-sm font-medium">Email</p>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>

              <div>
                <p className="text-sm font-medium">User ID</p>
                <p className="text-sm text-muted-foreground truncate">
                  {user.id}
                </p>
              </div>

              <div>
                <p className="text-sm font-medium">Account Created</p>
                <p className="text-sm text-muted-foreground">
                  {user.created_at ? formatDate(user.created_at) : "N/A"}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Project Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold">{projectStats.total}</p>
                  <p className="text-xs text-muted-foreground">
                    Total Projects
                  </p>
                </div>
                <div>
                  <p className="text-2xl font-bold">{projectStats.public}</p>
                  <p className="text-xs text-muted-foreground">Public</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">{projectStats.private}</p>
                  <p className="text-xs text-muted-foreground">Private</p>
                </div>
              </div>

              {projectStats.recent.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-medium mb-2">Recent Projects</p>
                  <div className="space-y-2">
                    {projectStats.recent.map((project: any) => (
                      <div
                        key={project.id}
                        className="flex justify-between items-center text-sm"
                      >
                        <span className="font-medium truncate">
                          {project.name}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(project.created_at)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2">
          <Tabs defaultValue="email" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="email" className="flex items-center">
                <Mail className="h-4 w-4 mr-2" /> Email
              </TabsTrigger>
              <TabsTrigger value="password" className="flex items-center">
                <Lock className="h-4 w-4 mr-2" /> Password
              </TabsTrigger>
            </TabsList>

            <TabsContent value="email" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Update Email</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                    />
                  </div>

                  <Button
                    onClick={handleUpdateEmail}
                    disabled={isUpdating || email === user.email}
                    className="w-full"
                  >
                    {isUpdating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      "Update Email"
                    )}
                  </Button>

                  <p className="text-xs text-muted-foreground">
                    Note: You will need to verify your new email address by
                    clicking the link sent to your inbox.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="password" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Change Password</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="new-password">New Password</Label>
                    <Input
                      id="new-password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm Password</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                    />
                  </div>

                  <Button
                    onClick={handleUpdatePassword}
                    disabled={
                      isUpdating || !password || password !== confirmPassword
                    }
                    className="w-full"
                  >
                    {isUpdating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      "Update Password"
                    )}
                  </Button>

                  <p className="text-xs text-muted-foreground">
                    Password must be at least 6 characters long. Choose a strong
                    password with a mix of letters, numbers, and symbols.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
