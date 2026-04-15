"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Upload, File, Image as ImageIcon, X, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { formatFileSize } from "@/lib/format";

interface FileUploadProps {
  type: "image" | "file";
  onFileUploaded: (data: {
    url: string;
    fileName: string;
    fileSize: number;
    contentType: string;
  }) => void;
  value?: string;
}

interface UploadData {
  url: string;
  fileName: string;
  fileSize: number;
  contentType: string;
}

const IMAGE_EXTENSIONS = [".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg"];
const FILE_EXTENSIONS = [
  ".pdf",
  ".txt",
  ".md",
  ".json",
  ".yaml",
  ".yml",
  ".xml",
  ".csv",
  ".toml",
  ".ini",
];

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export function FileUpload({ type, onFileUploaded, value }: FileUploadProps) {
  const [uploadData, setUploadData] = useState<UploadData | null>(
    value
      ? {
          url: value,
          fileName: "",
          fileSize: 0,
          contentType: "",
        }
      : null
  );
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const maxSize = type === "image" ? MAX_IMAGE_SIZE : MAX_FILE_SIZE;
  const extensions = type === "image" ? IMAGE_EXTENSIONS : FILE_EXTENSIONS;
  const allowedTypes =
    type === "image"
      ? ["image/png", "image/jpeg", "image/gif", "image/webp", "image/svg+xml"]
      : [
          "application/pdf",
          "text/plain",
          "text/markdown",
          "application/json",
          "application/x-yaml",
          "text/yaml",
          "application/xml",
          "text/xml",
          "text/csv",
          "application/toml",
        ];

  const handleFileSelect = async (file: File) => {
    if (file.size > maxSize) {
      toast.error(`File too large. Maximum size is ${maxSize / 1024 / 1024}MB`);
      return;
    }

    const ext = "." + file.name.split(".").pop()?.toLowerCase();
    const validExt = extensions.includes(ext);
    const validType = allowedTypes.includes(file.type.toLowerCase());

    if (!validExt || !validType) {
      toast.error("Invalid file type");
      return;
    }

    setIsUploading(true);
    setProgress(20);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", type);

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      setProgress(80);

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || "Upload failed");
      }

      const data = await response.json();
      setProgress(100);
      setUploadData(data);
      onFileUploaded(data);
      toast.success("File uploaded successfully");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload file");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleRemove = () => {
    setUploadData(null);
  };

  const isImage = (contentType: string): boolean => {
    return contentType.startsWith("image/");
  };

  if (uploadData) {
    return (
      <div className="relative rounded-md border bg-card p-4">
        {isImage(uploadData.contentType) ? (
          <div className="relative aspect-video max-h-48 overflow-hidden rounded bg-muted">
            <Image
              src={uploadData.url}
              alt={uploadData.fileName}
              fill
              className="object-contain"
              unoptimized
            />
          </div>
        ) : (
          <div className="flex items-center gap-3 rounded bg-muted p-4">
            <File className="h-8 w-8 text-muted-foreground" />
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm font-medium">{uploadData.fileName}</p>
              <p className="text-xs text-muted-foreground">
                {formatFileSize(uploadData.fileSize)}
              </p>
            </div>
            <CheckCircle className="h-5 w-5 text-green-500" />
          </div>
        )}
        <button
          type="button"
          onClick={handleRemove}
          className="absolute right-2 top-2 rounded-full bg-background p-1 shadow hover:bg-muted"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <div>
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => inputRef.current?.click()}
        className={`
          relative cursor-pointer rounded-md border-2 border-dashed p-6 text-center transition-colors
          ${
            isDragOver
              ? "border-primary bg-primary/5"
              : "border-border hover:border-muted-foreground"
          }
        `}
      >
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          onChange={handleInputChange}
          accept={extensions.join(",")}
        />
        {isUploading ? (
          <div className="flex flex-col items-center gap-2">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <p className="text-sm text-muted-foreground">Uploading... {progress}%</p>
            <div className="h-1 w-full rounded-full bg-muted">
              <div
                className="h-1 rounded-full bg-primary transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            {type === "image" ? (
              <ImageIcon className="h-8 w-8 text-muted-foreground" />
            ) : (
              <Upload className="h-8 w-8 text-muted-foreground" />
            )}
            <p className="text-sm font-medium">
              Drag and drop or click to upload
            </p>
            <p className="text-xs text-muted-foreground">
              {type === "image" ? "PNG, JPG, GIF, WebP, SVG" : "PDF, TXT, MD, JSON, YAML..."}
              {" "}(max {maxSize / 1024 / 1024}MB)
            </p>
          </div>
        )}
      </div>
    </div>
  );
}