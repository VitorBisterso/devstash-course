"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { Key, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface ProfileActionsProps {
  userId: string;
  hasPassword: boolean;
}

export function ProfileActions({ userId, hasPassword }: ProfileActionsProps) {
  const router = useRouter();
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setIsChangingPassword(true);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, newPassword }),
      });

      if (res.ok) {
        toast.success("Password changed successfully");
        setShowPasswordForm(false);
        setNewPassword("");
        setConfirmPassword("");
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to change password");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch("/api/auth/delete-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      if (res.ok) {
        toast.success("Account deleted successfully");
        await signOut({ redirect: false });
        router.push("/");
        router.refresh();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to delete account");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Account Actions</h2>

      <div className="rounded-lg border bg-card p-4 text-card-foreground shadow-sm space-y-4">
        {hasPassword ? (
          <>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Key className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Change Password</p>
                  <p className="text-sm text-muted-foreground">
                    Update your account password
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                onClick={() => setShowPasswordForm(!showPasswordForm)}
              >
                {showPasswordForm ? "Cancel" : "Change"}
              </Button>
            </div>

            {showPasswordForm && (
              <div className="space-y-3 pt-3 border-t">
                <div className="space-y-2">
                  <label className="text-sm font-medium">New Password</label>
                  <Input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Confirm Password</label>
                  <Input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                  />
                </div>
                <Button
                  onClick={handleChangePassword}
                  disabled={isChangingPassword}
                  className="w-full"
                >
                  {isChangingPassword && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isChangingPassword ? "Changing..." : "Change Password"}
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="flex items-center gap-3">
            <Key className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="font-medium">Password</p>
              <p className="text-sm text-muted-foreground">
                Account managed via GitHub OAuth
              </p>
            </div>
          </div>
        )}

        <div className="border-t pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Trash2 className="h-5 w-5 text-destructive" />
              <div>
                <p className="font-medium text-destructive">Delete Account</p>
                <p className="text-sm text-muted-foreground">
                  Permanently delete your account and all data
                </p>
              </div>
            </div>
            <Button
              variant="destructive"
              onClick={() => setShowDeleteConfirm(true)}
            >
              Delete
            </Button>
          </div>

          {showDeleteConfirm && (
            <div className="mt-4 p-3 bg-destructive/10 rounded-lg space-y-3">
              <p className="text-sm font-medium text-destructive">
                Are you sure? This action cannot be undone.
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDeleteAccount}
                  disabled={isDeleting}
                  className="flex-1"
                >
                  {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isDeleting ? "Deleting..." : "Yes, Delete"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
