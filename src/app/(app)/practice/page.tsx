import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getPillar } from "@/constants/pillars";
import Link from "next/link";
import { formatRelativeTime } from "@/lib/utils";

export const metadata = { title: "Practice — GrowTo" };

export default async function PracticePage() {
  const session = await auth();
  const userId = session!.user!.id!;

  // Check subscription for paywall
  const subscription = await prisma.subscription.findUnique({
    where: { userId },
  });
  const totalCompleted = await prisma.practice.count({
    where: { userId, status: "COMPLETED" },
  });
  const isFree = !subscription || subscription.tier === "FREE";
  const hitPaywall = isFree && totalCompleted >= 3;

  if (hitPaywall) {
    redirect("/plans?reason=practice_limit");
  }

  // Get today's practice
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayPractice = await prisma.practice.findFirst({
    where: {
      userId,
      scheduledFor: { gte: today },
      status: { not: "SKIPPED" },
    },
  });

  // Get triage for pillar info
  const triage = await prisma.assessment.findFirst({
    where: { userId, type: "TRIAGE" },
    orderBy: { completedAt: "desc" },
  });
  const pillar = (triage?.primaryPillar as string) ?? "EMOTIONAL_REGULATION";
  const pillarInfo = getPillar(pillar as never);

  // Recent practices
  const recent = await prisma.practice.findMany({
    where: { userId, status: "COMPLETED" },
    orderBy: { completedAt: "desc" },
    take: 5,
  });

  return (
    <div className="space-y-6">
      <div>
        <Badge variant="secondary" className="mb-2">{pillarInfo.label}</Badge>
        <h1 className="text-2xl font-display font-bold text-dark">Practice</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Daily scenarios tailored to your growth area
        </p>
      </div>

      {/* Today's practice */}
      <Card className="border-terracotta/20 bg-gradient-to-br from-white to-terracotta/5">
        <CardContent className="p-6 space-y-4">
          {todayPractice ? (
            <>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground mb-1">Today&apos;s scenario</p>
                  <h3 className="font-semibold text-dark">{todayPractice.scenarioTitle}</h3>
                </div>
                <Badge variant={todayPractice.status === "COMPLETED" ? "secondary" : "default"}>
                  {todayPractice.status === "COMPLETED" ? "Done" : "Ready"}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {todayPractice.scenarioSetup}
              </p>
              {todayPractice.status !== "COMPLETED" ? (
                <Button asChild className="w-full">
                  <Link href={`/practice/${todayPractice.id}`}>
                    {todayPractice.status === "IN_PROGRESS" ? "Continue practice" : "Start practice"}
                  </Link>
                </Button>
              ) : (
                <p className="text-sm text-sage-dark font-medium">
                  ✓ Great work! Check back tomorrow for a new practice.
                </p>
              )}
            </>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">
                Your daily practice is being generated based on your growth area.
              </p>
              <Button asChild className="w-full">
                <Link href="/practice/new">Generate today&apos;s practice</Link>
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {/* Recent practices */}
      {recent.length > 0 && (
        <div>
          <h2 className="text-base font-semibold text-dark mb-3">Recent Practices</h2>
          <div className="space-y-2">
            {recent.map((p) => (
              <Link
                key={p.id}
                href={`/practice/${p.id}`}
                className="flex items-center justify-between p-4 bg-white rounded-lg border border-border hover:border-terracotta/30 transition-colors cursor-pointer"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-dark truncate">{p.scenarioTitle}</p>
                  <p className="text-xs text-muted-foreground capitalize">{p.difficulty}</p>
                </div>
                <span className="text-xs text-muted-foreground ml-2 shrink-0">
                  {p.completedAt ? formatRelativeTime(p.completedAt) : ""}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {recent.length === 0 && !todayPractice && (
        <div className="text-center py-12 text-muted-foreground">
          <div className="text-4xl mb-3" aria-hidden>💬</div>
          <p className="font-medium text-dark">Ready to begin</p>
          <p className="text-sm mt-1">Complete your first practice above</p>
        </div>
      )}
    </div>
  );
}
