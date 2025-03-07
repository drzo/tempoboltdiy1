import { Loader2 } from "lucide-react";

export default function EditorLoading() {
  return (
    <div className="flex items-center justify-center h-full w-full bg-background">
      <div className="flex flex-col items-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Loading editor...</p>
      </div>
    </div>
  );
}
