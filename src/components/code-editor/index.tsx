import { useState, useEffect, useCallback, useRef } from "react";
import {
  ResizablePanel,
  ResizablePanelGroup,
  ResizableHandle,
} from "@/components/ui/resizable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileCode, FileText, FileType2 } from "lucide-react";
import MonacoEditor from "./monaco-editor";
import Toolbar from "./toolbar";
import ShareDialog from "./share-dialog";
import FileExplorer from "./file-explorer";
import WelcomeScreen from "./welcome-screen";
import Dashboard from "./dashboard";
import { EditorState } from "./types";
import {
  combineCode,
  encodeProjectData,
  decodeProjectData,
  exportAsHtmlFile,
  exportAsZip,
} from "./utils";
import { useToast } from "@/components/ui/use-toast";

const defaultHtml = `<!DOCTYPE html>
<html>
<head>
  <title>My Project</title>
</head>
<body>
  <h1>Hello World!</h1>
  <p>Start coding to see your changes here.</p>
</body>
</html>`;

const defaultCss = `body {
  font-family: system-ui, sans-serif;
  line-height: 1.5;
  color: #333;
  max-width: 800px;
  margin: 0 auto;
  padding: 1rem;
}

h1 {
  color: #0070f3;
}`;

const defaultJs = `// Your JavaScript code here
console.log('Hello from JavaScript!');

document.addEventListener('DOMContentLoaded', () => {
  // DOM is ready
});
`;

