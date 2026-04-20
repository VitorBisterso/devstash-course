"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Loader2, Save, X, Check, ChevronsUpDown } from "lucide-react";
import { Command, CommandEmpty, CommandGroup, CommandItem } from "@/components/ui/command";
import { CodeEditor } from "./code-editor";
import { MarkdownEditor } from "./markdown-editor";
import { isCodeType } from "@/lib/item-types";
import type { ItemDetail } from "@/lib/db/items";

interface EditFormData {
  title: string;
  description: string;
  content: string;
  url: string;
  language: string;
  tags: string;
  collectionIds: string[];
}

interface ItemDrawerEditFormProps {
  item: ItemDetail;
  formData: EditFormData;
  collections: { id: string; name: string }[];
  typeSpecificField: "content" | "url" | "none";
  saving: boolean;
  onFormDataChange: (data: Partial<EditFormData>) => void;
  onSave: () => void;
  onCancel: () => void;
}

export function ItemDrawerEditForm({
  item,
  formData,
  collections,
  typeSpecificField,
  saving,
  onFormDataChange,
  onSave,
  onCancel,
}: ItemDrawerEditFormProps) {
  const showContentEditor = typeSpecificField === "content";
  const showLanguageField = typeSpecificField === "content" && isCodeType(item.type.name);
  const showUrlField = typeSpecificField === "url";

  return (
    <div className="mt-4 space-y-4">
      <div>
        <Label htmlFor="edit-tags" className="mb-1 block">Tags</Label>
        <Input
          id="edit-tags"
          value={formData.tags}
          onChange={(e) => onFormDataChange({ tags: e.target.value })}
          placeholder="Comma-separated tags"
        />
        <p className="text-xs text-muted-foreground mt-1">
          Separate tags with commas
        </p>
      </div>

      {collections.length > 0 && (
        <div>
          <Label className="mb-1 block">Collections</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-between font-normal"
              >
                {formData.collectionIds.length === 0
                  ? "Select collections"
                  : `${formData.collectionIds.length} collection${formData.collectionIds.length > 1 ? "s" : ""} selected`}
                <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[300px] p-0" align="start">
              <Command>
                <CommandEmpty>No collections found.</CommandEmpty>
                <CommandGroup>
                  {collections.map((collection) => (
                    <CommandItem
                      key={collection.id}
                      value={collection.name}
                      onSelect={() => {
                        if (formData.collectionIds.includes(collection.id)) {
                          onFormDataChange({
                            collectionIds: formData.collectionIds.filter(
                              (id) => id !== collection.id
                            ),
                          });
                        } else {
                          onFormDataChange({
                            collectionIds: [
                              ...formData.collectionIds,
                              collection.id,
                            ],
                          });
                        }
                      }}
                    >
                      <Check
                        className={`mr-2 h-4 w-4 ${
                          formData.collectionIds.includes(collection.id)
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

      {showContentEditor && (
        <div>
          <Label htmlFor="edit-content" className="mb-1 block">Content</Label>
          {isCodeType(item.type.name) ? (
            <CodeEditor
              value={formData.content}
              onChange={(val) => onFormDataChange({ content: val })}
              language={formData.language || "plaintext"}
            />
          ) : (
            <MarkdownEditor
              value={formData.content}
              onChange={(val) => onFormDataChange({ content: val })}
            />
          )}
        </div>
      )}

      {showLanguageField && (
        <div>
          <Label htmlFor="edit-language" className="mb-1 block">Language</Label>
          <Input
            id="edit-language"
            value={formData.language}
            onChange={(e) => onFormDataChange({ language: e.target.value })}
            placeholder="e.g., javascript, python"
          />
        </div>
      )}

      {showUrlField && (
        <div>
          <Label htmlFor="edit-url" className="mb-1 block">URL</Label>
          <Input
            id="edit-url"
            type="url"
            value={formData.url}
            onChange={(e) => onFormDataChange({ url: e.target.value })}
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
          onClick={onSave}
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
          onClick={onCancel}
          disabled={saving}
        >
          <X className="h-4 w-4" />
          <span className="ml-1">Cancel</span>
        </Button>
      </div>
    </div>
  );
}
