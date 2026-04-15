"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithGitHub } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import {
  AuthCard,
  ErrorAlert,
  OAuthButtons,
  FormField,
  PasswordField,
  LinkPrompt,
} from "./auth-components";

export function SignInForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Something went wrong");
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard
      title="Sign In"
      description="Enter your email and password to sign in to your account"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <ErrorAlert error={error} />}
        <FormField
          label="Email"
          id="email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={setEmail}
          required
          autoComplete="email"
        />
        <PasswordField
          id="password"
          placeholder="Enter your password"
          value={password}
          onChange={setPassword}
          required
          autoComplete="current-password"
          showForgotLink
        />
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Signing in..." : "Sign In"}
        </Button>
      </form>

      <OAuthButtons action={signInWithGitHub} />

      <LinkPrompt
        text="Don't have an account?"
        href="/register"
        linkText="Register"
      />
    </AuthCard>
  );
}
