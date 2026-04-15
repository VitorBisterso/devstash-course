"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  AuthCard,
  ErrorAlert,
  FormField,
  PasswordField,
  LinkPrompt,
} from "./auth-components";

export function RegisterForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, confirmPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Registration failed");
      } else {
        toast.success("Check your email to verify your account!", {
          style: { backgroundColor: "#22c55e", color: "#fff" },
        });
        router.push("/sign-in");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard
      title="Create Account"
      description="Enter your details to create a new account"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <ErrorAlert error={error} />}
        <FormField
          label="Name"
          id="name"
          type="text"
          placeholder="John Doe"
          value={name}
          onChange={setName}
          required
          autoComplete="name"
        />
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
          label="Password"
          placeholder="Create a password"
          value={password}
          onChange={setPassword}
          required
          autoComplete="new-password"
        />
        <PasswordField
          id="confirmPassword"
          label="Confirm Password"
          placeholder="Confirm your password"
          value={confirmPassword}
          onChange={setConfirmPassword}
          required
          autoComplete="new-password"
        />
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Creating account..." : "Register"}
        </Button>
      </form>

      <LinkPrompt
        text="Already have an account?"
        href="/sign-in"
        linkText="Sign In"
      />
    </AuthCard>
  );
}
