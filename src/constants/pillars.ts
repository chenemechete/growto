import type { GrowthPillar } from "@/types";

export interface PillarInfo {
  id: GrowthPillar;
  label: string;
  shortLabel: string;
  description: string;
  icon: string;
  color: string;
  focusThemes: string[];
}

export const PILLARS: PillarInfo[] = [
  {
    id: "EMOTIONAL_REGULATION",
    label: "Emotional Regulation",
    shortLabel: "Emotions",
    description:
      "Learn to notice, name, and manage your emotional responses before they control your reactions.",
    icon: "🌊",
    color: "#E07A5F",
    focusThemes: [
      "Noticing your triggers",
      "Pausing before reacting",
      "Naming emotions accurately",
      "Self-soothing under stress",
      "Returning to calm",
    ],
  },
  {
    id: "COMMUNICATION_CLARITY",
    label: "Communication Clarity",
    shortLabel: "Communication",
    description:
      "Express your needs clearly, listen deeply, and navigate conflict without shutting down or exploding.",
    icon: "💬",
    color: "#96D79C",
    focusThemes: [
      "Using 'I' statements",
      "Asking vs. assuming",
      "Staying present in conflict",
      "Expressing needs directly",
      "Listening without defending",
    ],
  },
  {
    id: "TRUST_AND_SAFETY",
    label: "Trust & Safety",
    shortLabel: "Boundaries",
    description:
      "Build healthy boundaries, say no without guilt, and create safety in your relationships.",
    icon: "🛡️",
    color: "#A8C4E0",
    focusThemes: [
      "Saying no without over-explaining",
      "Recognizing boundary violations",
      "Trusting your own judgment",
      "Asking for what you need",
      "Repair after rupture",
    ],
  },
  {
    id: "VALUES_ALIGNMENT",
    label: "Values Alignment",
    shortLabel: "Values",
    description:
      "Clarify what you need in a partner, recognize misalignment early, and make decisions from your core values.",
    icon: "🧭",
    color: "#F2CC8F",
    focusThemes: [
      "Defining your non-negotiables",
      "Spotting early red flags",
      "Decision-making from values",
      "Articulating what you want",
      "Holding standards gracefully",
    ],
  },
  {
    id: "RELATIONAL_CAPACITY",
    label: "Relational Capacity",
    shortLabel: "Capacity",
    description:
      "Develop the readiness, commitment mindset, and sacrifice-willingness that healthy relationships require.",
    icon: "🤝",
    color: "#C4A8E0",
    focusThemes: [
      "Thinking long-term",
      "Balancing give and receive",
      "Staying through discomfort",
      "Vulnerability without fear",
      "Commitment vs. avoidance",
    ],
  },
];

export const getPillar = (id: GrowthPillar): PillarInfo =>
  PILLARS.find((p) => p.id === id) ?? PILLARS[0];
