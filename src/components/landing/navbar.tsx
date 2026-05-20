"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { X, Menu } from "lucide-react";

function scrollTo(id: string) {
  const el = document.getElementById(id);
  if (el) {
    el.scrollIntoView({ behavior: "smooth" });
  }
}

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-background/95 backdrop-blur-md border-b border-border"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 font-bold text-lg">
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <rect width="28" height="28" rx="6" fill="#3b82f6" />
            <path
              d="M8 8h12v2H8V8zm0 5h12v2H8v-2zm0 5h8v2H8v-2z"
              fill="white"
            />
          </svg>
          DevStash
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <button
            onClick={() => scrollTo("features")}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors bg-none border-none cursor-pointer"
          >
            Features
          </button>
          <button
            onClick={() => scrollTo("pricing")}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors bg-none border-none cursor-pointer"
          >
            Pricing
          </button>
        </div>

        <div className="hidden md:flex items-center gap-3">
          <Button variant="ghost" nativeButton={false} render={<Link href="/sign-in" />}>
            Sign In
          </Button>
          <Button nativeButton={false} render={<Link href="/register" />}>
            Get Started
          </Button>
        </div>

        <button
          className="md:hidden flex flex-col gap-1.5 p-1 bg-none border-none cursor-pointer text-foreground"
          onClick={() => setOpen(!open)}
          aria-label="Menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="md:hidden bg-background/98 backdrop-blur-md border-b border-border px-6 py-5 flex flex-col items-center gap-4">
          <button
            onClick={() => { scrollTo("features"); setOpen(false); }}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors bg-none border-none cursor-pointer"
          >
            Features
          </button>
          <button
            onClick={() => { scrollTo("pricing"); setOpen(false); }}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors bg-none border-none cursor-pointer"
          >
            Pricing
          </button>
          <div className="flex flex-col gap-3 w-full pt-2 border-t border-border">
            <Button variant="ghost" className="w-full" nativeButton={false} render={<Link href="/sign-in" onClick={() => setOpen(false)} />}>
              Sign In
            </Button>
            <Button className="w-full" nativeButton={false} render={<Link href="/register" onClick={() => setOpen(false)} />}>
              Get Started
            </Button>
          </div>
        </div>
      )}
    </nav>
  );
}
