export type GrowthPillar =
  | "EMOTIONAL_REGULATION"
  | "COMMUNICATION_CLARITY"
  | "TRUST_AND_SAFETY"
  | "VALUES_ALIGNMENT"
  | "RELATIONAL_CAPACITY";

export type SubscriptionTier = "FREE" | "BASIC" | "PREMIUM" | "COACHING";

export type PracticeStatus = "PENDING" | "IN_PROGRESS" | "COMPLETED" | "SKIPPED";

export interface TriageQuestion {
  id: string;
  text: string;
  pillar: GrowthPillar;
  options: { label: string; value: string; score: number }[];
}

export interface TriageAnswer {
  questionId: string;
  answer: string;
  score: number;
}

export interface TriageResult {
  assessmentId: string;
  primaryPillar: GrowthPillar;
  readinessScore: number;
  insightText: string;
  pillarScores: Record<GrowthPillar, number>;
}

export interface HACKQuestion {
  id: string;
  dimension: "history" | "agency" | "context" | "knowledge";
  text: string;
  type: "multiple_choice" | "likert" | "open_text";
  options?: { label: string; value: string; score: number }[];
}

export interface PracticeScenario {
  id: string;
  pillar: GrowthPillar;
  title: string;
  setup: string;
  trigger: string;
  prompt: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  status: PracticeStatus;
  scheduledFor: string;
}

export interface PracticeMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export interface AIFeedback {
  score: number; // 1–5
  strengths: string[];
  improvements: string[];
  nextSteps: string;
}

export interface DashboardData {
  currentPillar: GrowthPillar;
  focusTheme: string;
  readinessScore: number;
  readinessScoreBaseline: number;
  stats: {
    practicesThisWeek: number;
    streakDays: number;
    realWorldApplications: number;
    behaviorMarkerHighlight: string;
  };
  recentPractices: {
    id: string;
    title: string;
    completedAt: string | null;
    status: PracticeStatus;
  }[];
}

export interface Plan {
  tier: SubscriptionTier;
  name: string;
  priceMonthly: number;
  priceYearly: number;
  features: string[];
  highlighted?: boolean;
  stripePriceIdMonthly: string;
  stripePriceIdYearly: string;
}
