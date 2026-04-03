import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ReadinessScoreRing } from "@/components/dashboard/ReadinessScoreRing";
import { BehaviorMarkerList } from "@/components/dashboard/BehaviorMarkerList";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getPillar } from "@/constants/pillars";
import Link from "next/link";

export const metadata = { title: "Your Progress — GrowTo" };

export default async function ProgressPage() {
  const session = await auth();
  const userId = session!.user!.id!;

  const [triage, snapshots, applications, practices] = await Promise.all([
    prisma.assessment.findFirst({
      where: { userId, type: "TRIAGE" },
      orderBy: { completedAt: "desc" },
    }),
    prisma.progressSnapshot.findMany({
      where: { userId },
      orderBy: { snapshotDate: "asc" },
      take: 30,
    }),
    prisma.realWorldApplication.findMany({
      where: { userId },
      orderBy: { loggedAt: "desc" },
      take: 10,
    }),
    prisma.practice.findMany({
      where: { userId, status: "COMPLETED" },
      orderBy: { completedAt: "desc" },
      take: 21,
    }),
  ]);

  const pillar = (triage?.primaryPillar as string) ?? "EMOTIONAL_REGULATION";
  const pillarInfo = getPillar(pillar as never);
  const latest = snapshots[snapshots.length - 1];
  const first = snapshots[0];
  const scoreDelta = latest && first ? latest.readinessScore - first.readinessScore : 0;

  const successfulApps = applications.filter((a) => a.outcome === "successful").length;
  const totalApps = applications.filter((a) => a.applied).length;
  const successRate = totalApps > 0 ? Math.round((successfulApps / totalApps) * 100) : 0;

  // Practice grid (21 sessions = full circle)
  const completedCount = practices.length;

  return (
    <div className="space-y-6">
      <div>
        <Badge variant="secondary" className="mb-2">{pillarInfo.label}</Badge>
        <h1 className="text-2xl font-display font-bold text-dark">Your Progress</h1>
      </div>

      {/* Score section */}
      <Card>
        <CardContent className="flex flex-col items-center py-8 space-y-3">
          <ReadinessScoreRing
            score={latest?.readinessScore ?? 0}
            baseline={first?.readinessScore ?? 0}
            size={160}
          />
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Readiness Score</p>
            {scoreDelta > 0 && (
              <p className="text-sm font-medium text-sage-dark mt-0.5">
                +{scoreDelta} since you started
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Practice progress toward milestone */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Practice Progress</CardTitle>
          <p className="text-xs text-muted-foreground">
            {completedCount}/21 practices to reach next milestone
          </p>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-7 gap-1.5">
            {Array.from({ length: 21 }).map((_, i) => (
              <div
                key={i}
                className={`aspect-square rounded-md transition-colors ${
                  i < completedCount
                    ? "bg-terracotta"
                    : "bg-muted"
                }`}
                aria-label={i < completedCount ? `Practice ${i + 1} complete` : `Practice ${i + 1} pending`}
              />
            ))}
          </div>
          {completedCount >= 21 && (
            <p className="text-sm text-sage-dark font-medium mt-3">
              🎉 Milestone reached! You can now unlock a new growth area.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Real-world applications */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Real-World Applications</CardTitle>
        </CardHeader>
        <CardContent className="pt-0 space-y-3">
          <div className="flex gap-4">
            <div className="text-center flex-1">
              <div className="text-2xl font-bold text-dark">{totalApps}</div>
              <div className="text-xs text-muted-foreground">Times applied</div>
            </div>
            <div className="text-center flex-1">
              <div className="text-2xl font-bold text-dark">{successRate}%</div>
              <div className="text-xs text-muted-foreground">Success rate</div>
            </div>
            <div className="text-center flex-1">
              <div className="text-2xl font-bold text-dark">{successfulApps}</div>
              <div className="text-xs text-muted-foreground">Successful</div>
            </div>
          </div>

          {applications.length > 0 && (
            <div className="space-y-2 mt-2">
              {applications.slice(0, 5).map((app) => (
                <div
                  key={app.id}
                  className="flex items-center gap-3 p-3 bg-muted/40 rounded-lg"
                >
                  <span
                    className={`w-2 h-2 rounded-full shrink-0 ${
                      app.outcome === "successful"
                        ? "bg-sage-dark"
                        : app.outcome === "challenging"
                        ? "bg-orange-400"
                        : "bg-muted-foreground"
                    }`}
                    aria-hidden
                  />
                  <p className="text-sm text-dark flex-1 truncate">
                    {app.description ?? `${app.context ?? "General"} situation`}
                  </p>
                </div>
              ))}
            </div>
          )}

          {applications.length === 0 && (
            <div className="text-center py-6">
              <p className="text-sm text-muted-foreground">
                Complete a practice and log when you use the skill in real life.
              </p>
              <Button asChild size="sm" className="mt-3">
                <Link href="/practice">Start practicing</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Behavior markers */}
      {latest && (
        <BehaviorMarkerList markers={latest.behaviorMarkers as never[]} />
      )}
    </div>
  );
}
