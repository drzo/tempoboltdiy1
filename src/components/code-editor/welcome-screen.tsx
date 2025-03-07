import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Code, FileCode, Github, Laptop, LayoutTemplate } from "lucide-react";

interface WelcomeScreenProps {
  onNewProject: () => void;
  onOpenTemplate: () => void;
}

export default function WelcomeScreen({
  onNewProject,
  onOpenTemplate,
}: WelcomeScreenProps) {
  return (
    <div className="flex items-center justify-center h-full w-full bg-background p-4">
      <div className="max-w-3xl w-full space-y-6">
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center mb-4">
            <Code className="h-10 w-10 text-primary mr-2" />
            <h1 className="text-3xl font-bold">Bolt.diy</h1>
          </div>
          <p className="text-muted-foreground">
            A modern, browser-based code editor for web development
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="cursor-pointer hover:bg-accent/50 transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileCode className="h-5 w-5 mr-2" />
                Start a new project
              </CardTitle>
              <CardDescription>
                Create a new HTML, CSS, and JavaScript project from scratch
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Begin with a minimal setup and build your web project step by
                step.
              </p>
            </CardContent>
            <CardFooter>
              <Button className="w-full" onClick={onNewProject}>
                Create New Project
              </Button>
            </CardFooter>
          </Card>

          <Card className="cursor-pointer hover:bg-accent/50 transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center">
                <LayoutTemplate className="h-5 w-5 mr-2" />
                Choose a template
              </CardTitle>
              <CardDescription>
                Start with a pre-built template to jumpstart your project
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Select from various templates including landing pages,
                interactive demos, and more.
              </p>
            </CardContent>
            <CardFooter>
              <Button
                variant="outline"
                className="w-full"
                onClick={onOpenTemplate}
              >
                Browse Templates
              </Button>
            </CardFooter>
          </Card>
        </div>

        <div className="pt-6">
          <h2 className="text-lg font-medium mb-3">Quick Tips</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-start space-x-3">
              <div className="bg-primary/10 p-2 rounded-md">
                <Laptop className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="text-sm font-medium">Live Preview</h3>
                <p className="text-xs text-muted-foreground">
                  See your changes in real-time with auto-refresh
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="bg-primary/10 p-2 rounded-md">
                <Github className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="text-sm font-medium">Keyboard Shortcuts</h3>
                <p className="text-xs text-muted-foreground">
                  Use ⌘+S to save and ⌘+Enter to run your code
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="bg-primary/10 p-2 rounded-md">
                <FileCode className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="text-sm font-medium">File Management</h3>
                <p className="text-xs text-muted-foreground">
                  Create and organize files in the explorer panel
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center text-xs text-muted-foreground pt-6">
          <p>Bolt.diy v1.0.0 • Made with ❤️ for web developers</p>
        </div>
      </div>
    </div>
  );
}
