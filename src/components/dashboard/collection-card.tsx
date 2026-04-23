"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FolderOpen, Star, MoreHorizontal, Pencil, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { CollectionWithTypes } from "@/lib/db/collections";
import { typeIconsSmall } from "@/lib/constants";
import {
  updateCollection,
  deleteCollection,
  toggleCollectionFavorite,
} from "@/actions/collections";

interface CollectionCardProps {
  collection: CollectionWithTypes;
}

export function CollectionCard({ collection }: CollectionCardProps) {
  const router = useRouter();
  const [isFavorite, setIsFavorite] = useState(collection.isFavorite);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [name, setName] = useState(collection.name);
  const [description, setDescription] = useState(collection.description ?? "");
  const cardRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    setIsFavorite(collection.isFavorite);
    setName(collection.name);
    setDescription(collection.description ?? "");
  }, [collection]);

  const handleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setFavoriteLoading(true);
    try {
      const result = await toggleCollectionFavorite(collection.id);
      if (result.success) {
        setIsFavorite(result.isFavorite ?? false);
        toast.success(result.isFavorite ? "Collection favorited" : "Removed from favorites");
      } else {
        toast.error(result.error ?? "Failed to update favorite");
      }
    } catch {
      toast.error("Failed to update favorite");
    } finally {
      setFavoriteLoading(false);
    }
  };

  const handleEditOpen = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setName(collection.name);
    setDescription(collection.description ?? "");
    setEditOpen(true);
  };

  const handleEditSave = async () => {
    if (!name.trim()) {
      toast.error("Name is required");
      return;
    }

    setEditLoading(true);
    try {
      const result = await updateCollection(collection.id, {
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

  const handleDeleteOpen = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDeleteOpen(true);
  };

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      const result = await deleteCollection(collection.id);
      if (result.success) {
        toast.success("Collection deleted");
        router.refresh();
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

  const handleCardClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('[data-slot="dropdown-menu-trigger"]')) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  return (
    <>
      <Link
        ref={cardRef}
        href={`/collections/${collection.id}`}
        onClick={handleCardClick}
        className="group relative block rounded-lg border bg-card p-4 text-card-foreground shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground"
        style={
          collection.dominantColor
            ? { borderLeftColor: collection.dominantColor, borderLeftWidth: 4 }
            : undefined
        }
      >
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FolderOpen className="h-5 w-5 text-purple-500" />
            {isFavorite && (
              <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
            )}
          </div>
          <div className="flex items-center gap-1">
            <span className="text-xs text-muted-foreground">
              {collection.itemCount} items
            </span>
            <DropdownMenu>
              <DropdownMenuTrigger
                className="h-6 w-6 opacity-0 group-hover:opacity-100"
                onClick={(e) => e.preventDefault()}
              >
                <MoreHorizontal className="h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={handleFavorite}
                  disabled={favoriteLoading}
                >
                  {favoriteLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Star
                      className={`mr-2 h-4 w-4 ${
                        isFavorite
                          ? "fill-yellow-500 text-yellow-500"
                          : "text-muted-foreground"
                      }`}
                    />
                  )}
                  {isFavorite ? "Remove favorite" : "Add favorite"}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleEditOpen}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleDeleteOpen}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <p className="truncate font-medium">{collection.name}</p>
        <div className="mt-2 flex flex-wrap gap-1">
          {collection.itemTypes.slice(0, 4).map((type) => (
            <span
              key={type.id}
              className="flex h-5 w-5 items-center justify-center rounded bg-secondary text-secondary-foreground"
              title={type.name}
            >
              {typeIconsSmall[type.name.toLowerCase()]}
            </span>
          ))}
        </div>
      </Link>

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