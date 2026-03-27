"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface UserAvatarProps {
  name: string | null | undefined;
  image?: string | null;
  size?: "default" | "sm" | "lg";
  className?: string;
}

function getInitials(name: string | null | undefined): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

export function UserAvatar({ name, image, size = "default", className }: UserAvatarProps) {
  const initials = getInitials(name);

  return (
    <Avatar size={size} className={className}>
      {image && <AvatarImage src={image} alt={name || "User"} />}
      <AvatarFallback>{initials}</AvatarFallback>
    </Avatar>
  );
}
