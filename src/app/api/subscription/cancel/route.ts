import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { z } from "zod";

const cancelSchema = z.object({
  reason: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: { code: "UNAUTHORIZED" } }, { status: 401 });
  }

  const body = await req.json();
  const { reason } = cancelSchema.parse(body);

  const subscription = await prisma.subscription.findUnique({
    where: { userId: session.user.id },
  });

  if (!subscription?.stripeSubscriptionId) {
    return NextResponse.json(
      { error: { code: "NO_SUBSCRIPTION" } },
      { status: 400 }
    );
  }

  // Cancel at period end (not immediately)
  await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
    cancel_at_period_end: true,
    metadata: { cancellation_reason: reason ?? "" },
  });

  await prisma.subscription.update({
    where: { userId: session.user.id },
    data: {
      cancelAtPeriodEnd: true,
      cancellationReason: reason,
    },
  });

  return NextResponse.json({ canceled: true, message: "Subscription will cancel at end of billing period." });
}
