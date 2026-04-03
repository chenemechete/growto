import type { Plan } from "@/types";

export const PLANS: Plan[] = [
  {
    tier: "BASIC",
    name: "Basic",
    priceMonthly: 19,
    priceYearly: 190,
    stripePriceIdMonthly: process.env.STRIPE_PRICE_BASIC_MONTHLY ?? "",
    stripePriceIdYearly: process.env.STRIPE_PRICE_BASIC_YEARLY ?? "",
    features: [
      "3 growth areas",
      "Unlimited daily practices",
      "Progress tracking & behavior markers",
      "Real-world application tracking",
      "Email support",
    ],
  },
  {
    tier: "PREMIUM",
    name: "Premium",
    priceMonthly: 49,
    priceYearly: 490,
    stripePriceIdMonthly: process.env.STRIPE_PRICE_PREMIUM_MONTHLY ?? "",
    stripePriceIdYearly: process.env.STRIPE_PRICE_PREMIUM_YEARLY ?? "",
    highlighted: true,
    features: [
      "All 5 growth areas",
      "Unlimited daily practices",
      "Advanced AI insights",
      "Community access (coming soon)",
      "Optional biblical integration track",
      "Priority email support",
      "Early access to new features",
    ],
  },
  {
    tier: "COACHING",
    name: "Coaching",
    priceMonthly: 99,
    priceYearly: 99 * 12, // no annual discount
    stripePriceIdMonthly: process.env.STRIPE_PRICE_COACHING_MONTHLY ?? "",
    stripePriceIdYearly: process.env.STRIPE_PRICE_COACHING_MONTHLY ?? "",
    features: [
      "Everything in Premium",
      "Monthly 1:1 coaching session (30 min)",
      "3 custom scenario requests/month",
      "Direct messaging with coach",
      "Personalized growth plan review",
    ],
  },
];

export const FREE_PRACTICE_LIMIT = 3;
