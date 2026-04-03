import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PricingTable } from "@/components/subscription/PricingTable";
import { PLANS } from "@/constants/plans";
import { ReadinessScoreRing } from "@/components/dashboard/ReadinessScoreRing";

export const metadata = { title: "Choose Your Plan — GrowTo" };

export default async function PlansPage() {
  const session = await auth();
  const userId = session?.user?.id;

  let progressData = null;
  if (userId) {
    const [snapshot, practicesCount] = await Promise.all([
      prisma.progressSnapshot.findFirst({
        where: { userId },
        orderBy: { snapshotDate: "desc" },
      }),
      prisma.practice.count({ where: { userId, status: "COMPLETED" } }),
    ]);
    progressData = { score: snapshot?.readinessScore ?? 0, practicesCount };
  }

  return (
    <div className="space-y-8">
      {/* Progress summary (social proof for paywall) */}
      {progressData && progressData.practicesCount > 0 && (
        <div className="bg-white rounded-xl border border-border p-6 text-center">
          <p className="text-sm text-muted-foreground mb-3">You&apos;ve already made real progress.</p>
          <div className="flex items-center justify-center gap-8">
            <div className="text-center">
              <ReadinessScoreRing score={progressData.score} size={80} />
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-dark">{progressData.practicesCount}</div>
              <div className="text-xs text-muted-foreground">practices completed</div>
            </div>
          </div>
          <p className="text-sm font-medium text-dark mt-3">
            Don&apos;t stop here. Keep the momentum going.
          </p>
        </div>
      )}

      <div>
        <h1 className="text-2xl font-display font-bold text-dark mb-1">Choose your plan</h1>
        <p className="text-muted-foreground text-sm">
          No credit card required for your 7-day trial. Cancel anytime.
        </p>
      </div>

      <PricingTable plans={PLANS} />

      <p className="text-xs text-center text-muted-foreground">
        Secure payment via Stripe. Cancel anytime from settings.
      </p>
    </div>
  );
}
