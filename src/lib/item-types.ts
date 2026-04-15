export const TYPE_SPECIFIC_FIELDS: Record<string, "content" | "url" | "none"> = {
  snippet: "content",
  prompt: "content",
  command: "content",
  note: "content",
  link: "url",
  file: "none",
  image: "none",
};

export function getTypeField(typeName: string): "content" | "url" | "none" {
  return TYPE_SPECIFIC_FIELDS[typeName.toLowerCase()] ?? "none";
}

export function isContentType(typeName: string): boolean {
  return ["snippet", "command", "prompt", "note"].includes(typeName.toLowerCase());
}

export function isCodeType(typeName: string): boolean {
  return ["snippet", "command"].includes(typeName.toLowerCase());
}

export function isMarkdownType(typeName: string): boolean {
  return ["note", "prompt"].includes(typeName.toLowerCase());
}
