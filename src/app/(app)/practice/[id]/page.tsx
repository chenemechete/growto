import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { PracticeSession } from "@/components/practice/PracticeSession";

export const metadata = { title: "Practice — GrowTo" };

export default async function PracticeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  const userId = session!.user!.id!;

  const practice = await prisma.practice.findFirst({
    where: { id, userId },
  });

  if (!practice) notFound();

  return (
    <PracticeSession
      practiceId={practice.id}
      pillar={practice.pillar}
      title={practice.scenarioTitle}
      scenario={{
        setup: practice.scenarioSetup,
        trigger: practice.scenarioTrigger,
        prompt: practice.scenarioPrompt,
      }}
      difficulty={practice.difficulty}
      initialStatus={practice.status}
      initialMessages={practice.messages as Array<{ role: string; content: string; timestamp: string }>}
      initialFeedback={practice.aiFeedback as {
        score: number;
        strengths: string[];
        improvements: string[];
        nextSteps: string;
      } | null}
    />
  );
}
