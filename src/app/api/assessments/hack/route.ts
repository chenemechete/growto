import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateHACKQuestions, generateHACKInsight } from "@/lib/openai";
import { z } from "zod";

// GET /api/assessments/hack?pillar=EMOTIONAL_REGULATION
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: { code: "UNAUTHORIZED" } }, { status: 401 });
  }

  const pillar = req.nextUrl.searchParams.get("pillar");
  if (!pillar) {
    return NextResponse.json({ error: { code: "MISSING_PILLAR" } }, { status: 400 });
  }

  // Check for cached HACK questions
  const existing = await prisma.assessment.findFirst({
    where: {
      userId: session.user.id,
      type: "HACK",
      pillar: pillar as never,
      completedAt: null,
    },
    orderBy: { createdAt: "desc" },
  });

  if (existing?.answers) {
    const cached = existing.answers as { questions?: unknown[] };
    if (cached.questions && Array.isArray(cached.questions)) {
      return NextResponse.json({
        assessmentId: existing.id,
        questions: cached.questions,
      });
    }
  }

  // Get triage answers for context
  const triage = await prisma.assessment.findFirst({
    where: { userId: session.user.id, type: "TRIAGE" },
    orderBy: { completedAt: "desc" },
  });

  const triageAnswers = (triage?.answers as Array<{ questionId: string; answer: string; score: number }>) ?? [];

  const questions = await generateHACKQuestions(pillar as never, triageAnswers);

  const assessment = await prisma.assessment.create({
    data: {
      userId: session.user.id,
      type: "HACK",
      pillar: pillar as never,
      answers: { questions },
    },
  });

  return NextResponse.json({ assessmentId: assessment.id, questions });
}

const hackAnswerSchema = z.object({
  assessmentId: z.string(),
  pillar: z.string(),
  answers: z.array(
    z.object({
      questionId: z.string(),
      dimension: z.string(),
      answer: z.string(),
    })
  ),
});

// POST /api/assessments/hack
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: { code: "UNAUTHORIZED" } }, { status: 401 });
  }

  const body = await req.json();
  const parsed = hackAnswerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: "VALIDATION_ERROR", message: parsed.error.issues[0].message } },
      { status: 400 }
    );
  }

  const { assessmentId, pillar, answers } = parsed.data;

  const { insightText, personalizationTags } = await generateHACKInsight(
    pillar as never,
    answers
  );

  const assessment = await prisma.assessment.update({
    where: { id: assessmentId },
    data: {
      answers: { answers },
      insightText,
      completedAt: new Date(),
    },
  });

  // Update user's onboarding status if first hack completed
  await prisma.user.update({
    where: { id: session.user.id },
    data: { onboardingDone: true },
  });

  // Seed initial progress snapshot
  await prisma.progressSnapshot.create({
    data: {
      userId: session.user.id,
      readinessScore: 0,
      pillarScores: { [pillar]: 0 },
      behaviorMarkers: [],
      streakDays: 0,
      practicesTotal: 0,
    },
  });

  return NextResponse.json({
    assessmentId: assessment.id,
    insightText,
    personalizationTags,
    nextStep: "practice",
  });
}
