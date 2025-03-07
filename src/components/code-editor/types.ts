export interface CodeFile {
  name: string;
  language: string;
  content: string;
}

export interface Project {
  id?: string;
  name: string;
  files: CodeFile[];
  createdAt?: string;
  updatedAt?: string;
}

export interface EditorState {
  html: string;
  css: string;
  js: string;
  autoRefresh: boolean;
  fontSize?: number;
  editorTheme?: string;
}
