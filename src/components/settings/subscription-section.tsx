"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface SubscriptionSectionProps {
  isPro: boolean;
  monthlyPriceId: string;
  yearlyPriceId: string;
}

export function SubscriptionSection({ isPro, monthlyPriceId, yearlyPriceId }: SubscriptionSectionProps) {
  const [loading, setLoading] = useState(false);

  async function handleAction(url: string) {
    setLoading(true);
    try {
      const res = await fetch(url, { method: "POST" });
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

  if (isPro) {
    return (
      <div className="rounded-lg border bg-card p-6">
        <h2 className="text-xl font-semibold mb-2">Pro Plan</h2>
        <p className="text-muted-foreground mb-4">
          You are on the Pro plan with unlimited items and collections.
        </p>
        <Button
          onClick={() => handleAction("/api/stripe/portal")}
          disabled={loading}
          variant="outline"
        >
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Manage Subscription
        </Button>
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-card p-6">
      <h2 className="text-xl font-semibold mb-2">Upgrade to Pro</h2>
      <p className="text-muted-foreground mb-4">
        Get unlimited items, collections, file uploads, and more.
      </p>
      <div className="flex flex-wrap gap-3">
        <Button
          onClick={() => handleUpgrade(monthlyPriceId)}
          disabled={loading}
        >
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          $8 / month
        </Button>
        <Button
          onClick={() => handleUpgrade(yearlyPriceId)}
          disabled={loading}
          variant="outline"
        >
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          $72 / year
        </Button>
      </div>
    </div>
  );
}
