"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface RealWorldApplicationPromptProps {
  practiceId: string;
  pillar: string;
  onDone: () => void;
}

const OUTCOMES = [
  { value: "successful", label: "Yes, it went well", emoji: "✅" },
  { value: "challenging", label: "Yes, it was hard", emoji: "💪" },
  { value: "no_opportunity", label: "Didn't get the chance", emoji: "🔜" },
] as const;

const CONTEXTS = [
  { value: "family", label: "Family" },
  { value: "friends", label: "Friends" },
  { value: "dating", label: "Dating" },
  { value: "work", label: "Work" },
  { value: "other", label: "Other" },
] as const;

export function RealWorldApplicationPrompt({
  practiceId,
  pillar,
  onDone,
}: RealWorldApplicationPromptProps) {
  const [outcome, setOutcome] = useState<string | null>(null);
  const [context, setContext] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!outcome) return;
    setIsSubmitting(true);
    try {
      await fetch("/api/progress/real-world-application", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          practiceId,
          pillar,
          applied: outcome !== "no_opportunity",
          outcome,
          description: description || undefined,
          context: context || undefined,
        }),
      });
    } finally {
      setIsSubmitting(false);
      onDone();
    }
  };

  return (
    <Card>
      <CardContent className="p-5 space-y-4">
        <h3 className="font-semibold text-dark">Did you use this skill in real life?</h3>

        <div className="space-y-2">
          {OUTCOMES.map((o) => (
            <button
              key={o.value}
              onClick={() => setOutcome(o.value)}
              className={`w-full flex items-center gap-3 p-3 rounded-lg border-2 transition-all cursor-pointer ${
                outcome === o.value
                  ? "border-terracotta bg-terracotta/5"
                  : "border-border bg-white hover:border-terracotta/30"
              }`}
            >
              <span className="text-lg" aria-hidden>{o.emoji}</span>
              <span className="text-sm text-dark">{o.label}</span>
            </button>
          ))}
        </div>

        {outcome && outcome !== "no_opportunity" && (
          <>
            <div>
              <p className="text-xs text-muted-foreground mb-2">Where? (optional)</p>
              <div className="flex flex-wrap gap-2">
                {CONTEXTS.map((c) => (
                  <button
                    key={c.value}
                    onClick={() => setContext(context === c.value ? null : c.value)}
                    className={`px-3 py-1 rounded-full text-xs border transition-colors cursor-pointer ${
                      context === c.value
                        ? "bg-terracotta text-white border-terracotta"
                        : "bg-white border-border hover:border-terracotta/40 text-dark"
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs text-muted-foreground mb-2">What happened? (optional)</p>
              <textarea
                className="w-full h-20 px-3 py-2 rounded-lg border border-border focus:border-terracotta focus:outline-none text-sm resize-none"
                placeholder="A quick note for yourself…"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={280}
              />
            </div>
          </>
        )}

        <Button
          className="w-full"
          onClick={handleSubmit}
          disabled={!outcome || isSubmitting}
        >
          {isSubmitting ? "Saving…" : "Save & go to dashboard"}
        </Button>
      </CardContent>
    </Card>
  );
}
