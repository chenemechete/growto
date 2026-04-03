import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generatePracticeScenario } from "@/lib/openai";
import { PILLARS } from "@/constants/pillars";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: { code: "UNAUTHORIZED" } }, { status: 401 });
  }

  const userId = session.user.id;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);

  // Return today's practice if it already exists
  const existing = await prisma.practice.findFirst({
    where: {
      userId,
      scheduledFor: { gte: today, lt: tomorrow },
      status: { not: "SKIPPED" },
    },
  });

  if (existing) {
    return NextResponse.json(practiceToResponse(existing));
  }

  // Get user's primary pillar from triage
  const triage = await prisma.assessment.findFirst({
    where: { userId, type: "TRIAGE" },
    orderBy: { completedAt: "desc" },
  });

  const pillar = (triage?.primaryPillar as string) ?? "EMOTIONAL_REGULATION";
  const pillarInfo = PILLARS.find((p) => p.id === pillar) ?? PILLARS[0];

  // Determine difficulty from practice count
  const practiceCount = await prisma.practice.count({
    where: { userId, pillar: pillar as never, status: "COMPLETED" },
  });

  const difficulty =
    practiceCount >= 15 ? "advanced" : practiceCount >= 8 ? "intermediate" : "beginner";

  // Get recent scenario titles to avoid repetition
  const recentPractices = await prisma.practice.findMany({
    where: { userId, pillar: pillar as never },
    orderBy: { createdAt: "desc" },
    take: 5,
    select: { scenarioTitle: true },
  });

  // Get current focus theme based on practice count
  const themeIndex = Math.floor(practiceCount / 4) % pillarInfo.focusThemes.length;
  const focusTheme = pillarInfo.focusThemes[themeIndex];

  // Get readiness score
  const latestSnapshot = await prisma.progressSnapshot.findFirst({
    where: { userId },
    orderBy: { snapshotDate: "desc" },
  });

  const scenario = await generatePracticeScenario(pillar as never, difficulty, {
    readinessScore: latestSnapshot?.readinessScore ?? 40,
    focusTheme,
    recentScenarios: recentPractices.map((p) => p.scenarioTitle),
  });

  const practice = await prisma.practice.create({
    data: {
      userId,
      pillar: pillar as never,
      scenarioTitle: scenario.title,
      scenarioSetup: scenario.setup,
      scenarioTrigger: scenario.trigger,
      scenarioPrompt: scenario.prompt,
      difficulty,
      status: "PENDING",
      messages: [],
      scheduledFor: today,
    },
  });

  return NextResponse.json(practiceToResponse(practice));
}

function practiceToResponse(practice: {
  id: string;
  pillar: string;
  scenarioTitle: string;
  scenarioSetup: string;
  scenarioTrigger: string;
  scenarioPrompt: string;
  difficulty: string;
  status: string;
  scheduledFor: Date;
}) {
  return {
    id: practice.id,
    pillar: practice.pillar,
    title: practice.scenarioTitle,
    scenario: {
      setup: practice.scenarioSetup,
      trigger: practice.scenarioTrigger,
      prompt: practice.scenarioPrompt,
    },
    difficulty: practice.difficulty,
    status: practice.status,
    scheduledFor: practice.scheduledFor.toISOString(),
  };
}
