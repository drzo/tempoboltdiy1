import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Play,
  Save,
  Share,
  Moon,
  Sun,
  Download,
  LayoutTemplate,
  Archive,
  Cloud,
  FolderOpen,
  LogIn,
  LayoutDashboard,
  Users,
  History,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import TemplateDialog from "./template-dialog";
import CloudSaveDialog from "./cloud-save-dialog";
import CloudProjectsDialog from "./cloud-projects-dialog";
import AuthDialog from "./auth-dialog";
import CollaborationDialog from "./collaboration-dialog";
import VersionHistoryDialog from "./version-history-dialog";
import { useState } from "react";
import KeyboardShortcuts from "./keyboard-shortcuts";
import SettingsDialog from "./settings-dialog";

interface ToolbarProps {
  onRun: () => void;
  onSave: () => void;
  onShare: () => void;
  onExport: () => void;
  onExportZip: () => void;
  autoRefresh: boolean;
  onAutoRefreshChange: (value: boolean) => void;
  fontSize: number;
  onFontSizeChange: (value: number) => void;
  editorTheme: string;
  onEditorThemeChange: (value: string) => void;
  onSelectTemplate?: (template: {
    html: string;
    css: string;
    js: string;
  }) => void;
  templateDialogRef?: React.RefObject<{ openDialog: () => void }>;
  html: string;
  css: string;
  js: string;
  onLoadProject: (project: {
    id?: string;
    html: string;
    css: string;
    js: string;
    name?: string;
    is_public?: boolean;
    user_id?: string;
  }) => void;
  onShowDashboard?: () => void;
  currentProjectId?: string;
  currentProjectName?: string;
  isProjectOwner?: boolean;
}

export default function Toolbar({
  onRun,
  onSave,
  onShare,
  onExport,
  onExportZip,
  autoRefresh,
  onAutoRefreshChange,
  fontSize,
  onFontSizeChange,
  editorTheme,
  onEditorThemeChange,
  onSelectTemplate,
  templateDialogRef,
  html,
  css,
  js,
  onLoadProject,
  onShowDashboard,
  currentProjectId,
  currentProjectName,
  isProjectOwner,
}: ToolbarProps) {
  const [isDarkTheme, setIsDarkTheme] = useState(
    document.documentElement.classList.contains("dark"),
  );

  return (
    <div className="flex items-center justify-between p-2 border-b bg-background">
      <div className="flex items-center space-x-2">
        <h1 className="text-xl font-bold">Bolt.diy</h1>
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <Switch
            id="auto-refresh"
            checked={autoRefresh}
            onCheckedChange={onAutoRefreshChange}
            size="sm"
          />
          <Label htmlFor="auto-refresh" className="text-xs">
            Auto-refresh
          </Label>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="theme-toggle"
            checked={isDarkTheme}
            onCheckedChange={(checked) => {
              setIsDarkTheme(checked);
              document.documentElement.classList.toggle("dark", checked);
            }}
            size="sm"
          />
          <Label htmlFor="theme-toggle" className="flex items-center space-x-1">
            {isDarkTheme ? (
              <Moon className="h-3 w-3" />
            ) : (
              <Sun className="h-3 w-3" />
            )}
          </Label>
        </div>

        <SettingsDialog
          autoRefresh={autoRefresh}
          onAutoRefreshChange={onAutoRefreshChange}
          fontSize={fontSize}
          onFontSizeChange={onFontSizeChange}
          theme={editorTheme}
          onThemeChange={onEditorThemeChange}
        />
        <KeyboardShortcuts />
      </div>

      <div className="flex items-center space-x-2">
        {onShowDashboard && (
          <Button variant="outline" size="sm" onClick={onShowDashboard}>
            <LayoutDashboard className="h-4 w-4 mr-1" /> Dashboard
          </Button>
        )}
        <Button variant="outline" size="sm" onClick={onRun}>
          <Play className="h-4 w-4 mr-1" /> Run
        </Button>
        <Button variant="outline" size="sm" onClick={onSave}>
          <Save className="h-4 w-4 mr-1" /> Save Locally
        </Button>
        <CloudSaveDialog
          html={html}
          css={css}
          js={js}
          projectId={currentProjectId}
          projectName={currentProjectName}
        />
        <CloudProjectsDialog onSelectProject={onLoadProject} />
        {currentProjectId && (
          <>
            <CollaborationDialog
              projectId={currentProjectId}
              projectName={currentProjectName}
              isOwner={!!isProjectOwner}
            />
            <VersionHistoryDialog
              projectId={currentProjectId}
              projectName={currentProjectName}
              currentHtml={html}
              currentCss={css}
              currentJs={js}
              onRestoreVersion={({ html: newHtml, css: newCss, js: newJs }) => {
                onLoadProject({
                  id: currentProjectId,
                  html: newHtml,
                  css: newCss,
                  js: newJs,
                  name: currentProjectName,
                });
              }}
            />
          </>
        )}
        <AuthDialog />
        <Button variant="outline" size="sm" onClick={onShare}>
          <Share className="h-4 w-4 mr-1" /> Share
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-1" /> Export
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onExport}>
              <Download className="h-4 w-4 mr-2" /> Export as HTML
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onExportZip}>
              <Archive className="h-4 w-4 mr-2" /> Export as ZIP
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        {onSelectTemplate && (
          <TemplateDialog
            ref={templateDialogRef}
            onSelectTemplate={onSelectTemplate}
          />
        )}
      </div>
    </div>
  );
}
