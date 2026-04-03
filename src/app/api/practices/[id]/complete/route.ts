import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generatePracticeFeedback } from "@/lib/openai";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: { code: "UNAUTHORIZED" } }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();

  const practice = await prisma.practice.findFirst({
    where: { id, userId: session.user.id },
  });

  if (!practice) {
    return NextResponse.json({ error: { code: "NOT_FOUND" } }, { status: 404 });
  }

  const messages = (
    practice.messages as Array<{ role: string; content: string }>
  ) ?? [];

  // Generate AI feedback
  const feedback = await generatePracticeFeedback(
    practice.pillar as never,
    {
      setup: practice.scenarioSetup,
      prompt: practice.scenarioPrompt,
    },
    messages.map((m) => ({ role: m.role as "user" | "assistant", content: m.content }))
  );

  // Calculate streak
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  yesterday.setHours(0, 0, 0, 0);
  const yesterdayEnd = new Date(yesterday.getTime() + 24 * 60 * 60 * 1000);

  const yesterdayPractice = await prisma.practice.findFirst({
    where: {
      userId: session.user.id,
      status: "COMPLETED",
      completedAt: { gte: yesterday, lt: yesterdayEnd },
    },
  });

  const latestSnapshot = await prisma.progressSnapshot.findFirst({
    where: { userId: session.user.id },
    orderBy: { snapshotDate: "desc" },
  });

  const currentStreak = yesterdayPractice
    ? (latestSnapshot?.streakDays ?? 0) + 1
    : 1;

  const practicesTotal = (latestSnapshot?.practicesTotal ?? 0) + 1;

  // Update practice as completed
  await prisma.practice.update({
    where: { id },
    data: {
      status: "COMPLETED",
      completedAt: new Date(),
      aiFeedback: feedback,
      behaviorMarkers: feedback.behaviorMarkers,
      streakDay: currentStreak,
    },
  });

  // Update progress snapshot
  await prisma.progressSnapshot.create({
    data: {
      userId: session.user.id,
      readinessScore: calculateReadinessScore(practicesTotal, feedback.score),
      pillarScores: { [practice.pillar]: feedback.score * 20 },
      behaviorMarkers: Object.entries(feedback.behaviorMarkers)
        .filter(([, v]) => v === true)
        .map(([k]) => ({ marker: k, pillar: practice.pillar })),
      streakDays: currentStreak,
      practicesTotal,
    },
  });

  return NextResponse.json({
    practiceCompleted: true,
    feedback,
    streakDays: currentStreak,
    practicesTotal,
  });
}

function calculateReadinessScore(totalPractices: number, lastScore: number): number {
  // Simple progression: 5pts base + 2pts per practice (capped at 70) + up to 20pts from score quality
  const baseFromPractices = Math.min(5 + totalPractices * 2, 70);
  const qualityBonus = Math.round((lastScore / 5) * 20);
  return Math.min(baseFromPractices + qualityBonus, 100);
}
