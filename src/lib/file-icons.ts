export function getFileExtension(filename: string): string {
  const parts = filename.split(".");
  return parts.length > 1 ? parts.pop()?.toLowerCase() ?? "" : "";
}

interface FileIconConfig {
  name: string;
  color: string;
}

const FILE_ICON_MAP: Record<string, FileIconConfig> = {
  pdf: { name: "PDF", color: "#e53935" },
  doc: { name: "DOC", color: "#2196f3" },
  docx: { name: "DOC", color: "#2196f3" },
  xls: { name: "XLS", color: "#4caf50" },
  xlsx: { name: "XLS", color: "#4caf50" },
  ppt: { name: "PPT", color: "#ff9800" },
  pptx: { name: "PPT", color: "#ff9800" },
  zip: { name: "ZIP", color: "#9c27b0" },
  rar: { name: "RAR", color: "#9c27b0" },
  txt: { name: "TXT", color: "#607d8b" },
  csv: { name: "CSV", color: "#4caf50" },
  json: { name: "JSON", color: "#ff9800" },
  xml: { name: "XML", color: "#ff9800" },
  html: { name: "HTML", color: "#e44d26" },
  css: { name: "CSS", color: "#264de4" },
  js: { name: "JS", color: "#f7df1e" },
  ts: { name: "TS", color: "#3178c6" },
  py: { name: "PY", color: "#3776ab" },
};

const DEFAULT_FILE_ICON: FileIconConfig = { name: "FILE", color: "#607d8b" };

export function getFileIconConfig(filename: string): FileIconConfig {
  const ext = getFileExtension(filename);
  return FILE_ICON_MAP[ext] ?? DEFAULT_FILE_ICON;
}
