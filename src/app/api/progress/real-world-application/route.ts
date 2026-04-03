import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const applicationSchema = z.object({
  practiceId: z.string().optional(),
  pillar: z.string(),
  applied: z.boolean(),
  outcome: z.enum(["successful", "challenging", "no_opportunity"]).optional(),
  description: z.string().max(500).optional(),
  context: z.enum(["family", "work", "dating", "friends", "other"]).optional(),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: { code: "UNAUTHORIZED" } }, { status: 401 });
  }

  const body = await req.json();
  const parsed = applicationSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: "VALIDATION_ERROR", message: parsed.error.issues[0].message } },
      { status: 400 }
    );
  }

  const application = await prisma.realWorldApplication.create({
    data: {
      userId: session.user.id,
      practiceId: parsed.data.practiceId,
      pillar: parsed.data.pillar as never,
      applied: parsed.data.applied,
      outcome: parsed.data.outcome,
      description: parsed.data.description,
      context: parsed.data.context,
    },
  });

  // Calculate updated success rate
  const total = await prisma.realWorldApplication.count({
    where: { userId: session.user.id, applied: true },
  });
  const successful = await prisma.realWorldApplication.count({
    where: { userId: session.user.id, outcome: "successful" },
  });
  const successRate = total > 0 ? successful / total : 0;

  return NextResponse.json(
    { applicationRecorded: true, successRate: Math.round(successRate * 100) },
    { status: 201 }
  );
}
