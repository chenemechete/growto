"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import type { Plan } from "@/types";

interface PricingTableProps {
  plans: Plan[];
}

export function PricingTable({ plans }: PricingTableProps) {
  const [interval, setInterval] = useState<"month" | "year">("year");
  const [loadingTier, setLoadingTier] = useState<string | null>(null);

  const handleSelect = async (tier: string) => {
    setLoadingTier(tier);
    try {
      const res = await fetch("/api/subscription/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier, interval }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingTier(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Billing toggle */}
      <div className="flex items-center justify-center gap-3">
        <button
          onClick={() => setInterval("month")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
            interval === "month" ? "bg-dark text-white" : "text-muted-foreground hover:text-dark"
          }`}
        >
          Monthly
        </button>
        <button
          onClick={() => setInterval("year")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
            interval === "year" ? "bg-dark text-white" : "text-muted-foreground hover:text-dark"
          }`}
        >
          Annual
          <span className="ml-2 text-xs bg-sage/30 text-sage-dark px-1.5 py-0.5 rounded">
            Save 17%
          </span>
        </button>
      </div>

      {/* Plan cards */}
      <div className="space-y-4">
        {plans.map((plan) => {
          const price = interval === "year" ? plan.priceYearly / 12 : plan.priceMonthly;
          const isLoading = loadingTier === plan.tier;

          return (
            <div
              key={plan.tier}
              className={`bg-white rounded-xl border-2 p-6 space-y-4 ${
                plan.highlighted
                  ? "border-terracotta shadow-md"
                  : "border-border"
              }`}
            >
              {plan.highlighted && (
                <div className="text-xs font-semibold text-terracotta uppercase tracking-wide">
                  Most Popular
                </div>
              )}

              <div className="flex items-end justify-between">
                <div>
                  <h3 className="text-lg font-display font-bold text-dark">{plan.name}</h3>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-3xl font-bold text-dark">${Math.round(price)}</span>
                    <span className="text-sm text-muted-foreground">/mo</span>
                  </div>
                  {interval === "year" && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Billed ${plan.priceYearly}/year
                    </p>
                  )}
                </div>
              </div>

              <ul className="space-y-2">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm text-dark">
                    <Check
                      size={14}
                      className="text-sage-dark mt-0.5 shrink-0"
                      aria-hidden
                    />
                    {feature}
                  </li>
                ))}
              </ul>

              <Button
                className="w-full"
                variant={plan.highlighted ? "default" : "outline"}
                size="lg"
                onClick={() => handleSelect(plan.tier)}
                disabled={isLoading}
                aria-label={`Select ${plan.name} plan`}
              >
                {isLoading ? "Redirecting…" : `Start ${plan.name}`}
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
