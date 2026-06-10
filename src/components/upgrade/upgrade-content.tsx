"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Check, Sparkles } from "lucide-react";
import { toast } from "sonner";

interface UpgradeContentProps {
  monthlyPriceId: string;
  yearlyPriceId: string;
}

const FREE_FEATURES = ["50 items", "3 collections", "Basic search", "Community support"];
const PRO_FEATURES = ["Unlimited items", "Unlimited collections", "AI features", "File uploads", "Priority support"];

export function UpgradeContent({ monthlyPriceId, yearlyPriceId }: UpgradeContentProps) {
  const [yearly, setYearly] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);

  async function handleUpgrade(priceId: string) {
    setLoading(priceId);
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
      setLoading(null);
    }
  }

  const proPrice = yearly ? "$72" : "$8";
  const proPeriod = yearly ? "/yr" : "/mo";

  return (
    <div className="max-w-[640px] mx-auto py-12 space-y-8">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center p-3 rounded-full bg-primary/10">
          <Sparkles className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-3xl font-bold">Upgrade to Pro</h1>
        <p className="text-muted-foreground">
          Unlock unlimited items, collections, file uploads and more.
        </p>
      </div>

      <div className="flex items-center justify-center gap-3">
        <span
          className={`text-sm font-medium transition-colors ${
            !yearly ? "text-foreground" : "text-muted-foreground"
          }`}
        >
          Monthly
        </span>
        <button
          onClick={() => setYearly(!yearly)}
          className="relative inline-block w-12 h-[26px] cursor-pointer"
          aria-label="Toggle pricing"
        >
          <span
            className={`absolute inset-0 rounded-full border transition-colors ${
              yearly ? "border-primary" : "border-border"
            } bg-secondary`}
          />
          <span
            className={`absolute top-[3px] left-[3px] h-5 w-5 rounded-full bg-primary transition-transform duration-300 ${
              yearly ? "translate-x-6" : "translate-x-0"
            }`}
          />
        </button>
        <span
          className={`text-sm font-medium transition-colors ${
            yearly ? "text-foreground" : "text-muted-foreground"
          }`}
        >
          Yearly{" "}
          <span className="text-green-500 text-xs font-semibold">Save 25%</span>
        </span>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-2xl p-9">
          <h3 className="text-xl font-bold mb-4">Free</h3>
          <div className="text-4xl font-extrabold mb-1">
            $0<span className="text-base text-muted-foreground font-medium">/mo</span>
          </div>
          <p className="text-sm text-muted-foreground mb-6">For getting started</p>
          <ul className="flex flex-col gap-3 mb-7">
            {FREE_FEATURES.map((f) => (
              <li key={f} className="flex items-center gap-2.5 text-sm text-muted-foreground">
                <Check className="h-[18px] w-[18px] text-green-500 shrink-0" />
                {f}
              </li>
            ))}
          </ul>
          <Button variant="outline" className="w-full" disabled>
            Current Plan
          </Button>
        </div>

        <div className="bg-card border border-primary rounded-2xl p-9 relative bg-gradient-to-br from-primary/[0.08] to-primary/[0.05]">
          <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap">
            Most Popular
          </Badge>
          <h3 className="text-xl font-bold mb-4">Pro</h3>
          <div className="text-4xl font-extrabold mb-1">
            {proPrice}
            <span className="text-base text-muted-foreground font-medium">{proPeriod}</span>
          </div>
          <p className="text-sm text-muted-foreground mb-6">For serious developers</p>
          <ul className="flex flex-col gap-3 mb-7">
            {PRO_FEATURES.map((f) => (
              <li key={f} className="flex items-center gap-2.5 text-sm text-muted-foreground">
                <Check className="h-[18px] w-[18px] text-green-500 shrink-0" />
                {f}
              </li>
            ))}
          </ul>
          <Button
            className="w-full gap-2"
            onClick={() => handleUpgrade(yearly ? yearlyPriceId : monthlyPriceId)}
            disabled={loading !== null}
          >
            {loading !== null && <Loader2 className="h-4 w-4 animate-spin" />}
            Upgrade
          </Button>
        </div>
      </div>

      <p className="text-center text-sm text-muted-foreground">
        Cancel anytime. No hidden fees.
      </p>
    </div>
  );
}
