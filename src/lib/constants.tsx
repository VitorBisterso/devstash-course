import {
  Code2,
  Bot,
  FileText,
  Terminal,
  FileCode,
  Image as ImageIcon,
  Link2,
} from "lucide-react";

export const MINUTE_MS = 60 * 1000;
export const HOUR_MS = 60 * MINUTE_MS;
export const DAY_MS = 24 * HOUR_MS;

export const typeIcons: Record<string, React.ReactNode> = {
  snippet: <Code2 className="h-4 w-4" />,
  prompt: <Bot className="h-4 w-4" />,
  note: <FileText className="h-4 w-4" />,
  command: <Terminal className="h-4 w-4" />,
  file: <FileCode className="h-4 w-4" />,
  image: <ImageIcon className="h-4 w-4" />,
  link: <Link2 className="h-4 w-4" />,
};

export const typeIconsSmall: Record<string, React.ReactNode> = {
  snippet: <Code2 className="h-3 w-3" />,
  prompt: <Bot className="h-3 w-3" />,
  note: <FileText className="h-3 w-3" />,
  command: <Terminal className="h-3 w-3" />,
  file: <FileCode className="h-3 w-3" />,
  image: <ImageIcon className="h-3 w-3" />,
  link: <Link2 className="h-3 w-3" />,
};

export const typeDisplayNames: Record<string, string> = {
  snippet: "Snippets",
  prompt: "Prompts",
  command: "Commands",
  note: "Notes",
  file: "Files",
  image: "Images",
  link: "Links",
};

export const typeOrder = ["snippet", "prompt", "command", "note", "file", "image", "link"];

export function getIconWithColor(icon: React.ReactNode, color: string | null) {
  if (!color) return icon;
  return <span style={{ color }}>{icon}</span>;
}
