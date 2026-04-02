import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getCoachResponse } from "@/lib/openai";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response(JSON.stringify({ error: { code: "UNAUTHORIZED" } }), {
      status: 401,
    });
  }

  const { id } = await params;
  const { response: userResponse } = await req.json();

  if (!userResponse?.trim()) {
    return new Response(
      JSON.stringify({ error: { code: "EMPTY_RESPONSE" } }),
      { status: 400 }
    );
  }

  const practice = await prisma.practice.findFirst({
    where: { id, userId: session.user.id },
  });

  if (!practice) {
    return new Response(JSON.stringify({ error: { code: "NOT_FOUND" } }), {
      status: 404,
    });
  }

  const existingMessages = (
    practice.messages as Array<{ role: string; content: string; timestamp: string }>
  ) ?? [];

  // Update practice status to IN_PROGRESS
  if (practice.status === "PENDING") {
    await prisma.practice.update({
      where: { id },
      data: { status: "IN_PROGRESS", startedAt: new Date() },
    });
  }

  // Build conversation history for OpenAI
  const history = existingMessages.map((m) => ({
    role: m.role as "user" | "assistant",
    content: m.content,
  }));

  const scenario = {
    setup: practice.scenarioSetup,
    trigger: practice.scenarioTrigger,
    prompt: practice.scenarioPrompt,
  };

  const stream = await getCoachResponse(
    practice.pillar as never,
    scenario,
    history,
    userResponse
  );

  // Collect full AI response for DB persistence
  let fullAIResponse = "";

  const readable = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      try {
        for await (const chunk of stream) {
          const delta = chunk.choices[0]?.delta?.content ?? "";
          if (delta) {
            fullAIResponse += delta;
            controller.enqueue(encoder.encode(delta));
          }
        }
      } finally {
        controller.close();

        // Persist both messages to DB
        const now = new Date().toISOString();
        const updatedMessages = [
          ...existingMessages,
          { role: "user", content: userResponse, timestamp: now },
          { role: "assistant", content: fullAIResponse, timestamp: now },
        ];

        await prisma.practice.update({
          where: { id },
          data: { messages: updatedMessages },
        }).catch(console.error);
      }
    },
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache",
      "X-Accel-Buffering": "no",
    },
  });
}
