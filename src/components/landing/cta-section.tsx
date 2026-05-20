import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FadeInWrapper } from "@/components/landing/fade-in-wrapper";

export function CtaSection() {
  return (
    <section className="py-[100px] px-6 text-center">
      <FadeInWrapper>
        <div className="bg-card border border-border rounded-2xl py-20 px-10 max-sm:py-12 max-sm:px-6">
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
            Ready to Organize Your Knowledge?
          </h2>
          <p className="text-lg text-muted-foreground max-w-[480px] mx-auto mb-9">
            Join thousands of developers who keep their knowledge organized with DevStash.
          </p>
          <Button size="lg" nativeButton={false} render={<Link href="/register" />}>
            Get Started for Free
          </Button>
        </div>
      </FadeInWrapper>
    </section>
  );
}
