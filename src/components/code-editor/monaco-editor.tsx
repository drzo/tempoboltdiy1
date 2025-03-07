import { useRef, useState } from "react";
import Editor, { Monaco } from "@monaco-editor/react";
import { editor } from "monaco-editor";
import EditorLoading from "./loading";
import ErrorDisplay from "./error";

interface MonacoEditorProps {
  language: string;
  value: string;
  onChange: (value: string) => void;
  theme?: string;
  fontSize?: number;
}

export default function MonacoEditor(props: MonacoEditorProps) {
  const { language, value, onChange, theme = "vs-dark", fontSize = 14 } = props;
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleEditorDidMount = (
    editor: editor.IStandaloneCodeEditor,
    monaco: Monaco,
  ) => {
    editorRef.current = editor;
    setIsLoading(false);

    // Set editor options
    editor.updateOptions({
      fontSize: props.fontSize || 14,
      fontFamily: '"Fira Code", Menlo, Monaco, "Courier New", monospace',
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      automaticLayout: true,
      tabSize: 2,
      wordWrap: "on",
    });

    // Add keyboard shortcuts
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      // Trigger save action
      const saveEvent = new CustomEvent("editor-save");
      window.dispatchEvent(saveEvent);
    });
  };

  const handleEditorError = (error: Error) => {
    console.error("Monaco editor error:", error);
    setError(
      "Failed to load the code editor. Please refresh the page and try again.",
    );
    setIsLoading(false);
  };

  if (error) {
    return (
      <ErrorDisplay message={error} onRetry={() => window.location.reload()} />
    );
  }

  return (
    <>
      {isLoading && <EditorLoading />}
      <Editor
        height="100%"
        language={language}
        value={value}
        theme={theme}
        onChange={(value) => onChange(value || "")}
        onMount={handleEditorDidMount}
        loading={<EditorLoading />}
        onError={handleEditorError}
        options={{
          readOnly: false,
          domReadOnly: false,
          cursorStyle: "line",
          lineNumbers: "on",
          renderLineHighlight: "all",
          formatOnPaste: true,
          formatOnType: true,
          autoIndent: "full",
        }}
      />
    </>
  );
}
