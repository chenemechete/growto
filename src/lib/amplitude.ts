"use client";

import * as amplitude from "@amplitude/analytics-browser";

let initialized = false;

export function initAmplitude() {
  if (initialized || typeof window === "undefined") return;
  const apiKey = process.env.NEXT_PUBLIC_AMPLITUDE_API_KEY;
  if (!apiKey) return;
  amplitude.init(apiKey, { defaultTracking: true });
  initialized = true;
}

export function trackEvent(
  eventName: string,
  properties?: Record<string, string | number | boolean>
) {
  if (typeof window === "undefined") return;
  amplitude.track(eventName, properties);
}

export function identifyUser(userId: string, traits?: Record<string, string | number | boolean>) {
  if (typeof window === "undefined") return;
  amplitude.setUserId(userId);
  if (traits) {
    const identify = new amplitude.Identify();
    for (const [key, value] of Object.entries(traits)) {
      identify.set(key, value);
    }
    amplitude.identify(identify);
  }
}

// Named event helpers
export const analytics = {
  signupCompleted: (method: string) =>
    trackEvent("signup_completed", { method }),
  onboardingCompleted: () => trackEvent("onboarding_completed"),
  triageCompleted: (pillar: string, score: number) =>
    trackEvent("triage_completed", { primary_pillar: pillar, readiness_score: score }),
  hackCompleted: (pillar: string) =>
    trackEvent("hack_completed", { pillar }),
  practiceStarted: (pillar: string, difficulty: string) =>
    trackEvent("practice_started", { pillar, difficulty }),
  practiceCompleted: (pillar: string, score: number, timeSeconds: number) =>
    trackEvent("practice_completed", { pillar, ai_score: score, time_seconds: timeSeconds }),
  practiceSkipped: (pillar: string) =>
    trackEvent("practice_skipped", { pillar }),
  paywallShown: (trigger: string) =>
    trackEvent("paywall_shown", { trigger }),
  subscriptionCreated: (tier: string, interval: string, amount: number) =>
    trackEvent("subscription_created", { tier, interval, amount_cents: amount }),
  subscriptionCanceled: (tier: string, reason: string) =>
    trackEvent("subscription_canceled", { tier, reason }),
  realWorldApplicationLogged: (pillar: string, outcome: string) =>
    trackEvent("real_world_application_logged", { pillar, outcome }),
};
