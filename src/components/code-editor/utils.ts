/**
 * Utility functions for the code editor
 */

/**
 * Combines HTML, CSS, and JS into a single HTML document
 */
export function combineCode(html: string, css: string, js: string): string {
  // Insert CSS into the head
  let result = html;

  // If there's a </head> tag, insert CSS before it
  if (result.includes("</head>")) {
    result = result.replace("</head>", `<style>${css}</style></head>`);
  }
  // If no head tag, create one
  else if (result.includes("<html>")) {
    result = result.replace(
      "<html>",
      `<html><head><style>${css}</style></head>`,
    );
  }
  // If no html tag, wrap everything
  else {
    result = `<!DOCTYPE html><html><head><style>${css}</style></head><body>${result}</body></html>`;
  }

  // Insert JS before closing body tag
  if (result.includes("</body>")) {
    result = result.replace("</body>", `<script>${js}</script></body>`);
  } else {
    // If no body closing tag, append script at the end
    result += `<script>${js}</script>`;
  }

  return result;
}

/**
 * Encodes project data for sharing
 */
export function encodeProjectData(
  html: string,
  css: string,
  js: string,
): string {
  const data = { html, css, js };
  return btoa(JSON.stringify(data));
}

/**
 * Decodes project data from a shared URL
 */
export function decodeProjectData(encoded: string): {
  html: string;
  css: string;
  js: string;
} {
  try {
    const decoded = atob(encoded);
    return JSON.parse(decoded);
  } catch (e) {
    console.error("Failed to decode project data:", e);
    return {
      html: "",
      css: "",
      js: "",
    };
  }
}

/**
 * Exports the current project as an HTML file for download
 */
export function exportAsHtmlFile(
  html: string,
  css: string,
  js: string,
  filename = "project.html",
): void {
  const combinedCode = combineCode(html, css, js);

  const blob = new Blob([combinedCode], { type: "text/html" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();

  URL.revokeObjectURL(url);
}

/**
 * Exports the current project as separate files in a zip archive
 */
export function exportAsZip(
  html: string,
  css: string,
  js: string,
  projectName = "bolt-diy-project",
): Promise<void> {
  // This function requires JSZip library
  // We'll use a dynamic import to avoid adding it as a dependency if not used
  return import("jszip").then(({ default: JSZip }) => {
    const zip = new JSZip();

    // Add files to the zip
    zip.file("index.html", html);
    zip.file("styles.css", css);
    zip.file("script.js", js);

    // Generate the zip file
    return zip.generateAsync({ type: "blob" }).then((content) => {
      // Create a download link
      const url = URL.createObjectURL(content);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${projectName}.zip`;
      a.click();

      URL.revokeObjectURL(url);
    });
  });
}
