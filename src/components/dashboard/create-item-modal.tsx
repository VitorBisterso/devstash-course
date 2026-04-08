"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createItem, getItemTypes } from "@/actions/items";
import { typeDisplayNames } from "@/lib/constants";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { CodeEditor } from "./code-editor";

interface SystemItemType {
  id: string;
  name: string;
  icon: string | null;
  color: string | null;
}

interface CreateItemModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateItemModal({ open, onOpenChange }: CreateItemModalProps) {
  const router = useRouter();
  const [itemTypes, setItemTypes] = useState<SystemItemType[]>([]);
  const [selectedType, setSelectedType] = useState<string>("");
  const [selectedTypeName, setSelectedTypeName] = useState<string>("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [language, setLanguage] = useState("");
  const [url, setUrl] = useState("");
  const [tags, setTags] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open && itemTypes.length === 0) {
      getItemTypes().then(setItemTypes);
    }
  }, [open, itemTypes.length]);

  const resetForm = () => {
    setSelectedType("");
    setSelectedTypeName("");
    setTitle("");
    setDescription("");
    setContent("");
    setLanguage("");
    setUrl("");
    setTags("");
  };

  const handleClose = (isOpen: boolean) => {
    if (!isOpen) {
      resetForm();
    }
    onOpenChange(isOpen);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedType) {
      toast.error("Please select an item type");
      return;
    }

    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }

    const selectedTypeData = itemTypes.find((t) => t.id === selectedType);
    const isLinkType = selectedTypeData?.name.toLowerCase() === "link";

    if (isLinkType && !url.trim()) {
      toast.error("URL is required for links");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await createItem({
        title: title.trim(),
        description: description.trim() || null,
        content: content.trim() || null,
        url: url.trim() || null,
        language: language.trim() || null,
        typeId: selectedType,
        tags: tags
          .split(",")
          .map((t) => t.trim())
          .filter((t) => t.length > 0),
      });

      if (result.success) {
        toast.success("Item created successfully");
        handleClose(false);
        router.refresh();
      } else {
        toast.error(result.error || "Failed to create item");
      }
    } catch {
      toast.error("Failed to create item");
    } finally {
      setIsSubmitting(false);
    }
  };

  const typeName = selectedTypeName.toLowerCase();
  const isContentType = ["snippet", "command", "prompt", "note"].includes(typeName);
  const isCodeType = ["snippet", "command"].includes(typeName);
  const isLinkType = typeName === "link";

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Item</DialogTitle>
          <DialogDescription>
            Add a new item to your collection.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="type" className="text-right">
                Type
              </Label>
                <Select
                value={selectedType}
                onValueChange={(value) => {
                  const type = itemTypes.find((t) => t.id === value);
                  setSelectedType(value || "");
                  setSelectedTypeName(type?.name || "");
                }}
                required
              >
                <SelectTrigger className="col-span-3">
                  {selectedType && selectedTypeName ? (
                    <div className="flex items-center gap-2">
                      {(() => {
                        const type = itemTypes.find((t) => t.id === selectedType);
                        return type?.color ? (
                          <span
                            className="h-3 w-3 rounded-full"
                            style={{ backgroundColor: type.color }}
                          />
                        ) : null;
                      })()}
                      {typeDisplayNames[selectedTypeName.toLowerCase()] || selectedTypeName}
                    </div>
                  ) : (
                    <SelectValue placeholder="Select type" />
                  )}
                </SelectTrigger>
                <SelectContent>
                  {itemTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      <div className="flex items-center gap-2">
                        {type.color && (
                          <span
                            className="h-3 w-3 rounded-full"
                            style={{ backgroundColor: type.color }}
                          />
                        )}
                        {typeDisplayNames[type.name.toLowerCase()] || type.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">
                Title
              </Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="col-span-3"
                placeholder="Enter title"
                required
              />
            </div>

            {isLinkType && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="url" className="text-right">
                  URL
                </Label>
                <Input
                  id="url"
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="col-span-3"
                  placeholder="https://example.com"
                  required={isLinkType}
                />
              </div>
            )}

            {isContentType && (
              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="content" className="text-right pt-2">
                  Content
                </Label>
                {isCodeType ? (
                  <div className="col-span-3">
                    <CodeEditor
                      value={content}
                      onChange={setContent}
                      language={language || "plaintext"}
                    />
                  </div>
                ) : (
                  <textarea
                    id="content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="col-span-3 min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="Enter content"
                  />
                )}
              </div>
            )}

            {isCodeType && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="language" className="text-right">
                  Language
                </Label>
                <Input
                  id="language"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="col-span-3"
                  placeholder="e.g., javascript, python, go"
                />
              </div>
            )}

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="col-span-3"
                placeholder="Optional description"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="tags" className="text-right">
                Tags
              </Label>
              <Input
                id="tags"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="col-span-3"
                placeholder="Comma-separated tags"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleClose(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !title.trim() || !selectedType}>
              {isSubmitting ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}