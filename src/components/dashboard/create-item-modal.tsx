"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createItem, getItemTypes } from "@/actions/items";
import { getCollections } from "@/actions/collections";
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Check, ChevronsUpDown } from "lucide-react";
import { Command, CommandEmpty, CommandGroup, CommandItem } from "@/components/ui/command";
import { toast } from "sonner";
import { ItemTypeSelect } from "./item-type-select";
import { ContentEditor, FileField, UrlField } from "./item-form-fields";

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

interface FileData {
  url: string;
  fileName: string;
  fileSize: number;
  contentType: string;
}

export function CreateItemModal({ open, onOpenChange }: CreateItemModalProps) {
  const router = useRouter();
  const [itemTypes, setItemTypes] = useState<SystemItemType[]>([]);
  const [collections, setCollections] = useState<{ id: string; name: string }[]>([]);
  const [selectedType, setSelectedType] = useState<string>("");
  const [selectedTypeName, setSelectedTypeName] = useState<string>("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [language, setLanguage] = useState("");
  const [url, setUrl] = useState("");
  const [tags, setTags] = useState("");
  const [selectedCollections, setSelectedCollections] = useState<string[]>([]);
  const [fileData, setFileData] = useState<FileData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open && itemTypes.length === 0) {
      getItemTypes().then(setItemTypes);
    }
  }, [open, itemTypes.length]);

  useEffect(() => {
    if (open && collections.length === 0) {
      getCollections().then(setCollections);
    }
  }, [open, collections.length]);

  const resetForm = () => {
    setSelectedType("");
    setSelectedTypeName("");
    setTitle("");
    setDescription("");
    setContent("");
    setLanguage("");
    setUrl("");
    setTags("");
    setSelectedCollections([]);
    setFileData(null);
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
    const isFileType = ["file", "image"].includes(
      selectedTypeData?.name.toLowerCase() || ""
    );

    if (isLinkType && !url.trim()) {
      toast.error("URL is required for links");
      return;
    }

    if (isFileType && !fileData) {
      toast.error("File is required");
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
        collectionIds: selectedCollections,
        fileUrl: fileData?.url || null,
        fileName: fileData?.fileName || null,
        fileSize: fileData?.fileSize || null,
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
  const isLinkType = typeName === "link";
  const isFileType = ["file", "image"].includes(typeName);

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
            <ItemTypeSelect
              value={selectedType}
              typeName={selectedTypeName}
              itemTypes={itemTypes}
              onChange={(id, name) => {
                setSelectedType(id);
                setSelectedTypeName(name);
              }}
            />

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
              <UrlField
                url={url}
                onChange={setUrl}
                required={isLinkType}
              />
            )}

            <ContentEditor
              typeName={typeName}
              content={content}
              language={language}
              onContentChange={setContent}
              onLanguageChange={setLanguage}
            />

            {isFileType && (
              <FileField
                typeName={typeName as "file" | "image"}
                fileData={fileData}
                onFileUploaded={setFileData}
              />
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

            {collections.length > 0 && (
              <div className="grid grid-cols-4 items-start gap-4">
                <Label className="text-right pt-2">Collections</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="col-span-3 justify-between font-normal"
                    >
                      {selectedCollections.length === 0
                        ? "Select collections"
                        : `${selectedCollections.length} collection${selectedCollections.length > 1 ? "s" : ""} selected`}
                      <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[300px] max-h-[300px] overflow-y-auto p-0" align="start">
                    <Command>
                      <CommandEmpty>No collections found.</CommandEmpty>
                      <CommandGroup>
                        {collections.map((collection) => (
                          <CommandItem
                            key={collection.id}
                            value={collection.name}
                            onSelect={() => {
                              if (selectedCollections.includes(collection.id)) {
                                setSelectedCollections(
                                  selectedCollections.filter((id) => id !== collection.id)
                                );
                              } else {
                                setSelectedCollections([...selectedCollections, collection.id]);
                              }
                            }}
                          >
                            <Check
                              className={`mr-2 h-4 w-4 ${
                                selectedCollections.includes(collection.id)
                                  ? "opacity-100"
                                  : "opacity-0"
                              }`}
                            />
                            {collection.name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleClose(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                isSubmitting ||
                !title.trim() ||
                !selectedType ||
                (isFileType && !fileData)
              }
            >
              {isSubmitting ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
