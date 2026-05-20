"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

const PLANS = {
  monthly: {
    free: { price: "$0", period: "/mo" },
    pro: { price: "$8", period: "/mo" },
  },
  yearly: {
    free: { price: "$0", period: "/mo" },
    pro: { price: "$72", period: "/yr" },
  },
};

const FREE_FEATURES = ["50 items", "3 collections", "Basic search", "Community support"];
const PRO_FEATURES = ["Unlimited items", "Unlimited collections", "AI features", "File uploads", "Priority support"];

export function PricingToggle() {
  const [yearly, setYearly] = useState(false);
  const pricing = yearly ? PLANS.yearly : PLANS.monthly;

  return (
    <div>
      <div className="flex items-center justify-center gap-3 mt-6">
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

      <div className="grid md:grid-cols-2 gap-6 max-w-[640px] mx-auto mt-10">
        <div className="bg-card border border-border rounded-2xl p-9">
          <h3 className="text-xl font-bold mb-4">Free</h3>
          <div className="text-4xl font-extrabold mb-1">
            {pricing.free.price}
            <span className="text-base text-muted-foreground font-medium">
              {pricing.free.period}
            </span>
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
          <Button variant="outline" className="w-full" nativeButton={false} render={<a href="/register" />}>
            Get Started
          </Button>
        </div>

        <div className="bg-card border border-primary rounded-2xl p-9 relative bg-gradient-to-br from-primary/[0.08] to-primary/[0.05]">
          <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap">
            Most Popular
          </Badge>
          <h3 className="text-xl font-bold mb-4">Pro</h3>
          <div className="text-4xl font-extrabold mb-1">
            {pricing.pro.price}
            <span className="text-base text-muted-foreground font-medium">
              {pricing.pro.period}
            </span>
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
          <Button className="w-full" nativeButton={false} render={<a href="/register" />}>
            Get Started
          </Button>
        </div>
      </div>
    </div>
  );
}
