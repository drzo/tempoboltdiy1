import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorDisplayProps {
  message: string;
  onRetry?: () => void;
}

export default function ErrorDisplay({ message, onRetry }: ErrorDisplayProps) {
  return (
    <div className="flex items-center justify-center h-full w-full bg-background">
      <div className="flex flex-col items-center space-y-4 max-w-md p-6 border rounded-lg bg-card">
        <AlertTriangle className="h-10 w-10 text-destructive" />
        <h3 className="text-lg font-semibold">Something went wrong</h3>
        <p className="text-sm text-center text-muted-foreground">{message}</p>
        {onRetry && (
          <Button onClick={onRetry} variant="outline">
            Try again
          </Button>
        )}
      </div>
    </div>
  );
}
