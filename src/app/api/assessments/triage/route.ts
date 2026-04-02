import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { scoreTriage, TRIAGE_QUESTIONS } from "@/constants/questions";
import { PILLARS } from "@/constants/pillars";
import { z } from "zod";

const triageAnswerSchema = z.object({
  answers: z.array(
    z.object({
      questionId: z.string(),
      answer: z.string(),
      score: z.number().min(1).max(5),
    })
  ).min(8).max(10),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: { code: "UNAUTHORIZED" } }, { status: 401 });
  }

  const body = await req.json();
  const parsed = triageAnswerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: "VALIDATION_ERROR", message: parsed.error.issues[0].message } },
      { status: 400 }
    );
  }

  const { answers } = parsed.data;
  const { pillarScores, primaryPillar, readinessScore } = scoreTriage(answers);

  const pillarInfo = PILLARS.find((p) => p.id === primaryPillar);
  const insightText = generateInsight(primaryPillar, readinessScore);

  const assessment = await prisma.assessment.create({
    data: {
      userId: session.user.id,
      type: "TRIAGE",
      pillar: primaryPillar as never,
      answers,
      readinessScore,
      primaryPillar: primaryPillar as never,
      insightText,
      completedAt: new Date(),
    },
  });

  return NextResponse.json({
    assessmentId: assessment.id,
    primaryPillar,
    readinessScore,
    insightText,
    pillarLabel: pillarInfo?.label ?? primaryPillar,
    pillarScores,
  });
}

function generateInsight(pillar: string, score: number): string {
  const insights: Record<string, string> = {
    EMOTIONAL_REGULATION:
      "You tend to feel overwhelmed when emotions run high, and you sometimes react before thinking. This is common for people who didn't learn emotional regulation skills growing up. The good news? These are learnable skills you can practice and build.",
    COMMUNICATION_CLARITY:
      "Expressing your needs and navigating conflict clearly is something you're still developing. Many people struggle with this — it's not about intelligence, it's about practice. With daily rehearsal, you can build real confidence here.",
    TRUST_AND_SAFETY:
      "Setting limits and protecting your own needs without guilt is an area of growth for you. Boundaries aren't walls — they're doors you control. This is a skill you can strengthen one practice at a time.",
    VALUES_ALIGNMENT:
      "Getting clear on what you truly need in a partner — and recognizing misalignment early — is something to develop. When your values are clear, decisions become much easier. Let's sharpen that clarity.",
    RELATIONAL_CAPACITY:
      "Building the readiness and commitment mindset for a healthy relationship is where you have the most room to grow. This isn't about wanting relationships less — it's about preparing more intentionally for one.",
  };
  return (
    insights[pillar] ??
    "You have clear areas to develop. The good news: these are skills, not fixed traits. Daily practice changes the brain."
  );
}
