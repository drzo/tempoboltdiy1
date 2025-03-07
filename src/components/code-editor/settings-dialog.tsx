import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SettingsDialogProps {
  autoRefresh: boolean;
  onAutoRefreshChange: (value: boolean) => void;
  fontSize: number;
  onFontSizeChange: (value: number) => void;
  theme: string;
  onThemeChange: (value: string) => void;
}

export default function SettingsDialog({
  autoRefresh,
  onAutoRefreshChange,
  fontSize,
  onFontSizeChange,
  theme,
  onThemeChange,
}: SettingsDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" title="Settings">
          <Settings className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Editor Settings</DialogTitle>
          <DialogDescription>
            Customize your coding environment
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="auto-refresh" className="flex flex-col space-y-1">
              <span>Auto-refresh Preview</span>
              <span className="font-normal text-xs text-muted-foreground">
                Update preview as you type
              </span>
            </Label>
            <Switch
              id="auto-refresh"
              checked={autoRefresh}
              onCheckedChange={onAutoRefreshChange}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="font-size" className="flex flex-col space-y-1">
              <span>Font Size</span>
              <span className="font-normal text-xs text-muted-foreground">
                Editor text size
              </span>
            </Label>
            <Select
              value={fontSize.toString()}
              onValueChange={(value) => onFontSizeChange(parseInt(value))}
            >
              <SelectTrigger className="w-24">
                <SelectValue placeholder="14px" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="12">12px</SelectItem>
                <SelectItem value="14">14px</SelectItem>
                <SelectItem value="16">16px</SelectItem>
                <SelectItem value="18">18px</SelectItem>
                <SelectItem value="20">20px</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="theme" className="flex flex-col space-y-1">
              <span>Editor Theme</span>
              <span className="font-normal text-xs text-muted-foreground">
                Color scheme for the code editor
              </span>
            </Label>
            <Select value={theme} onValueChange={onThemeChange}>
              <SelectTrigger className="w-24">
                <SelectValue placeholder="vs-dark" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="vs-dark">Dark</SelectItem>
                <SelectItem value="vs-light">Light</SelectItem>
                <SelectItem value="hc-black">High Contrast</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
