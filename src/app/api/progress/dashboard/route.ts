import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PILLARS } from "@/constants/pillars";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: { code: "UNAUTHORIZED" } }, { status: 401 });
  }

  const userId = session.user.id;

  // Get primary pillar
  const triage = await prisma.assessment.findFirst({
    where: { userId, type: "TRIAGE" },
    orderBy: { completedAt: "desc" },
  });
  const pillar = (triage?.primaryPillar as string) ?? "EMOTIONAL_REGULATION";
  const pillarInfo = PILLARS.find((p) => p.id === pillar) ?? PILLARS[0];

  // Get latest snapshot
  const latestSnapshot = await prisma.progressSnapshot.findFirst({
    where: { userId },
    orderBy: { snapshotDate: "desc" },
  });

  const firstSnapshot = await prisma.progressSnapshot.findFirst({
    where: { userId },
    orderBy: { snapshotDate: "asc" },
  });

  // Practices this week
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const practicesThisWeek = await prisma.practice.count({
    where: { userId, status: "COMPLETED", completedAt: { gte: weekAgo } },
  });

  // Real-world applications this week
  const recentApplications = await prisma.realWorldApplication.count({
    where: { userId, loggedAt: { gte: weekAgo } },
  });

  // Recent practices
  const recentPractices = await prisma.practice.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 5,
    select: {
      id: true,
      scenarioTitle: true,
      completedAt: true,
      status: true,
    },
  });

  // Behavior markers highlight
  const markers = (latestSnapshot?.behaviorMarkers as Array<{ marker: string; count?: number }>) ?? [];
  const topMarker = markers[0];
  const behaviorHighlight = topMarker
    ? `${topMarker.marker.replace(/_/g, " ")}: detected`
    : "Start practicing to unlock insights";

  // Focus theme based on practice count
  const practicesTotal = latestSnapshot?.practicesTotal ?? 0;
  const themeIndex = Math.floor(practicesTotal / 4) % pillarInfo.focusThemes.length;
  const focusTheme = pillarInfo.focusThemes[themeIndex];

  return NextResponse.json({
    currentPillar: pillar,
    pillarLabel: pillarInfo.label,
    focusTheme,
    readinessScore: latestSnapshot?.readinessScore ?? 0,
    readinessScoreBaseline: firstSnapshot?.readinessScore ?? 0,
    stats: {
      practicesThisWeek,
      streakDays: latestSnapshot?.streakDays ?? 0,
      realWorldApplications: recentApplications,
      behaviorMarkerHighlight: behaviorHighlight,
    },
    recentPractices: recentPractices.map((p) => ({
      id: p.id,
      title: p.scenarioTitle,
      completedAt: p.completedAt?.toISOString() ?? null,
      status: p.status,
    })),
  });
}