export default function CodeEditor() {
  // Initialize toast without using hooks at the top level
  const toast = (props) => {
    const { toast: actualToast } = useToast();
    if (actualToast) {
      actualToast(props);
    }
  };

  // Check URL for shared code
  const loadFromUrl = (): EditorState | null => {
    try {
      const params = new URLSearchParams(window.location.search);
      const codeParam = params.get("code");

      if (codeParam) {
        const decoded = decodeProjectData(codeParam);
        return {
          html: decoded.html || defaultHtml,
          css: decoded.css || defaultCss,
          js: decoded.js || defaultJs,
          autoRefresh: true,
        };
      }
    } catch (e) {
      console.error("Failed to load from URL:", e);
    }
    return null;
  };

  // Try to load from localStorage if not from URL
  const loadSavedState = (): EditorState => {
    try {
      // First check URL
      const urlState = loadFromUrl();
      if (urlState) return urlState;

      // Then check localStorage
      const saved = localStorage.getItem("bolt-diy-code");
      if (saved) {
        const parsed = JSON.parse(saved) as EditorState;
        return {
          html: parsed.html || defaultHtml,
          css: parsed.css || defaultCss,
          js: parsed.js || defaultJs,
          autoRefresh:
            parsed.autoRefresh !== undefined ? parsed.autoRefresh : true,
        };
      }
    } catch (e) {
      console.error("Failed to load saved state:", e);
    }
    return {
      html: defaultHtml,
      css: defaultCss,
      js: defaultJs,
      autoRefresh: true,
    };
  };

  const initialState = loadSavedState();

  const [html, setHtml] = useState(initialState.html);
  const [css, setCss] = useState(initialState.css);
  const [js, setJs] = useState(initialState.js);
  const [output, setOutput] = useState("");
  const [activeTab, setActiveTab] = useState("html");
  const [autoRefresh, setAutoRefresh] = useState(initialState.autoRefresh);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const [fontSize, setFontSize] = useState(initialState.fontSize || 14);
  const [editorTheme, setEditorTheme] = useState(
    initialState.editorTheme || "vs-dark",
  );
  const [showWelcome, setShowWelcome] = useState(
    !localStorage.getItem("bolt-diy-code"),
  );
  const [showDashboard, setShowDashboard] = useState(false);
  const [currentProjectId, setCurrentProjectId] = useState<
    string | undefined
  >();
  const [currentProjectName, setCurrentProjectName] = useState<
    string | undefined
  >();
  const [isProjectOwner, setIsProjectOwner] = useState(false);
  const templateDialogRef = useRef<{ openDialog: () => void } | null>(null);

  // Add a global handler to prevent ResizeObserver errors
  useEffect(() => {
    const errorHandler = (event) => {
      if (event.message && event.message.includes("ResizeObserver")) {
        event.stopImmediatePropagation();
        event.preventDefault();
        return false;
      }
    };

    window.addEventListener("error", errorHandler, true);
    window.addEventListener("unhandledrejection", (event) => {
      if (event.reason && String(event.reason).includes("ResizeObserver")) {
        event.preventDefault();
      }
    });

    return () => {
      window.removeEventListener("error", errorHandler, true);
      window.removeEventListener("unhandledrejection", errorHandler);
    };
  }, []);

  useEffect(() => {
    if (autoRefresh) {
      // Add debounce to prevent too frequent updates
      const timer = setTimeout(() => {
        updatePreview();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [html, css, js, autoRefresh]);

  // Listen for keyboard shortcuts
  useEffect(() => {
    const handleSaveShortcut = () => {
      handleSaveCode();
    };

    const handleRunShortcut = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        handleRunCode();
      }
    };

    window.addEventListener("editor-save", handleSaveShortcut);
    window.addEventListener("keydown", handleRunShortcut);

    return () => {
      window.removeEventListener("editor-save", handleSaveShortcut);
      window.removeEventListener("keydown", handleRunShortcut);
    };
  }, [html, css, js, autoRefresh]);

  const updatePreview = useCallback(() => {
    try {
      const combinedOutput = combineCode(html, css, js);
      // Add script to handle ResizeObserver errors in the iframe
      const outputWithErrorHandler = combinedOutput.replace(
        "</head>",
        `
        <script>
          // Prevent ResizeObserver loop limit exceeded error
          const originalResizeObserver = window.ResizeObserver;
          window.ResizeObserver = class ResizeObserver extends originalResizeObserver {
            constructor(callback) {
              super(function(...args) {
                try {
                  callback.apply(this, args);
                } catch (e) {
                  // Ignore ResizeObserver errors
                }
              });
            }
            
            observe(...args) {
              try {
                return super.observe(...args);
              } catch (e) {
                // Ignore ResizeObserver errors
                console.warn('ResizeObserver error suppressed', e);
              }
            }
            
            unobserve(...args) {
              try {
                return super.unobserve(...args);
              } catch (e) {
                console.warn('ResizeObserver error suppressed', e);
              }
            }
          };
          
          // Suppress console errors related to ResizeObserver
          const originalConsoleError = console.error;
          console.error = function(...args) {
            if (args[0] && typeof args[0] === 'string' && args[0].includes('ResizeObserver')) {
              return;
            }
            return originalConsoleError.apply(this, args);
          };
        </script>
      </head>`,
      );
      setOutput(outputWithErrorHandler);
    } catch (e) {
      console.error("Error updating preview:", e);
    }
  }, [html, css, js]);

  const handleRunCode = () => {
    updatePreview();
    try {
      const { toast: safeToast } = useToast();
      if (safeToast) {
        safeToast({
          title: "Code executed",
          description: "Your code has been run in the preview panel.",
          duration: 2000,
        });
      }
    } catch (e) {
      console.log("Code executed successfully");
    }
  };

  const handleSaveCode = () => {
    // Save to localStorage
    localStorage.setItem(
      "bolt-diy-code",
      JSON.stringify({
        html,
        css,
        js,
        autoRefresh,
        fontSize,
        editorTheme,
      }),
    );

    try {
      const { toast: safeToast } = useToast();
      if (safeToast) {
        safeToast({
          title: "Project saved",
          description: "Your project has been saved to your browser.",
          duration: 2000,
        });
      }
    } catch (e) {
      console.log("Project saved successfully");
    }
  };

  const handleShareCode = () => {
    // Create a shareable URL with encoded content
    const encoded = encodeProjectData(html, css, js);
    const url = `${window.location.origin}${window.location.pathname}?code=${encoded}`;
    setShareUrl(url);
    setShareDialogOpen(true);
  };

  const handleExport = () => {
    exportAsHtmlFile(html, css, js, "bolt-diy-project.html");
    try {
      const { toast: safeToast } = useToast();
      if (safeToast) {
        safeToast({
          title: "Project exported",
          description: "Your project has been exported as an HTML file.",
          duration: 2000,
        });
      }
    } catch (e) {
      console.log("Project exported successfully");
    }
  };

  const handleExportZip = () => {
    exportAsZip(html, css, js, "bolt-diy-project")
      .then(() => {
        try {
          const { toast: safeToast } = useToast();
          if (safeToast) {
            safeToast({
              title: "Project exported",
              description:
                "Your project has been exported as separate files in a ZIP archive.",
              duration: 2000,
            });
          }
        } catch (e) {
          console.log("Project exported as ZIP successfully");
        }
      })
      .catch((error) => {
        console.error("Error exporting as ZIP:", error);
        try {
          const { toast: safeToast } = useToast();
          if (safeToast) {
            safeToast({
              title: "Export failed",
              description:
                "Failed to export as ZIP. Please try again or use HTML export instead.",
              variant: "destructive",
              duration: 3000,
            });
          }
        } catch (e) {
          console.log("Export as ZIP failed");
        }
      });
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      {showWelcome ? (
        <WelcomeScreen
          onNewProject={() => setShowWelcome(false)}
          onOpenTemplate={() => {
            setShowWelcome(false);
            // Delay to ensure the template dialog component is mounted
            setTimeout(() => {
              if (templateDialogRef.current) {
                templateDialogRef.current.openDialog();
              }
            }, 100);
          }}
        />
      ) : showDashboard ? (
        <Dashboard
          onNewProject={() => setShowDashboard(false)}
          onOpenTemplate={() => {
            setShowDashboard(false);
            // Delay to ensure the template dialog component is mounted
            setTimeout(() => {
              if (templateDialogRef.current) {
                templateDialogRef.current.openDialog();
              }
            }, 100);
          }}
          onLoadProject={({
            id,
            html: newHtml,
            css: newCss,
            js: newJs,
            name,
            user_id,
          }) => {
            setHtml(newHtml);
            setCss(newCss);
            setJs(newJs);
            setCurrentProjectId(id);
            setCurrentProjectName(name);
            setShowDashboard(false);
            updatePreview();

            // Check if current user is the project owner
            const checkOwnership = async () => {
              try {
                const { data } = await supabase.auth.getUser();
                setIsProjectOwner(data?.user?.id === user_id);
              } catch (e) {
                console.error("Error checking project ownership:", e);
                setIsProjectOwner(false);
              }
            };

            if (id && user_id) {
              checkOwnership();
            }

            try {
              const { toast: safeToast } = useToast();
              if (safeToast) {
                safeToast({
                  title: "Project loaded",
                  description: name
                    ? `Project "${name}" has been loaded successfully`
                    : "Project has been loaded successfully",
                  duration: 2000,
                });
              }
            } catch (e) {
              console.log("Project loaded successfully");
            }
          }}
        />
      ) : (
        <>
          <ShareDialog
            open={shareDialogOpen}
            onOpenChange={setShareDialogOpen}
            shareUrl={shareUrl}
          />
          {/* Toolbar */}
          <Toolbar
            onRun={handleRunCode}
            onSave={handleSaveCode}
            onShare={handleShareCode}
            onExport={handleExport}
            onExportZip={handleExportZip}
            html={html}
            css={css}
            js={js}
            onLoadProject={({
              id,
              html: newHtml,
              css: newCss,
              js: newJs,
              name,
              user_id,
            }) => {
              setHtml(newHtml);
              setCss(newCss);
              setJs(newJs);
              setCurrentProjectId(id);
              setCurrentProjectName(name);
              updatePreview();

              // Check if current user is the project owner
              const checkOwnership = async () => {
                try {
                  const { data } = await supabase.auth.getUser();
                  setIsProjectOwner(data?.user?.id === user_id);
                } catch (e) {
                  console.error("Error checking project ownership:", e);
                  setIsProjectOwner(false);
                }
              };

              if (id && user_id) {
                checkOwnership();
              }

              try {
                const { toast: safeToast } = useToast();
                if (safeToast) {
                  safeToast({
                    title: "Project loaded",
                    description: name
                      ? `Project "${name}" has been loaded successfully`
                      : "Project has been loaded successfully",
                    duration: 2000,
                  });
                }
              } catch (e) {
                console.log("Project loaded successfully");
              }
            }}
            onShowDashboard={() => setShowDashboard(true)}
            currentProjectId={currentProjectId}
            currentProjectName={currentProjectName}
            isProjectOwner={isProjectOwner}
            autoRefresh={autoRefresh}
            onAutoRefreshChange={setAutoRefresh}
            fontSize={fontSize}
            onFontSizeChange={setFontSize}
            editorTheme={editorTheme}
            onEditorThemeChange={setEditorTheme}
            templateDialogRef={templateDialogRef}
            onSelectTemplate={(template) => {
              setHtml(template.html);
              setCss(template.css);
              setJs(template.js);
              // Use a safer way to show toast
              setTimeout(() => {
                try {
                  const { toast: safeToast } = useToast();
                  if (safeToast) {
                    safeToast({
                      title: "Template applied",
                      description:
                        "The template has been loaded into the editor.",
                      duration: 2000,
                    });
                  }
                } catch (e) {
                  console.log("Template applied successfully");
                }
              }, 0);
              updatePreview();
            }}
          />

          {/* Main content */}
          <ResizablePanelGroup direction="horizontal" className="flex-1">
            {/* File Explorer panel */}
            <ResizablePanel defaultSize={15} minSize={10} maxSize={25}>
              <FileExplorer
                onFileSelect={(file) => {
                  if (file.language === "html") {
                    setHtml(file.content);
                    setActiveTab("html");
                  } else if (file.language === "css") {
                    setCss(file.content);
                    setActiveTab("css");
                  } else if (file.language === "javascript") {
                    setJs(file.content);
                    setActiveTab("js");
                  }
                }}
              />
            </ResizablePanel>

            <ResizableHandle withHandle />

            {/* Code editor panel */}
            <ResizablePanel defaultSize={40} minSize={30}>
              <div className="h-full flex flex-col">
                <Tabs
                  value={activeTab}
                  onValueChange={setActiveTab}
                  className="flex-1 flex flex-col"
                >
                  <TabsList className="grid grid-cols-3 w-full">
                    <TabsTrigger value="html" className="flex items-center">
                      <FileText className="h-4 w-4 mr-1" /> HTML
                    </TabsTrigger>
                    <TabsTrigger value="css" className="flex items-center">
                      <FileType2 className="h-4 w-4 mr-1" /> CSS
                    </TabsTrigger>
                    <TabsTrigger value="js" className="flex items-center">
                      <FileCode className="h-4 w-4 mr-1" /> JavaScript
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="html" className="flex-1 p-0">
                    <div className="h-full">
                      <MonacoEditor
                        language="html"
                        value={html}
                        onChange={setHtml}
                        theme={editorTheme}
                        fontSize={fontSize}
                      />
                    </div>
                  </TabsContent>
                  <TabsContent value="css" className="flex-1 p-0">
                    <div className="h-full">
                      <MonacoEditor
                        language="css"
                        value={css}
                        onChange={setCss}
                        theme={editorTheme}
                        fontSize={fontSize}
                      />
                    </div>
                  </TabsContent>
                  <TabsContent value="js" className="flex-1 p-0">
                    <div className="h-full">
                      <MonacoEditor
                        language="javascript"
                        value={js}
                        onChange={setJs}
                        theme={editorTheme}
                        fontSize={fontSize}
                      />
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </ResizablePanel>

            <ResizableHandle withHandle />

            {/* Preview panel */}
            <ResizablePanel defaultSize={45} minSize={30}>
              <div className="h-full flex flex-col">
                <div className="p-2 border-b bg-muted/30 flex justify-between items-center">
                  <span className="text-sm font-medium">Preview</span>
                </div>
                <div className="flex-1 bg-white">
                  <div className="w-full h-full overflow-hidden bg-white">
                    {output && (
                      <div className="w-full h-full" id="preview-container">
                        <iframe
                          title="preview"
                          srcDoc={output}
                          className="w-full h-full border-0"
                          sandbox="allow-scripts"
                          style={{ pointerEvents: "auto" }}
                          loading="lazy"
                          onLoad={(e) => {
                            try {
                              // Access iframe content and patch ResizeObserver
                              const iframe = e.currentTarget;
                              if (iframe.contentWindow) {
                                const doc =
                                  iframe.contentDocument ||
                                  iframe.contentWindow.document;
                                if (doc.readyState === "complete") {
                                  // Add a small delay to let any ResizeObservers initialize
                                  setTimeout(() => {}, 100);
                                }
                              }
                            } catch (err) {
                              // Ignore cross-origin errors
                            }
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </>
      )}
    </div>
  );
}
