import { FadeInWrapper } from "@/components/landing/fade-in-wrapper";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";

const CHECKLIST = [
  "Auto-generate tags from content",
  "Smart search suggestions",
  "Summarize notes and prompts",
  "Code explanation and refactoring",
  "Related item suggestions",
];

export function AiSection() {
  return (
    <section className="py-[100px] px-6" id="ai">
      <div className="max-w-6xl mx-auto">
        <FadeInWrapper>
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
              AI-powered organization
            </h2>
            <p className="text-lg text-muted-foreground max-w-[560px] mx-auto">
              Let AI help you keep your knowledge base organized automatically.
            </p>
          </div>
        </FadeInWrapper>

        <div className="grid md:grid-cols-2 gap-12 items-center md:[&>:last-child]:order-first">
          <FadeInWrapper>
            <div className="code-mockup bg-[#0d1117] border border-[#21262d] rounded-xl overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 bg-[#161b22] border-b border-[#21262d]">
                <span className="w-3 h-3 rounded-full bg-red-500" />
                <span className="w-3 h-3 rounded-full bg-amber-500" />
                <span className="w-3 h-3 rounded-full bg-green-500" />
                <span className="ml-2 text-xs text-muted-foreground">snippet.ts</span>
              </div>
              <div className="p-5 font-mono text-sm leading-relaxed text-muted-foreground">
                <div>
                  <span className="text-[#ff7b72]">function</span>{" "}
                  <span className="text-[#d2a8ff]">fetchData</span>
                  <span className="text-muted-foreground">()</span> {"{"}
                </div>
                <div className="ml-4">
                  <span className="text-[#ff7b72]">const</span> res ={" "}
                  <span className="text-[#ff7b72]">await</span>{" "}
                  <span className="text-[#79c0ff]">fetch</span>(
                  <span className="text-[#a5d6ff]">{'\'/api/data\''}</span>);
                </div>
                <div className="ml-4">
                  <span className="text-[#ff7b72]">return</span> res.
                  <span className="text-[#79c0ff]">json</span>();
                </div>
                <div>{"}"}</div>
                <div className="flex gap-2 mt-4 pt-4 border-t border-[#21262d] flex-wrap">
                  <span
                    className="px-2.5 py-1 rounded-md text-xs font-medium"
                    style={{ background: "rgba(59,130,246,0.2)", color: "#93c5fd" }}
                  >
                    api
                  </span>
                  <span
                    className="px-2.5 py-1 rounded-md text-xs font-medium"
                    style={{ background: "rgba(6,182,212,0.2)", color: "#67e8f9" }}
                  >
                    async
                  </span>
                  <span
                    className="px-2.5 py-1 rounded-md text-xs font-medium"
                    style={{ background: "rgba(34,197,94,0.2)", color: "#86efac" }}
                  >
                    data-fetching
                  </span>
                  <span
                    className="px-2.5 py-1 rounded-md text-[0.7rem] font-medium uppercase tracking-wider ml-auto"
                    style={{ background: "rgba(139,92,246,0.2)", color: "#c4b5fd" }}
                  >
                    AI Generated Tags
                  </span>
                </div>
              </div>
            </div>
          </FadeInWrapper>

          <FadeInWrapper>
            <Badge
              className="bg-gradient-to-r from-amber-500 to-amber-600 text-white border-none mb-4"
            >
              PRO
            </Badge>
            <h3 className="text-2xl font-bold mb-6">Supercharge your workflow</h3>
            <ul className="flex flex-col gap-3.5">
              {CHECKLIST.map((item) => (
                <li key={item} className="flex items-center gap-3 text-base text-muted-foreground">
                  <Check className="h-5 w-5 text-green-500 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </FadeInWrapper>
        </div>
      </div>
    </section>
  );
}
