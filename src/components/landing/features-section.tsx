import { FadeInWrapper } from "@/components/landing/fade-in-wrapper";
import { Code2, Bot, Terminal, FileText, Search, FolderOpen } from "lucide-react";

const FEATURES = [
  {
    icon: Code2,
    color: "#3b82f6",
    title: "Code Snippets",
    desc: "Save and organize code snippets with syntax highlighting. Search instantly across your entire library.",
  },
  {
    icon: Bot,
    color: "#f59e0b",
    title: "AI Prompts",
    desc: "Store and version your best AI prompts. Never lose that perfect prompt again.",
  },
  {
    icon: Terminal,
    color: "#06b6d4",
    title: "Commands",
    desc: "Keep your most-used terminal commands organized. No more digging through shell history.",
  },
  {
    icon: Search,
    color: "#22c55e",
    title: "Instant Search",
    desc: "Press Cmd+K and search across everything — items, collections, tags. Fuzzy search finds what you need fast.",
  },
  {
    icon: FileText,
    color: "#64748b",
    title: "Files & Docs",
    desc: "Upload and organize files, images, and documents. Everything in one place, accessible anywhere.",
  },
  {
    icon: FolderOpen,
    color: "#6366f1",
    title: "Collections",
    desc: "Group related items into collections. Organize by project, topic, or whatever makes sense to you.",
  },
];

export function FeaturesSection() {
  return (
    <section
      id="features"
      className="py-[100px] bg-[#0d0d16]"
    >
      <div className="max-w-6xl mx-auto px-6">
        <FadeInWrapper>
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
              Everything developers need
            </h2>
            <p className="text-lg text-muted-foreground max-w-[560px] mx-auto">
              Stop context-switching between tools. DevStash brings your knowledge together.
            </p>
          </div>
        </FadeInWrapper>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((f) => (
            <FadeInWrapper key={f.title}>
              <div
                className="bg-card border border-border rounded-xl p-8 transition-all duration-200 hover:-translate-y-1 hover:border-[var(--accent)]"
                style={{ "--accent": f.color } as React.CSSProperties}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
                  style={{ background: `${f.color}26`, color: f.color }}
                >
                  <f.icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            </FadeInWrapper>
          ))}
        </div>
      </div>
    </section>
  );
}
