import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { stripe, STRIPE_PRICES } from "@/lib/stripe";
import { z } from "zod";

const createSchema = z.object({
  tier: z.enum(["BASIC", "PREMIUM", "COACHING"]),
  interval: z.enum(["month", "year"]),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id || !session?.user?.email) {
    return NextResponse.json({ error: { code: "UNAUTHORIZED" } }, { status: 401 });
  }

  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: { code: "VALIDATION_ERROR" } }, { status: 400 });
  }

  const { tier, interval } = parsed.data;

  // Determine price ID
  const priceKey = `${tier}_${interval.toUpperCase()}` as keyof typeof STRIPE_PRICES;
  const priceId = STRIPE_PRICES[priceKey];
  if (!priceId) {
    return NextResponse.json({ error: { code: "INVALID_PRICE" } }, { status: 400 });
  }

  // Get or create Stripe customer
  let subscription = await prisma.subscription.findUnique({
    where: { userId: session.user.id },
  });

  let customerId = subscription?.stripeCustomerId;

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: session.user.email,
      name: session.user.name ?? undefined,
      metadata: { userId: session.user.id },
    });
    customerId = customer.id;

    await prisma.subscription.upsert({
      where: { userId: session.user.id },
      update: { stripeCustomerId: customerId },
      create: {
        userId: session.user.id,
        tier: "FREE",
        status: "TRIALING",
        stripeCustomerId: customerId,
      },
    });
  }

  const checkoutSession = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${process.env.NEXTAUTH_URL}/dashboard?upgraded=true`,
    cancel_url: `${process.env.NEXTAUTH_URL}/plans`,
    metadata: { userId: session.user.id, tier, interval },
    subscription_data: {
      metadata: { userId: session.user.id, tier },
    },
  });

  return NextResponse.json({ url: checkoutSession.url });
}
