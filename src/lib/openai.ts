import OpenAI from "openai";
import { z } from "zod";
import type { GrowthPillar } from "@/types";
import { getPillar } from "@/constants/pillars";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export { openai };

// ─── HACK Question Generation ─────────────────────────────────────────────────

const HACKQuestionsSchema = z.object({
  questions: z.array(
    z.object({
      id: z.string(),
      dimension: z.enum(["history", "agency", "context", "knowledge"]),
      text: z.string(),
      type: z.enum(["multiple_choice", "likert", "open_text"]),
      options: z
        .array(
          z.object({
            label: z.string(),
            value: z.string(),
            score: z.number(),
          })
        )
        .optional(),
    })
  ),
});

export async function generateHACKQuestions(
  pillar: GrowthPillar,
  triageAnswers: { questionId: string; answer: string; score: number }[]
) {
  const pillarInfo = getPillar(pillar);
  const avgScore =
    triageAnswers.reduce((a, b) => a + b.score, 0) / triageAnswers.length;

  const completion = await openai.chat.completions.create({
    model: "gpt-4-turbo",
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `You are a relationship skills assessment expert. Generate a HACK (History, Agency, Context, Knowledge) deep-dive assessment for the growth area: "${pillarInfo.label}".

Generate 10 questions that cover all 4 HACK dimensions (2-3 per dimension). Mix question types: multiple_choice, likert (1-5 scale), and 1-2 open_text.

Return JSON matching this schema:
{
  "questions": [
    {
      "id": "h1",
      "dimension": "history",
      "text": "Question text",
      "type": "multiple_choice",
      "options": [
        { "label": "Option label", "value": "value", "score": 1-5 }
      ]
    }
  ]
}

For likert questions, always use 5 options scored 1-5.
For open_text questions, omit the options field.
Make questions specific to ${pillarInfo.label} and relevant to singles ages 25-45.
The user's baseline readiness for this area is ${avgScore.toFixed(1)}/5 — calibrate question depth accordingly.`,
      },
      {
        role: "user",
        content: `Generate the HACK assessment for ${pillarInfo.label}.`,
      },
    ],
    max_tokens: 1500,
  });

  const raw = JSON.parse(completion.choices[0].message.content ?? "{}");
  return HACKQuestionsSchema.parse(raw).questions;
}

// ─── Practice Scenario Generation ─────────────────────────────────────────────

const ScenarioSchema = z.object({
  title: z.string(),
  setup: z.string(),
  trigger: z.string(),
  prompt: z.string(),
});

export async function generatePracticeScenario(
  pillar: GrowthPillar,
  difficulty: "beginner" | "intermediate" | "advanced",
  userContext: {
    readinessScore: number;
    focusTheme: string;
    recentScenarios?: string[];
  }
) {
  const pillarInfo = getPillar(pillar);

  const completion = await openai.chat.completions.create({
    model: "gpt-4-turbo",
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `You are a relationship skills coach creating a daily practice scenario.

Growth area: ${pillarInfo.label}
Focus theme: ${userContext.focusTheme}
Difficulty: ${difficulty}
User readiness score: ${userContext.readinessScore}/100

DIFFICULTY GUIDELINES:
- beginner: Low-stakes situations (texting, casual interactions). Clear right/wrong responses. Focus on building confidence.
- intermediate: Medium-stakes (family, friends, early dating). Ambiguous situations. No perfect answer.
- advanced: High-stakes (serious conversations, major conflicts). Complex emotional dynamics. AI may be defensive or dismissive.

Create a realistic, relatable scenario for a single adult aged 25-45. The scenario should require practicing ${pillarInfo.label}.

Return JSON:
{
  "title": "Short scenario title (5-8 words)",
  "setup": "Context-setting description (2-3 sentences)",
  "trigger": "The moment that activates the pattern (1 sentence)",
  "prompt": "What the user should practice (1 sentence, starting with 'Practice...')"
}

${userContext.recentScenarios?.length ? `Avoid repeating these recent scenarios: ${userContext.recentScenarios.join(", ")}` : ""}`,
      },
      {
        role: "user",
        content: "Generate today's practice scenario.",
      },
    ],
    max_tokens: 400,
    temperature: 0.9,
  });

  const raw = JSON.parse(completion.choices[0].message.content ?? "{}");
  return ScenarioSchema.parse(raw);
}

