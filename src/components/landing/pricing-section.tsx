import { FadeInWrapper } from "@/components/landing/fade-in-wrapper";
import { PricingToggle } from "@/components/landing/pricing-toggle";

export function PricingSection() {
  return (
    <section id="pricing" className="py-[100px] px-6">
      <div className="max-w-6xl mx-auto">
        <FadeInWrapper>
          <div className="text-center mb-4">
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
              Simple pricing
            </h2>
            <p className="text-lg text-muted-foreground">
              Start free, upgrade when you need more.
            </p>
          </div>
        </FadeInWrapper>

        <PricingToggle />
      </div>
    </section>
  );
}
