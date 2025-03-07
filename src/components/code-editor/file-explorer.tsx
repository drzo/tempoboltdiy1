import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Folder,
  File,
  Plus,
  Trash2,
  ChevronRight,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface FileNode {
  id: string;
  name: string;
  type: "file" | "folder";
  children?: FileNode[];
  content?: string;
  language?: string;
}

interface FileExplorerProps {
  onFileSelect: (file: {
    name: string;
    content: string;
    language: string;
  }) => void;
}

export default function FileExplorer({ onFileSelect }: FileExplorerProps) {
  const [files, setFiles] = useState<FileNode[]>([
    {
      id: "1",
      name: "Project",
      type: "folder",
      children: [
        {
          id: "2",
          name: "index.html",
          type: "file",
          language: "html",
          content: `<!DOCTYPE html>
<html>
<head>
  <title>My Project</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <h1>Hello World!</h1>
  <p>Welcome to my project.</p>
  <script src="script.js"></script>
</body>
</html>`,
        },
        {
          id: "3",
          name: "styles.css",
          type: "file",
          language: "css",
          content: `body {
  font-family: system-ui, sans-serif;
  line-height: 1.5;
  color: #333;
  max-width: 800px;
  margin: 0 auto;
  padding: 1rem;
}

h1 {
  color: #0070f3;
}`,
        },
        {
          id: "4",
          name: "script.js",
          type: "file",
          language: "javascript",
          content: `// Your JavaScript code here
console.log('Hello from JavaScript!');

document.addEventListener('DOMContentLoaded', () => {
  // DOM is ready
});`,
        },
      ],
    },
  ]);

  const [expandedFolders, setExpandedFolders] = useState<
    Record<string, boolean>
  >({
    "1": true,
  });

  const [newItemName, setNewItemName] = useState("");
  const [isCreatingFile, setIsCreatingFile] = useState(false);
  const [parentFolderId, setParentFolderId] = useState<string | null>(null);

  const toggleFolder = (id: string) => {
    setExpandedFolders((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleFileClick = (file: FileNode) => {
    if (file.type === "file" && file.content) {
      onFileSelect({
        name: file.name,
        content: file.content,
        language: file.language || "text",
      });
    }
  };

  const startCreatingFile = (parentId: string) => {
    setIsCreatingFile(true);
    setParentFolderId(parentId);
    setNewItemName("");
  };

  const cancelCreatingFile = () => {
    setIsCreatingFile(false);
    setParentFolderId(null);
    setNewItemName("");
  };

  const createNewFile = () => {
    if (!newItemName.trim() || !parentFolderId) return;

    const newFile: FileNode = {
      id: Date.now().toString(),
      name: newItemName,
      type: "file",
      language: newItemName.endsWith(".html")
        ? "html"
        : newItemName.endsWith(".css")
          ? "css"
          : newItemName.endsWith(".js")
            ? "javascript"
            : "text",
      content: "",
    };

    const updateFiles = (nodes: FileNode[]): FileNode[] => {
      return nodes.map((node) => {
        if (node.id === parentFolderId) {
          return {
            ...node,
            children: [...(node.children || []), newFile],
          };
        }
        if (node.children) {
          return {
            ...node,
            children: updateFiles(node.children),
          };
        }
        return node;
      });
    };

    setFiles(updateFiles(files));
    setIsCreatingFile(false);
    setParentFolderId(null);
    setNewItemName("");
  };

  const renderFileTree = (nodes: FileNode[], level = 0) => {
    return nodes.map((node) => (
      <div key={node.id} style={{ paddingLeft: `${level * 12}px` }}>
        <div
          className={cn(
            "flex items-center py-1 px-2 rounded-md hover:bg-accent/50 cursor-pointer",
            node.type === "file" && "text-sm",
          )}
          onClick={() => {
            if (node.type === "folder") {
              toggleFolder(node.id);
            } else {
              handleFileClick(node);
            }
          }}
        >
          {node.type === "folder" ? (
            <>
              {expandedFolders[node.id] ? (
                <ChevronDown className="h-4 w-4 mr-1 text-muted-foreground" />
              ) : (
                <ChevronRight className="h-4 w-4 mr-1 text-muted-foreground" />
              )}
              <Folder className="h-4 w-4 mr-2 text-blue-500" />
              <span>{node.name}</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 ml-auto"
                onClick={(e) => {
                  e.stopPropagation();
                  startCreatingFile(node.id);
                }}
              >
                <Plus className="h-3 w-3" />
              </Button>
            </>
          ) : (
            <>
              <File className="h-4 w-4 mr-2 text-gray-500" />
              <span>{node.name}</span>
            </>
          )}
        </div>

        {node.type === "folder" &&
          expandedFolders[node.id] &&
          node.children &&
          renderFileTree(node.children, level + 1)}

        {isCreatingFile &&
          parentFolderId === node.id &&
          expandedFolders[node.id] && (
            <div
              className="flex items-center py-1 px-2 ml-6"
              style={{ paddingLeft: `${level * 12 + 12}px` }}
            >
              <File className="h-4 w-4 mr-2 text-gray-500" />
              <Input
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                className="h-7 py-1 text-sm"
                placeholder="filename.ext"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") createNewFile();
                  if (e.key === "Escape") cancelCreatingFile();
                }}
              />
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 ml-1"
                onClick={createNewFile}
              >
                <Plus className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={cancelCreatingFile}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          )}
      </div>
    ));
  };

  return (
    <div className="h-full flex flex-col border-r">
      <div className="p-2 border-b flex justify-between items-center">
        <h3 className="text-sm font-medium">Files</h3>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-2">{renderFileTree(files)}</div>
      </ScrollArea>
    </div>
  );
}
