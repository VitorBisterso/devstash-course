"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2, Star, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  updateCollection,
  deleteCollection,
  toggleCollectionFavorite,
} from "@/actions/collections";

interface CollectionActionsProps {
  collectionId: string;
  initialName: string;
  initialDescription: string | null;
  initialIsFavorite: boolean;
}

export function CollectionActions({
  collectionId,
  initialName,
  initialDescription,
  initialIsFavorite,
}: CollectionActionsProps) {
  const router = useRouter();
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [name, setName] = useState(initialName);
  const [description, setDescription] = useState(initialDescription ?? "");

  const handleEditOpen = () => {
    setName(initialName);
    setDescription(initialDescription ?? "");
    setEditOpen(true);
  };

  const handleFavorite = async () => {
    setFavoriteLoading(true);
    try {
      const result = await toggleCollectionFavorite(collectionId);
      if (result.success) {
        setIsFavorite(result.isFavorite ?? false);
        toast.success("Collection favorited");
      } else {
        toast.error(result.error ?? "Failed to update favorite");
      }
    } catch {
      toast.error("Failed to update favorite");
    } finally {
      setFavoriteLoading(false);
    }
  };

  const handleEditSave = async () => {
    if (!name.trim()) {
      toast.error("Name is required");
      return;
    }

    setEditLoading(true);
    try {
      const result = await updateCollection(collectionId, {
        name: name.trim(),
        description: description.trim() || null,
      });

      if (result.success) {
        toast.success("Collection updated");
        setEditOpen(false);
        router.refresh();
      } else {
        toast.error(result.error ?? "Failed to update collection");
      }
    } catch {
      toast.error("Failed to update collection");
    } finally {
      setEditLoading(false);
    }
  };

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      const result = await deleteCollection(collectionId);

      if (result.success) {
        toast.success("Collection deleted");
        router.push("/collections");
      } else {
        toast.error(result.error ?? "Failed to delete collection");
        setDeleteOpen(false);
      }
    } catch {
      toast.error("Failed to delete collection");
      setDeleteOpen(false);
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <>
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleFavorite}
          disabled={favoriteLoading}
          title={isFavorite ? "Remove from favorites" : "Add to favorites"}
        >
          {favoriteLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Star
              className={`h-4 w-4 ${
                isFavorite
                  ? "fill-yellow-500 text-yellow-500"
                  : "text-muted-foreground"
              }`}
            />
          )}
        </Button>
        <Button variant="ghost" size="sm" onClick={handleEditOpen} title="Edit collection">
          <Pencil className="h-4 w-4 text-muted-foreground" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setDeleteOpen(true)}
          title="Delete collection"
        >
          <Trash2 className="h-4 w-4 text-muted-foreground" />
        </Button>
      </div>

      {editOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-lg border bg-background p-6 shadow-lg">
            <h2 className="mb-4 text-lg font-semibold">Edit Collection</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
                  placeholder="Collection name"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
                  placeholder="Optional description"
                  rows={3}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setEditOpen(false)}
                  disabled={editLoading}
                >
                  Cancel
                </Button>
                <Button onClick={handleEditSave} disabled={editLoading}>
                  {editLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Save"
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {deleteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-lg border bg-background p-6 shadow-lg">
            <h2 className="mb-2 text-lg font-semibold">Delete Collection</h2>
            <p className="mb-4 text-sm text-muted-foreground">
              Are you sure you want to delete this collection? This will remove all
              items from this collection but will not delete the items themselves.
            </p>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setDeleteOpen(false)}
                disabled={deleteLoading}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={deleteLoading}
              >
                {deleteLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Delete"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}