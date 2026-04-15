"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CodeEditor } from "./code-editor";
import { MarkdownEditor } from "./markdown-editor";
import { FileUpload } from "./file-upload";
import { isContentType, isCodeType } from "@/lib/item-types";

interface ContentEditorProps {
  typeName: string;
  content: string;
  language: string;
  onContentChange: (value: string) => void;
  onLanguageChange: (value: string) => void;
}

export function ContentEditor({
  typeName,
  content,
  language,
  onContentChange,
  onLanguageChange,
}: ContentEditorProps) {
  if (!isContentType(typeName)) {
    return null;
  }

  return (
    <>
      <div className="grid grid-cols-4 items-start gap-4">
        <Label htmlFor="content" className="text-right pt-2">
          Content
        </Label>
        <div className="col-span-3">
          {isCodeType(typeName) ? (
            <CodeEditor
              value={content}
              onChange={onContentChange}
              language={language || "plaintext"}
            />
          ) : (
            <MarkdownEditor
              value={content}
              onChange={onContentChange}
            />
          )}
        </div>
      </div>

      {isCodeType(typeName) && (
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="language" className="text-right">
            Language
          </Label>
          <Input
            id="language"
            value={language}
            onChange={(e) => onLanguageChange(e.target.value)}
            className="col-span-3"
            placeholder="e.g., javascript, python, go"
          />
        </div>
      )}
    </>
  );
}

interface FileFieldProps {
  typeName: "file" | "image";
  fileData: {
    url: string;
    fileName: string;
    fileSize: number;
    contentType: string;
  } | null;
  onFileUploaded: (data: {
    url: string;
    fileName: string;
    fileSize: number;
    contentType: string;
  } | null) => void;
}

export function FileField({
  typeName,
  fileData,
  onFileUploaded,
}: FileFieldProps) {
  return (
    <div className="grid grid-cols-4 items-start gap-4">
      <Label className="text-right pt-2">File</Label>
      <div className="col-span-3">
        <FileUpload
          type={typeName}
          onFileUploaded={onFileUploaded}
          value={fileData?.url}
        />
      </div>
    </div>
  );
}

interface UrlFieldProps {
  url: string;
  onChange: (value: string) => void;
  required?: boolean;
}

export function UrlField({ url, onChange, required }: UrlFieldProps) {
  return (
    <div className="grid grid-cols-4 items-center gap-4">
      <Label htmlFor="url" className="text-right">
        URL
      </Label>
      <Input
        id="url"
        type="url"
        value={url}
        onChange={(e) => onChange(e.target.value)}
        className="col-span-3"
        placeholder="https://example.com"
        required={required}
      />
    </div>
  );
}
