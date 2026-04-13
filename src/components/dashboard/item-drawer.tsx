"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
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
import { typeIcons, getIconWithColor } from "@/lib/constants";
import type { ItemDetail } from "@/lib/db/items";
import { updateItem } from "@/actions/items";
import { Star, Pin, Pencil, Trash2, Copy, Check, Loader2, Save, X, Download, File } from "lucide-react";
import { CodeEditor } from "./code-editor";
import { MarkdownEditor } from "./markdown-editor";
import { toast } from "sonner";

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

interface ItemDrawerProps {
  itemId: string | null;
  onClose: () => void;
}

interface EditFormData {
  title: string;
  description: string;
  content: string;
  url: string;
  language: string;
  tags: string;
}

const TYPE_SPECIFIC_FIELDS: Record<string, "content" | "url" | "none"> = {
  snippet: "content",
  prompt: "content",
  command: "content",
  note: "content",
  link: "url",
};

export function ItemDrawer({ itemId, onClose }: ItemDrawerProps) {
  const router = useRouter();
  const [item, setItem] = useState<ItemDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [formData, setFormData] = useState<EditFormData>({
    title: "",
    description: "",
    content: "",
    url: "",
    language: "",
    tags: "",
  });

  useEffect(() => {
    if (!itemId) {
      setItem(null);
      setEditMode(false);
      return;
    }

    const fetchItem = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/items/${itemId}`);
        if (res.ok) {
          const data = await res.json();
          setItem(data);
        }
      } catch (error) {
        console.error("Failed to fetch item:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchItem();
  }, [itemId]);

  useEffect(() => {
    if (item && editMode) {
      setFormData({
        title: item.title,
        description: item.description || "",
        content: item.content || "",
        url: item.url || "",
        language: item.language || "",
        tags: item.tags.join(", "),
      });
    }
  }, [item, editMode]);

  const handleCopy = async () => {
    if (!item?.content) return;
    await navigator.clipboard.writeText(item.content);
    setCopied(true);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDelete = async () => {
    if (!item) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/items/${item.id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Item deleted");
        setDeleteOpen(false);
        onClose();
        router.refresh();
      } else {
        toast.error("Failed to delete item");
      }
    } catch {
      toast.error("Failed to delete item");
    } finally {
      setDeleting(false);
    }
  };

  const handleFavorite = async () => {
    if (!item) return;
    const res = await fetch(`/api/items/${item.id}`, {
      method: "PATCH",
      body: JSON.stringify({ isFavorite: !item.isFavorite }),
    });
    if (res.ok) {
      setItem({ ...item, isFavorite: !item.isFavorite });
      toast.success(item.isFavorite ? "Removed from favorites" : "Added to favorites");
    }
  };

  const handlePin = async () => {
    if (!item) return;
    const res = await fetch(`/api/items/${item.id}`, {
      method: "PATCH",
      body: JSON.stringify({ isPinned: !item.isPinned }),
    });
    if (res.ok) {
      setItem({ ...item, isPinned: !item.isPinned });
      toast.success(item.isPinned ? "Unpinned" : "Pinned");
    }
  };

  const handleEditClick = () => {
    setEditMode(true);
  };

  const handleCancelEdit = () => {
    setEditMode(false);
  };

  const handleSave = async () => {
    if (!item || !formData.title.trim()) return;

    setSaving(true);
    try {
      const tags = formData.tags
        .split(",")
        .map((t) => t.trim())
        .filter((t) => t.length > 0);

      const result = await updateItem(item.id, {
        title: formData.title.trim(),
        description: formData.description || null,
        content: TYPE_SPECIFIC_FIELDS[item.type.name.toLowerCase()] === "content"
          ? (formData.content || null)
          : null,
        url: TYPE_SPECIFIC_FIELDS[item.type.name.toLowerCase()] === "url"
          ? (formData.url || null)
          : null,
        language: ["snippet", "command"].includes(item.type.name.toLowerCase())
          ? (formData.language || null)
          : null,
        tags,
      });

      if (result.success && result.data) {
        setItem(result.data);
        setEditMode(false);
        toast.success("Item updated");
        router.refresh();
      } else {
        toast.error(result.error || "Failed to update item");
      }
    } catch {
      toast.error("Failed to update item");
    } finally {
      setSaving(false);
    }
  };

  const typeSpecificField = item
    ? TYPE_SPECIFIC_FIELDS[item.type.name.toLowerCase()] || "none"
    : "none";

  return (
    <Sheet open={!!itemId} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-xl overflow-y-auto p-6">
        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-32 w-full" />
          </div>
        ) : item ? (
          <>
            <SheetHeader className="relative">
              {editMode ? (
                <div className="space-y-4 pr-10">
                  <div>
                    <Label htmlFor="edit-title" className="mb-1 block">Title</Label>
                    <Input
                      id="edit-title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Item title"
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-description" className="mb-1 block">Description</Label>
                    <textarea
                      id="edit-description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Optional description"
                      className="w-full min-h-[60px] rounded-lg border border-input bg-transparent px-3 py-2 text-sm transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 resize-none"
                    />
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-3 pr-10">
                  <span className="flex-shrink-0 mt-1">
                    {getIconWithColor(
                      typeIcons[item.type.name.toLowerCase()] || typeIcons.snippet,
                      item.type.color
                    )}
                  </span>
                  <SheetTitle className="text-xl">{item.title}</SheetTitle>
                </div>
              )}
            </SheetHeader>

            {editMode ? (
              <div className="mt-4 space-y-4">
                <div>
                  <Label htmlFor="edit-tags" className="mb-1 block">Tags</Label>
                  <Input
                    id="edit-tags"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    placeholder="Comma-separated tags"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Separate tags with commas
                  </p>
                </div>

                {typeSpecificField === "content" && (
                  <div>
                    <Label htmlFor="edit-content" className="mb-1 block">Content</Label>
                    {["snippet", "command"].includes(item.type.name.toLowerCase()) ? (
                      <CodeEditor
                        value={formData.content}
                        onChange={(val) => setFormData({ ...formData, content: val })}
                        language={item.type.name.toLowerCase() === "snippet" || item.type.name.toLowerCase() === "command" ? formData.language || "plaintext" : "plaintext"}
                      />
                    ) : (
                      <MarkdownEditor
                        value={formData.content}
                        onChange={(val) => setFormData({ ...formData, content: val })}
                      />
                    )}
                  </div>
                )}

                {typeSpecificField === "content" && ["snippet", "command"].includes(item.type.name.toLowerCase()) && (
                  <div>
                    <Label htmlFor="edit-language" className="mb-1 block">Language</Label>
                    <Input
                      id="edit-language"
                      value={formData.language}
                      onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                      placeholder="e.g., javascript, python"
                    />
                  </div>
                )}

                {typeSpecificField === "url" && (
                  <div>
                    <Label htmlFor="edit-url" className="mb-1 block">URL</Label>
                    <Input
                      id="edit-url"
                      type="url"
                      value={formData.url}
                      onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                      placeholder="https://example.com"
                    />
                  </div>
                )}

                <div className="flex items-center gap-2 pt-2">
                  <span className="text-xs text-muted-foreground">
                    {item.type.name}
                  </span>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    variant="default"
                    size="sm"
                    onClick={handleSave}
                    disabled={saving || !formData.title.trim()}
                  >
                    {saving ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    <span className="ml-1">Save</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCancelEdit}
                    disabled={saving}
                  >
                    <X className="h-4 w-4" />
                    <span className="ml-1">Cancel</span>
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div className="mt-4 flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleFavorite}
                    className={item.isFavorite ? "text-yellow-500" : "text-muted-foreground"}
                  >
                    <Star className={`h-4 w-4 ${item.isFavorite ? "fill-current" : ""}`} />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={handlePin}>
                    <Pin
                      className={`h-4 w-4 ${item.isPinned ? "fill-current text-foreground" : "text-muted-foreground"}`}
                    />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={handleCopy}>
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={handleEditClick}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <div className="flex-1" />
                  <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
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
                          onClick={handleDelete}
                          disabled={deleting}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          {deleting ? "Deleting..." : "Delete"}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>

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
                      {["snippet", "command"].includes(item.type.name.toLowerCase()) ? (
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
                    <div>
                      {item.fileName?.match(/\.(png|jpg|jpeg|gif|webp|svg)$/i) ? (
                        <div className="relative rounded-md overflow-hidden bg-muted">
                          <img
                            src={item.fileUrl}
                            alt={item.fileName || "Image"}
                            className="max-h-64 w-full object-contain"
                          />
                        </div>
                      ) : (
                        <div className="flex items-center gap-3 rounded-md bg-muted p-4">
                          <File className="h-8 w-8 text-muted-foreground" />
                          <div className="flex-1 min-w-0">
                            <p className="truncate text-sm font-medium">{item.fileName}</p>
                            <p className="text-xs text-muted-foreground">
                              {item.fileSize ? formatFileSize(item.fileSize) : "File"}
                            </p>
                          </div>
                          <a
                            href={`/api/download?key=${encodeURIComponent(item.fileUrl)}`}
                            download={item.fileName}
                            className="flex items-center gap-1 rounded-md bg-primary px-3 py-1.5 text-xs text-primary-foreground hover:bg-primary/90"
                          >
                            <Download className="h-3 w-3" />
                            Download
                          </a>
                        </div>
                      )}
                    </div>
                  )}

                  {item.description && (
                    <div>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2">
                    <span className="text-xs text-muted-foreground">
                      {item.type.name}
                      {item.language && ` · ${item.language}`}
                    </span>
                  </div>

                  {item.collections.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">Collections</p>
                      <div className="flex flex-wrap gap-1">
                        {item.collections.map((col) => (
                          <span
                            key={col.id}
                            className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs"
                          >
                            {col.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {item.tags.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">Tags</p>
                      <div className="flex flex-wrap gap-1">
                        {item.tags.map((tag) => (
                          <span
                            key={tag}
                            className="inline-flex items-center rounded-full bg-secondary px-2 py-0.5 text-xs"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="text-xs text-muted-foreground">
                    <p>Created: {new Date(item.createdAt).toLocaleString()}</p>
                    <p>Updated: {new Date(item.updatedAt).toLocaleString()}</p>
                  </div>
                </div>
              </>
            )}
          </>
        ) : (
          <div className="p-4 text-center text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
            <p>Loading...</p>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
