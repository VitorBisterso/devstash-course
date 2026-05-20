import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Navbar } from "@/components/landing/navbar";
import { HeroSection } from "@/components/landing/hero-section";
import { FeaturesSection } from "@/components/landing/features-section";
import { AiSection } from "@/components/landing/ai-section";
import { PricingSection } from "@/components/landing/pricing-section";
import { CtaSection } from "@/components/landing/cta-section";
import { Footer } from "@/components/landing/footer";

export default async function HomePage() {
  const session = await auth();

  if (session?.user?.id) {
    redirect("/dashboard");
  }

  return (
    <>
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <AiSection />
      <PricingSection />
      <CtaSection />
      <Footer />
    </>
  );
}
