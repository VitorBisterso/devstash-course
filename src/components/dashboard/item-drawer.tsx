"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Sheet,
  SheetContent,
} from "@/components/ui/sheet";
import { typeIcons, getIconWithColor } from "@/lib/constants";
import { getTypeField, isCodeType } from "@/lib/item-types";
import type { ItemDetail } from "@/lib/db/items";
import { updateItem, toggleItemFavorite } from "@/actions/items";
import { toast } from "sonner";
import {
  ItemDrawerLoading,
  ItemDrawerEmpty,
  ItemDrawerViewHeader,
  ItemDrawerEditHeader,
} from "./item-drawer-header";
import {
  ItemDrawerActions,
  ItemDrawerContent,
} from "./item-drawer-content";
import { ItemDrawerEditForm } from "./item-drawer-edit-form";
import { getCollections } from "@/actions/collections";

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
  collectionIds: string[];
}

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
    collectionIds: [],
  });
  const [allCollections, setAllCollections] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    if (editMode && allCollections.length === 0) {
      getCollections().then(setAllCollections);
    }
  }, [editMode, allCollections.length]);

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
        collectionIds: item.collections.map((c) => c.id),
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
    const result = await toggleItemFavorite(item.id);
    if (result.success) {
      setItem({ ...item, isFavorite: result.isFavorite ?? false });
      toast.success(result.isFavorite ? "Added to favorites" : "Removed from favorites");
      router.refresh();
    } else {
      toast.error(result.error ?? "Failed to update favorite");
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

  const handleSave = async () => {
    if (!item || !formData.title.trim()) return;

    setSaving(true);
    try {
      const tags = formData.tags
        .split(",")
        .map((t) => t.trim())
        .filter((t) => t.length > 0);

      const typeField = getTypeField(item.type.name);
      const result = await updateItem(item.id, {
        title: formData.title.trim(),
        description: formData.description || null,
        content: typeField === "content" ? (formData.content || null) : null,
        url: typeField === "url" ? (formData.url || null) : null,
        language: isCodeType(item.type.name) ? (formData.language || null) : null,
        tags,
        collectionIds: formData.collectionIds,
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

  const handleFormDataChange = (data: Partial<EditFormData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  const typeSpecificField = item ? getTypeField(item.type.name) : "none";

  return (
    <Sheet open={!!itemId} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-xl overflow-y-auto p-6">
        {loading ? (
          <ItemDrawerLoading />
        ) : item ? (
          <>
            {editMode ? (
              <>
                <ItemDrawerEditHeader
                  title={formData.title}
                  description={formData.description}
                  onTitleChange={(v) => handleFormDataChange({ title: v })}
                  onDescriptionChange={(v) => handleFormDataChange({ description: v })}
                />
                <ItemDrawerEditForm
                  item={item}
                  formData={formData}
                  collections={allCollections}
                  typeSpecificField={typeSpecificField}
                  saving={saving}
                  onFormDataChange={handleFormDataChange}
                  onSave={handleSave}
                  onCancel={() => setEditMode(false)}
                />
              </>
            ) : (
              <>
                <ItemDrawerViewHeader
                  title={item.title}
                  typeIcon={getIconWithColor(
                    typeIcons[item.type.name.toLowerCase()] || typeIcons.snippet,
                    item.type.color
                  )}
                />
                <ItemDrawerActions
                  item={item}
                  copied={copied}
                  deleteOpen={deleteOpen}
                  deleting={deleting}
                  onFavorite={handleFavorite}
                  onPin={handlePin}
                  onCopy={handleCopy}
                  onEdit={() => setEditMode(true)}
                  onDeleteOpenChange={setDeleteOpen}
                  onDelete={handleDelete}
                />
                <ItemDrawerContent
                  item={item}
                  isCodeType={isCodeType(item.type.name)}
                />
              </>
            )}
          </>
        ) : (
          <ItemDrawerEmpty />
        )}
      </SheetContent>
    </Sheet>
  );
}
