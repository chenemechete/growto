import type { TriageQuestion } from "@/types";

export const TRIAGE_QUESTIONS: TriageQuestion[] = [
  // Emotional Regulation (Q1, Q2)
  {
    id: "er_1",
    pillar: "EMOTIONAL_REGULATION",
    text: "When you feel upset, how quickly can you calm yourself down?",
    options: [
      { label: "Very difficult — I stay activated for hours", value: "1", score: 1 },
      { label: "Difficult — it takes a long time", value: "2", score: 2 },
      { label: "Somewhat — depends on the situation", value: "3", score: 3 },
      { label: "Usually pretty well", value: "4", score: 4 },
      { label: "Easily — I recover quickly", value: "5", score: 5 },
    ],
  },
  {
    id: "er_2",
    pillar: "EMOTIONAL_REGULATION",
    text: "How often do you say or do things you regret when you're triggered?",
    options: [
      { label: "Very often", value: "1", score: 1 },
      { label: "Often", value: "2", score: 2 },
      { label: "Sometimes", value: "3", score: 3 },
      { label: "Rarely", value: "4", score: 4 },
      { label: "Almost never", value: "5", score: 5 },
    ],
  },

  // Communication Clarity (Q3, Q4)
  {
    id: "cc_1",
    pillar: "COMMUNICATION_CLARITY",
    text: "How comfortable are you expressing your needs in relationships?",
    options: [
      { label: "Very uncomfortable — I rarely speak up", value: "1", score: 1 },
      { label: "Uncomfortable — it's hard for me", value: "2", score: 2 },
      { label: "Somewhat comfortable", value: "3", score: 3 },
      { label: "Comfortable most of the time", value: "4", score: 4 },
      { label: "Very comfortable", value: "5", score: 5 },
    ],
  },
  {
    id: "cc_2",
    pillar: "COMMUNICATION_CLARITY",
    text: "When there's conflict, I tend to...",
    options: [
      { label: "Completely shut down and go silent", value: "shutdown", score: 1 },
      { label: "Explode or become reactive", value: "explode", score: 1 },
      { label: "Both — depends on the situation", value: "both", score: 2 },
      { label: "Get defensive but stay engaged", value: "defensive", score: 3 },
      { label: "Stay calm and work through it", value: "calm", score: 5 },
    ],
  },

  // Trust & Safety / Boundaries (Q5, Q6)
  {
    id: "ts_1",
    pillar: "TRUST_AND_SAFETY",
    text: "How easy is it for you to say 'no' without feeling guilty?",
    options: [
      { label: "Very difficult — I almost always say yes", value: "1", score: 1 },
      { label: "Difficult — guilt often follows", value: "2", score: 2 },
      { label: "Somewhat — depends on the person", value: "3", score: 3 },
      { label: "Usually easy", value: "4", score: 4 },
      { label: "Very easy — I'm clear with my limits", value: "5", score: 5 },
    ],
  },
  {
    id: "ts_2",
    pillar: "TRUST_AND_SAFETY",
    text: "Do you tend to give too much in relationships?",
    options: [
      { label: "Always — I over-give and resent it", value: "1", score: 1 },
      { label: "Often", value: "2", score: 2 },
      { label: "Sometimes", value: "3", score: 3 },
      { label: "Rarely", value: "4", score: 4 },
      { label: "Never — I feel balanced", value: "5", score: 5 },
    ],
  },

  // Values Alignment (Q7, Q8)
  {
    id: "va_1",
    pillar: "VALUES_ALIGNMENT",
    text: "How clear are you on what you truly need in a partner?",
    options: [
      { label: "Very unclear — I don't really know", value: "1", score: 1 },
      { label: "Somewhat unclear", value: "2", score: 2 },
      { label: "Somewhat clear", value: "3", score: 3 },
      { label: "Clear on most things", value: "4", score: 4 },
      { label: "Very clear — I know my non-negotiables", value: "5", score: 5 },
    ],
  },
  {
    id: "va_2",
    pillar: "VALUES_ALIGNMENT",
    text: "Do you know your core non-negotiable values?",
    options: [
      { label: "No — I've never thought about it", value: "no", score: 1 },
      { label: "Somewhat — I have a vague sense", value: "somewhat", score: 3 },
      { label: "Yes — I could name them right now", value: "yes", score: 5 },
    ],
  },

  // Relational Capacity (Q9, Q10)
  {
    id: "rc_1",
    pillar: "RELATIONAL_CAPACITY",
    text: "How ready do you feel for a committed relationship right now?",
    options: [
      { label: "Not ready at all", value: "1", score: 1 },
      { label: "Not really ready", value: "2", score: 2 },
      { label: "Somewhat ready", value: "3", score: 3 },
      { label: "Mostly ready", value: "4", score: 4 },
      { label: "Very ready", value: "5", score: 5 },
    ],
  },
  {
    id: "rc_2",
    pillar: "RELATIONAL_CAPACITY",
    text: "Are you willing to make real sacrifices for a healthy relationship?",
    options: [
      { label: "Not at all — I'm very protective of my independence", value: "1", score: 1 },
      { label: "Somewhat — it depends", value: "2", score: 2 },
      { label: "Yes, within reason", value: "3", score: 3 },
      { label: "Yes — I'm genuinely committed to this", value: "4", score: 4 },
      { label: "Absolutely — I'm all in", value: "5", score: 5 },
    ],
  },
];

// Scoring: higher score = stronger in that area. Lower score = more need.
// Primary pillar = the one with the LOWEST total score (highest need).
export function scoreTriage(answers: { questionId: string; score: number }[]): {
  pillarScores: Record<string, number>;
  primaryPillar: string;
  readinessScore: number;
} {
  const pillarTotals: Record<string, number[]> = {};

  for (const answer of answers) {
    const question = TRIAGE_QUESTIONS.find((q) => q.id === answer.questionId);
    if (!question) continue;
    if (!pillarTotals[question.pillar]) pillarTotals[question.pillar] = [];
    pillarTotals[question.pillar].push(answer.score);
  }

  const pillarScores: Record<string, number> = {};
  for (const [pillar, scores] of Object.entries(pillarTotals)) {
    const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
    pillarScores[pillar] = Math.round(avg * 20); // normalize to 0–100
  }

  // Primary pillar = lowest score (most need)
  const primaryPillar = Object.entries(pillarScores).sort(
    ([, a], [, b]) => a - b
  )[0][0];

  // Overall readiness = average of all pillar scores
  const allScores = Object.values(pillarScores);
  const readinessScore = Math.round(
    allScores.reduce((a, b) => a + b, 0) / allScores.length
  );

  return { pillarScores, primaryPillar, readinessScore };
}
