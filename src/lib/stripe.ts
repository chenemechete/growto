import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-01-27.acacia",
});

export const STRIPE_PRICES = {
  BASIC_MONTHLY: process.env.STRIPE_PRICE_BASIC_MONTHLY!,
  BASIC_YEARLY: process.env.STRIPE_PRICE_BASIC_YEARLY!,
  PREMIUM_MONTHLY: process.env.STRIPE_PRICE_PREMIUM_MONTHLY!,
  PREMIUM_YEARLY: process.env.STRIPE_PRICE_PREMIUM_YEARLY!,
  COACHING_MONTHLY: process.env.STRIPE_PRICE_COACHING_MONTHLY!,
};

export function tierFromPriceId(priceId: string): "BASIC" | "PREMIUM" | "COACHING" | null {
  if ([STRIPE_PRICES.BASIC_MONTHLY, STRIPE_PRICES.BASIC_YEARLY].includes(priceId)) return "BASIC";
  if ([STRIPE_PRICES.PREMIUM_MONTHLY, STRIPE_PRICES.PREMIUM_YEARLY].includes(priceId)) return "PREMIUM";
  if ([STRIPE_PRICES.COACHING_MONTHLY].includes(priceId)) return "COACHING";
  return null;
}
