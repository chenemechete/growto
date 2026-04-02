import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PILLARS } from "@/constants/pillars";
import { ReadinessScoreRing } from "@/components/dashboard/ReadinessScoreRing";
import { StreakCounter } from "@/components/dashboard/StreakCounter";
import { BehaviorMarkerList } from "@/components/dashboard/BehaviorMarkerList";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { formatRelativeTime, pillarLabel } from "@/lib/utils";

export const metadata = { title: "Dashboard — GrowTo" };

export default async function DashboardPage() {
  const session = await auth();
  const userId = session!.user!.id!;

  const [triage, latestSnapshot, firstSnapshot, practicesThisWeek, recentPractices, appsThisWeek] =
    await Promise.all([
      prisma.assessment.findFirst({
        where: { userId, type: "TRIAGE" },
        orderBy: { completedAt: "desc" },
      }),
      prisma.progressSnapshot.findFirst({
        where: { userId },
        orderBy: { snapshotDate: "desc" },
      }),
      prisma.progressSnapshot.findFirst({
        where: { userId },
        orderBy: { snapshotDate: "asc" },
      }),
      prisma.practice.count({
        where: {
          userId,
          status: "COMPLETED",
          completedAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
        },
      }),
      prisma.practice.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 5,
        select: { id: true, scenarioTitle: true, completedAt: true, status: true },
      }),
      prisma.realWorldApplication.count({
        where: { userId, loggedAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } },
      }),
    ]);

  const pillar = (triage?.primaryPillar as string) ?? "EMOTIONAL_REGULATION";
  const pillarInfo = PILLARS.find((p) => p.id === pillar) ?? PILLARS[0];
  const totalPractices = latestSnapshot?.practicesTotal ?? 0;
  const themeIndex = Math.floor(totalPractices / 4) % pillarInfo.focusThemes.length;
  const focusTheme = pillarInfo.focusThemes[themeIndex];
  const readinessScore = latestSnapshot?.readinessScore ?? 0;
  const baseline = firstSnapshot?.readinessScore ?? 0;

  // Today's practice
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayPractice = await prisma.practice.findFirst({
    where: {
      userId,
      scheduledFor: { gte: today },
      status: { not: "SKIPPED" },
    },
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Badge variant="secondary" className="mb-2">{pillarInfo.label}</Badge>
        <h1 className="text-2xl font-display font-bold text-dark">Your Journey</h1>
        <p className="text-sm text-muted-foreground mt-1">Week focus: {focusTheme}</p>
      </div>

      {/* Readiness Score Ring */}
      <Card>
        <CardContent className="flex flex-col items-center py-8">
          <ReadinessScoreRing score={readinessScore} baseline={baseline} size={160} />
          <p className="mt-3 text-sm text-muted-foreground">
            Readiness Score
            {baseline > 0 && readinessScore > baseline && (
              <span className="text-sage-dark font-medium ml-1">
                (+{readinessScore - baseline} from start)
              </span>
            )}
          </p>
        </CardContent>
      </Card>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-dark">{practicesThisWeek}</div>
            <div className="text-xs text-muted-foreground mt-0.5">Practices this week</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <StreakCounter days={latestSnapshot?.streakDays ?? 0} />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-dark">{appsThisWeek}</div>
            <div className="text-xs text-muted-foreground mt-0.5">Real-world applications</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-dark">{totalPractices}</div>
            <div className="text-xs text-muted-foreground mt-0.5">Total practices</div>
          </CardContent>
        </Card>
      </div>

      {/* Today's practice CTA */}
      <Card className="border-terracotta/20 bg-terracotta/5">
        <CardContent className="p-5">
          <h3 className="font-semibold text-dark mb-1">
            {todayPractice?.status === "COMPLETED" ? "✅ Practice complete!" : "Today's Practice"}
          </h3>
          {todayPractice?.status === "COMPLETED" ? (
            <p className="text-sm text-muted-foreground mb-3">
              Nice work. Apply what you practiced in real life today.
            </p>
          ) : (
            <p className="text-sm text-muted-foreground mb-3">
              {todayPractice
                ? `"${todayPractice.scenarioTitle}"`
                : "Your daily practice is ready"}
            </p>
          )}
          {todayPractice?.status !== "COMPLETED" && (
            <Button asChild size="sm">
              <Link href={todayPractice ? `/practice/${todayPractice.id}` : "/practice"}>
                {todayPractice ? "Continue practice →" : "Start practice →"}
              </Link>
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Behavior markers */}
      {latestSnapshot && (
        <BehaviorMarkerList markers={latestSnapshot.behaviorMarkers as never[]} />
      )}

      {/* Recent activity */}
      {recentPractices.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-2">
            {recentPractices.map((p) => (
              <Link
                key={p.id}
                href={`/practice/${p.id}`}
                className="flex items-center justify-between py-2 border-b border-border last:border-0 hover:text-terracotta transition-colors"
              >
                <span className="text-sm truncate flex-1">{p.scenarioTitle}</span>
                <span className="text-xs text-muted-foreground ml-2 shrink-0">
                  {p.completedAt ? formatRelativeTime(p.completedAt) : p.status.toLowerCase()}
                </span>
              </Link>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
