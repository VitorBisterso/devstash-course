"use client";

import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Github } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface AuthCardProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

export function AuthCard({ title, description, children }: AuthCardProps) {
  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl font-bold">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">{children}</CardContent>
    </Card>
  );
}

interface ErrorAlertProps {
  error: string;
}

export function ErrorAlert({ error }: ErrorAlertProps) {
  return (
    <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
      {error}
    </div>
  );
}

interface OAuthButtonsProps {
  action: () => Promise<void>;
  provider?: string;
}

export function OAuthButtons({ action, provider = "GitHub" }: OAuthButtonsProps) {
  return (
    <>
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>
      </div>

      <form action={action}>
        <Button variant="outline" className="w-full" type="submit">
          <Github className="mr-2 h-4 w-4" />
          Sign in with {provider}
        </Button>
      </form>
    </>
  );
}

interface FormFieldProps {
  label: string;
  id: string;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  autoComplete?: string;
}

export function FormField({
  label,
  id,
  type = "text",
  placeholder,
  value,
  onChange,
  required,
  autoComplete,
}: FormFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        name={id}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        autoComplete={autoComplete}
      />
    </div>
  );
}

interface PasswordFieldProps {
  id: string;
  label?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  autoComplete?: string;
  showForgotLink?: boolean;
}

export function PasswordField({
  id,
  label = "Password",
  placeholder,
  value,
  onChange,
  required,
  autoComplete,
  showForgotLink,
}: PasswordFieldProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label htmlFor={id}>{label}</Label>
        {showForgotLink && (
          <Link
            href="/forgot-password"
            className="text-xs text-muted-foreground hover:text-primary"
          >
            Forgot password?
          </Link>
        )}
      </div>
      <Input
        id={id}
        name={id}
        type="password"
        placeholder={placeholder || "Enter your password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        autoComplete={autoComplete}
      />
    </div>
  );
}

interface LinkPromptProps {
  text: string;
  href: string;
  linkText: string;
}

export function LinkPrompt({ text, href, linkText }: LinkPromptProps) {
  return (
    <p className="text-center text-sm text-muted-foreground">
      {text}{" "}
      <Link href={href} className="text-primary hover:underline">
        {linkText}
      </Link>
    </p>
  );
}
