"use client";

import { useEffect, useRef, type ReactNode } from "react";

interface FadeInWrapperProps {
  children: ReactNode;
  className?: string;
}

export function FadeInWrapper({ children, className = "" }: FadeInWrapperProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("opacity-100", "translate-y-0");
          el.classList.remove("opacity-0", "translate-y-8");
          observer.unobserve(el);
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out opacity-0 translate-y-8 ${className}`}
    >
      {children}
    </div>
  );
}
