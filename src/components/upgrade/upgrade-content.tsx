"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Sparkles, FileCode, Image, Infinity, Zap, Shield } from "lucide-react";
import { toast } from "sonner";

interface UpgradeContentProps {
  monthlyPriceId: string;
  yearlyPriceId: string;
}

const features = [
  { icon: Infinity, text: "Unlimited items and collections" },
  { icon: Zap, text: "Upload files and images" },
  { icon: Shield, text: "Priority support" },
];

const proTypes = [
  { icon: FileCode, label: "Files", color: "text-blue-500" },
  { icon: Image, label: "Images", color: "text-green-500" },
];

export function UpgradeContent({ monthlyPriceId, yearlyPriceId }: UpgradeContentProps) {
  const [loading, setLoading] = useState(false);

  async function handleUpgrade(priceId: string) {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error ?? "Something went wrong");
        return;
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="max-w-lg w-full space-y-8 text-center">
        <div className="space-y-4">
          <div className="inline-flex items-center justify-center p-3 rounded-full bg-primary/10">
            <Sparkles className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold">Upgrade to Pro</h1>
          <p className="text-muted-foreground">
            Files and images are available exclusively for Pro users.
          </p>
        </div>

        <div className="flex items-center justify-center gap-4">
          {proTypes.map((type) => (
            <div
              key={type.label}
              className="flex items-center gap-2 rounded-lg border bg-card px-4 py-2"
            >
              <type.icon className={`h-5 w-5 ${type.color}`} />
              <span className="font-medium">{type.label}</span>
            </div>
          ))}
        </div>

        <div className="rounded-lg border bg-card p-6 text-left space-y-4">
          <h2 className="font-semibold text-center">What you get:</h2>
          <ul className="space-y-3">
            {features.map((feature) => (
              <li key={feature.text} className="flex items-center gap-3">
                <feature.icon className="h-5 w-5 text-primary flex-shrink-0" />
                <span>{feature.text}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            size="lg"
            onClick={() => handleUpgrade(monthlyPriceId)}
            disabled={loading}
            className="gap-2"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            $8 / month
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={() => handleUpgrade(yearlyPriceId)}
            disabled={loading}
            className="gap-2"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            $72 / year
          </Button>
        </div>

        <p className="text-sm text-muted-foreground">
          Cancel anytime. No hidden fees.
        </p>
      </div>
    </div>
  );
}
