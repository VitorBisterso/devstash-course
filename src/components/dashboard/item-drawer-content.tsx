"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Star, Pin, Pencil, Trash2, Copy, Check, Download, File } from "lucide-react";
import { CodeEditor } from "./code-editor";
import { MarkdownEditor } from "./markdown-editor";
import { formatFileSize } from "@/lib/format";
import type { ItemDetail } from "@/lib/db/items";

interface ItemDrawerActionsProps {
  item: ItemDetail;
  copied: boolean;
  deleteOpen: boolean;
  deleting: boolean;
  onFavorite: () => void;
  onPin: () => void;
  onCopy: () => void;
  onEdit: () => void;
  onDeleteOpenChange: (open: boolean) => void;
  onDelete: () => void;
}

export function ItemDrawerActions({
  item,
  copied,
  deleteOpen,
  deleting,
  onFavorite,
  onPin,
  onCopy,
  onEdit,
  onDeleteOpenChange,
  onDelete,
}: ItemDrawerActionsProps) {
  return (
    <div className="mt-4 flex items-center gap-2">
      <Button
        variant="ghost"
        size="sm"
        onClick={onFavorite}
        className={item.isFavorite ? "text-yellow-500" : "text-muted-foreground"}
      >
        <Star className={`h-4 w-4 ${item.isFavorite ? "fill-current" : ""}`} />
      </Button>
      <Button variant="ghost" size="sm" onClick={onPin}>
        <Pin
          className={`h-4 w-4 ${item.isPinned ? "fill-current text-foreground" : "text-muted-foreground"}`}
        />
      </Button>
      <Button variant="ghost" size="sm" onClick={onCopy}>
        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      </Button>
      <Button variant="ghost" size="sm" onClick={onEdit}>
        <Pencil className="h-4 w-4" />
      </Button>
      <div className="flex-1" />
      <AlertDialog open={deleteOpen} onOpenChange={onDeleteOpenChange}>
        <AlertDialogTrigger>
          <Button variant="ghost" size="sm">
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Item</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &ldquo;{item.title}&rdquo;? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={onDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

interface ItemDrawerContentProps {
  item: ItemDetail;
  isCodeType: boolean;
}

export function ItemDrawerContent({ item, isCodeType }: ItemDrawerContentProps) {
  return (
    <div className="mt-6 space-y-4">
      {item.url && (
        <div>
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline break-all"
          >
            {item.url}
          </a>
        </div>
      )}

      {item.content && (
        <div>
          {isCodeType ? (
            <CodeEditor
              value={item.content}
              readOnly
              language={item.language || "plaintext"}
            />
          ) : (
            <MarkdownEditor
              value={item.content}
              readOnly
            />
          )}
        </div>
      )}

      {item.fileUrl && (
        <FilePreview
          fileUrl={item.fileUrl}
          fileName={item.fileName}
          fileSize={item.fileSize}
        />
      )}

      {item.description && (
        <div>
          <p className="text-sm text-muted-foreground">{item.description}</p>
        </div>
      )}

      <TypeMeta typeName={item.type.name} language={item.language} />

      {item.collections.length > 0 && (
        <CollectionsList collections={item.collections} />
      )}

      {item.tags.length > 0 && (
        <TagsList tags={item.tags} />
      )}

      <Timestamps createdAt={item.createdAt} updatedAt={item.updatedAt} />
    </div>
  );
}

interface FilePreviewProps {
  fileUrl: string;
  fileName?: string | null;
  fileSize?: number | null;
}

export function FilePreview({ fileUrl, fileName, fileSize }: FilePreviewProps) {
  const isImage = fileName?.match(/\.(png|jpg|jpeg|gif|webp|svg)$/i);

  if (isImage) {
    return (
      <div>
        <div className="relative h-64 w-full rounded-md overflow-hidden bg-muted">
          <Image
            src={fileUrl}
            alt={fileName || "Image"}
            fill
            className="object-contain"
            unoptimized
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 rounded-md bg-muted p-4">
      <File className="h-8 w-8 text-muted-foreground" />
      <div className="flex-1 min-w-0">
        <p className="truncate text-sm font-medium">{fileName}</p>
        <p className="text-xs text-muted-foreground">
          {fileSize ? formatFileSize(fileSize) : "File"}
        </p>
      </div>
      <a
        href={`/api/download?key=${encodeURIComponent(fileUrl)}`}
        download={fileName}
        className="flex items-center gap-1 rounded-md bg-primary px-3 py-1.5 text-xs text-primary-foreground hover:bg-primary/90"
      >
        <Download className="h-3 w-3" />
        Download
      </a>
    </div>
  );
}

interface TypeMetaProps {
  typeName: string;
  language?: string | null;
}

function TypeMeta({ typeName, language }: TypeMetaProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <span className="text-xs text-muted-foreground">
        {typeName}
        {language && ` · ${language}`}
      </span>
    </div>
  );
}

interface CollectionsListProps {
  collections: Array<{ id: string; name: string }>;
}

function CollectionsList({ collections }: CollectionsListProps) {
  return (
    <div>
      <p className="text-xs font-medium text-muted-foreground mb-1">Collections</p>
      <div className="flex flex-wrap gap-1">
        {collections.map((col) => (
          <span
            key={col.id}
            className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs"
          >
            {col.name}
          </span>
        ))}
      </div>
    </div>
  );
}

interface TagsListProps {
  tags: string[];
}

function TagsList({ tags }: TagsListProps) {
  return (
    <div>
      <p className="text-xs font-medium text-muted-foreground mb-1">Tags</p>
      <div className="flex flex-wrap gap-1">
        {tags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center rounded-full bg-secondary px-2 py-0.5 text-xs"
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}

interface TimestampsProps {
  createdAt: Date;
  updatedAt: Date;
}

function Timestamps({ createdAt, updatedAt }: TimestampsProps) {
  return (
    <div className="text-xs text-muted-foreground">
      <p>Created: {new Date(createdAt).toLocaleString()}</p>
      <p>Updated: {new Date(updatedAt).toLocaleString()}</p>
    </div>
  );
}
