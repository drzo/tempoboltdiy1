import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  FileCode,
  BarChart,
  Settings as SettingsIcon,
  UserCircle,
} from "lucide-react";
import ProjectStats from "./project-stats";
import CloudProjectsDialog from "./cloud-projects-dialog";
import AuthDialog from "./auth-dialog";
import UserProfile from "./user-profile";
import { supabase } from "@/lib/supabase";

interface DashboardProps {
  onNewProject: () => void;
  onOpenTemplate: () => void;
  onLoadProject: (project: {
    html: string;
    css: string;
    js: string;
    name?: string;
  }) => void;
}

export default function Dashboard({
  onNewProject,
  onOpenTemplate,
  onLoadProject,
}: DashboardProps) {
  const [activeTab, setActiveTab] = useState("projects");
  const [showProfile, setShowProfile] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data } = await supabase.auth.getUser();
        setUser(data.user);
      } catch (error) {
        console.error("Error getting user:", error);
      }
    };

    getUser();

    // Set up auth state listener
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user || null);
      },
    );

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  if (showProfile) {
    return <UserProfile onBack={() => setShowProfile(false)} />;
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Bolt.diy Dashboard</h1>
          <p className="text-muted-foreground">Manage your coding projects</p>
        </div>
        <div className="flex items-center space-x-2">
          {user && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowProfile(true)}
              className="mr-2"
            >
              <UserCircle className="h-4 w-4 mr-1" /> My Profile
            </Button>
          )}
          <AuthDialog />
        </div>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <div className="flex justify-between items-center">
          <TabsList>
            <TabsTrigger value="projects" className="flex items-center">
              <FileCode className="mr-2 h-4 w-4" />
              Projects
            </TabsTrigger>
            <TabsTrigger value="stats" className="flex items-center">
              <BarChart className="mr-2 h-4 w-4" />
              Statistics
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center">
              <SettingsIcon className="mr-2 h-4 w-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          <div className="flex space-x-2">
            <Button onClick={onNewProject}>New Project</Button>
            <Button variant="outline" onClick={onOpenTemplate}>
              Use Template
            </Button>
            <CloudProjectsDialog onSelectProject={onLoadProject} />
          </div>
        </div>

        <TabsContent value="projects" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* This would be populated with actual projects */}
            <div className="border rounded-lg p-6 flex flex-col justify-between bg-card hover:shadow-md transition-shadow">
              <div>
                <h3 className="font-medium text-lg">Create New Project</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Start a fresh project with HTML, CSS, and JavaScript
                </p>
              </div>
              <Button className="mt-4" onClick={onNewProject}>
                Create New
              </Button>
            </div>

            <div className="border rounded-lg p-6 flex flex-col justify-between bg-card hover:shadow-md transition-shadow">
              <div>
                <h3 className="font-medium text-lg">Use Template</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Start with a pre-built template to jumpstart your project
                </p>
              </div>
              <Button
                variant="outline"
                className="mt-4"
                onClick={onOpenTemplate}
              >
                Browse Templates
              </Button>
            </div>

            <div className="border rounded-lg p-6 flex flex-col justify-between bg-card hover:shadow-md transition-shadow">
              <div>
                <h3 className="font-medium text-lg">Open Project</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Load an existing project from the cloud
                </p>
              </div>
              <CloudProjectsDialog onSelectProject={onLoadProject} />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="stats">
          <ProjectStats />
        </TabsContent>

        <TabsContent value="settings">
          <div className="space-y-4">
            <div className="border rounded-lg p-6 bg-card">
              <h3 className="font-medium text-lg mb-4">Appearance</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Theme</p>
                    <p className="text-sm text-muted-foreground">
                      Choose between light and dark mode
                    </p>
                  </div>
                  <Button variant="outline">Toggle Theme</Button>
                </div>
              </div>
            </div>

            <div className="border rounded-lg p-6 bg-card">
              <h3 className="font-medium text-lg mb-4">Account</h3>
              <div className="space-y-4">
                {user ? (
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">User Profile</p>
                      <p className="text-sm text-muted-foreground">
                        Manage your account settings
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => setShowProfile(true)}
                    >
                      <UserCircle className="h-4 w-4 mr-1" /> View Profile
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Sign In</p>
                      <p className="text-sm text-muted-foreground">
                        Sign in to save your projects to the cloud
                      </p>
                    </div>
                    <AuthDialog />
                  </div>
                )}
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