// ─── AI Coach Response ─────────────────────────────────────────────────────────

export async function getCoachResponse(
  pillar: GrowthPillar,
  scenario: { setup: string; trigger: string; prompt: string },
  conversationHistory: { role: "user" | "assistant"; content: string }[],
  userResponse: string
) {
  const pillarInfo = getPillar(pillar);

  const messages: OpenAI.ChatCompletionMessageParam[] = [
    {
      role: "system",
      content: `You are playing a realistic character in a relationship practice scenario. The user is practicing: ${pillarInfo.label}.

SCENARIO:
${scenario.setup}
${scenario.trigger}

Your role: Respond as the OTHER PERSON in this scenario — realistically, not as a therapist. Keep responses short (1-3 sentences). React authentically to what the user says. If they respond well, acknowledge it naturally. If they're reactive or anxious, respond matter-of-factly without feeding the anxiety.

Stay in character. Do not give coaching advice — that comes after the conversation ends.`,
    },
    ...conversationHistory.map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    })),
    { role: "user" as const, content: userResponse },
  ];

  return openai.chat.completions.create({
    model: "gpt-4-turbo",
    messages,
    max_tokens: 150,
    temperature: 0.85,
    stream: true,
  });
}

// ─── Practice Feedback Generation ─────────────────────────────────────────────

const FeedbackSchema = z.object({
  score: z.number().min(1).max(5),
  strengths: z.array(z.string()),
  improvements: z.array(z.string()),
  nextSteps: z.string(),
  behaviorMarkers: z.record(z.boolean()),
});

export async function generatePracticeFeedback(
  pillar: GrowthPillar,
  scenario: { setup: string; prompt: string },
  conversation: { role: "user" | "assistant"; content: string }[]
) {
  const pillarInfo = getPillar(pillar);
  const userMessages = conversation
    .filter((m) => m.role === "user")
    .map((m) => m.content)
    .join("\n---\n");

  const completion = await openai.chat.completions.create({
    model: "gpt-4-turbo",
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `You are a relationship skills coach reviewing a practice session for: ${pillarInfo.label}.

SCENARIO: ${scenario.setup}
GOAL: ${scenario.prompt}

Analyze the user's responses and provide coaching feedback.

Return JSON:
{
  "score": 1-5,
  "strengths": ["2-3 specific things they did well"],
  "improvements": ["1-2 specific things to try differently next time"],
  "nextSteps": "One actionable takeaway for real life (1-2 sentences)",
  "behaviorMarkers": {
    "pauseDetected": true/false,
    "selfAwarenessShown": true/false,
    "iStatementUsed": true/false,
    "boundarySet": true/false,
    "calmTone": true/false,
    "overshared": true/false
  }
}

Be encouraging and specific. Reference what they actually wrote. Normalize struggle — this is practice.`,
      },
      {
        role: "user",
        content: `User responses:\n${userMessages}`,
      },
    ],
    max_tokens: 600,
  });

  const raw = JSON.parse(completion.choices[0].message.content ?? "{}");
  return FeedbackSchema.parse(raw);
}

// ─── HACK Insight Generation ──────────────────────────────────────────────────

export async function generateHACKInsight(
  pillar: GrowthPillar,
  answers: { questionId: string; dimension: string; answer: string }[]
): Promise<{ insightText: string; personalizationTags: string[] }> {
  const pillarInfo = getPillar(pillar);

  const completion = await openai.chat.completions.create({
    model: "gpt-4-turbo",
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `You are analyzing a HACK assessment (History, Agency, Context, Knowledge) for: ${pillarInfo.label}.

Based on the user's answers, write a personalized insight paragraph (3-4 sentences) and identify 3-5 personalization tags.

Return JSON:
{
  "insightText": "Personalized insight about their patterns in this area...",
  "personalizationTags": ["anxious_attachment", "high_stress_context", "growth_mindset"]
}

Be empathetic and specific. Don't be clinical. Normalize their experience.`,
      },
      {
        role: "user",
        content: `Assessment answers:\n${JSON.stringify(answers, null, 2)}`,
      },
    ],
    max_tokens: 400,
  });

  const raw = JSON.parse(completion.choices[0].message.content ?? "{}");
  return raw as { insightText: string; personalizationTags: string[] };
}
