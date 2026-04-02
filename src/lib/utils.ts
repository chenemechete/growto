import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

export function formatRelativeTime(date: Date | string): string {
  const now = new Date();
  const target = new Date(date);
  const diffMs = now.getTime() - target.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  return formatDate(date);
}

export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

export function pillarLabel(pillar: string): string {
  const labels: Record<string, string> = {
    EMOTIONAL_REGULATION: "Emotional Regulation",
    COMMUNICATION_CLARITY: "Communication Clarity",
    TRUST_AND_SAFETY: "Trust & Safety",
    VALUES_ALIGNMENT: "Values Alignment",
    RELATIONAL_CAPACITY: "Relational Capacity",
  };
  return labels[pillar] ?? pillar;
}
