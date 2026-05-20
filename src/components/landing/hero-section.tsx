import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChaosBox } from "@/components/landing/chaos-box";

const typeItems = [
  { key: "snippet", color: "#3b82f6" },
  { key: "prompt", color: "#f59e0b" },
  { key: "command", color: "#06b6d4" },
  { key: "note", color: "#22c55e" },
  { key: "file", color: "#64748b" },
  { key: "image", color: "#ec4899" },
  { key: "link", color: "#6366f1" },
];

const previewCards = [
  { color: "#3b82f6" },
  { color: "#f59e0b" },
  { color: "#06b6d4" },
  { color: "#22c55e" },
];

export function HeroSection() {
  return (
    <section className="min-h-screen flex flex-col items-center justify-center px-6 pt-[120px] pb-20 text-center">
      <div className="max-w-[720px] mb-16">
        <h1 className="text-5xl md:text-[3.5rem] font-extrabold leading-[1.15] tracking-tight mb-5">
          Stop Losing Your<br />
          <span className="bg-gradient-to-r from-blue-500 to-blue-600 bg-clip-text text-transparent">
            Developer Knowledge
          </span>
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-[560px] mx-auto mb-9 leading-relaxed">
          Code snippets, AI prompts, commands, notes, files, images, and links
          — all organized in one place. Your personal developer knowledge hub.
        </p>
        <div className="flex gap-4 justify-center max-sm:flex-col max-sm:items-stretch">
          <Button size="lg" nativeButton={false} render={<Link href="/register" />}>
            Get Started Free
          </Button>
          <Button variant="outline" size="lg" nativeButton={false} render={<Link href="/#features" />}>
            See Features
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-10 max-w-[1000px] w-full max-lg:flex-col max-lg:gap-6">
        <div className="flex-1 min-w-0">
          <p className="text-sm text-muted-foreground mb-3 font-medium text-center">
            Your knowledge today...
          </p>
          <ChaosBox />
        </div>

        <svg
          className="w-12 h-12 text-blue-500 shrink-0 animate-pulse max-lg:rotate-90 max-lg:w-8 max-lg:h-8"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M5 12h14" />
          <path d="m12 5 7 7-7 7" />
        </svg>

        <div className="flex-[1.4] min-w-0">
          <p className="text-sm text-muted-foreground mb-3 font-medium text-center">
            ...with DevStash
          </p>
          <div className="bg-card border border-border rounded-xl overflow-hidden flex">
            <div className="w-[100px] max-sm:w-20 p-3 bg-muted/30 flex flex-col gap-1.5 shrink-0">
              {typeItems.map((t) => (
                <div
                  key={t.key}
                  className="flex items-center gap-2 px-2 py-1.5 rounded-md text-[0.7rem] text-muted-foreground"
                  style={{ background: `${t.color}15` }}
                >
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ background: t.color }}
                  />
                  <span className="inline max-sm:hidden">{typeItems.find((i) => i.key === t.key)?.key}</span>
                </div>
              ))}
            </div>
            <div className="flex-1 grid grid-cols-2 gap-2 p-3">
              {previewCards.map((c, i) => (
                <div
                  key={i}
                  className="aspect-[1.3] bg-secondary rounded-lg border-t-[3px]"
                  style={{ borderTopColor: c.color }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
