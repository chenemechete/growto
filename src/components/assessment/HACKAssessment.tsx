"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { getPillar } from "@/constants/pillars";
import { ChevronLeft } from "lucide-react";
import type { HACKQuestion } from "@/types";

interface HACKAssessmentProps {
  pillar: string;
}

const DIMENSION_LABELS: Record<string, string> = {
  history: "Your Story",
  agency: "Your Beliefs",
  context: "Your Life Right Now",
  knowledge: "Your Awareness",
};

export function HACKAssessment({ pillar }: HACKAssessmentProps) {
  const router = useRouter();
  const pillarInfo = getPillar(pillar as never);

  const [questions, setQuestions] = useState<HACKQuestion[]>([]);
  const [assessmentId, setAssessmentId] = useState("");
  const [step, setStep] = useState(0); // 0 = loading, 1+ = questions, total+1 = results
  const [answers, setAnswers] = useState<{ questionId: string; dimension: string; answer: string }[]>([]);
  const [openTextValue, setOpenTextValue] = useState("");
  const [selectedValue, setSelectedValue] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<{ insightText: string; personalizationTags: string[] } | null>(null);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    fetch(`/api/assessments/hack?pillar=${pillar}`)
      .then((r) => r.json())
      .then((data) => {
        setQuestions(data.questions ?? []);
        setAssessmentId(data.assessmentId ?? "");
        setStep(1);
      })
      .catch(() => setLoadError(true));
  }, [pillar]);

  const currentQuestion = step > 0 && step <= questions.length ? questions[step - 1] : null;
  const progress = questions.length > 0 ? Math.round((step / questions.length) * 100) : 0;

  const handleAnswer = async (answer: string) => {
    if (!currentQuestion) return;
    setSelectedValue(answer);

    const newAnswer = {
      questionId: currentQuestion.id,
      dimension: currentQuestion.dimension,
      answer,
    };

    const updatedAnswers = [...answers, newAnswer];
    setAnswers(updatedAnswers);

    await new Promise((r) => setTimeout(r, 220));
    setSelectedValue(null);
    setOpenTextValue("");

    if (step < questions.length) {
      setStep((s) => s + 1);
    } else {
      setIsSubmitting(true);
      try {
        const res = await fetch("/api/assessments/hack", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ assessmentId, pillar, answers: updatedAnswers }),
        });
        const data = await res.json();
        setResult(data);
        setStep(questions.length + 1);
      } catch (err) {
        console.error(err);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setAnswers((a) => a.slice(0, -1));
      setStep((s) => s - 1);
    }
  };

  // Loading
  if (step === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        {loadError ? (
          <>
            <p className="text-muted-foreground text-sm">Failed to load questions.</p>
            <Button onClick={() => window.location.reload()}>Retry</Button>
          </>
        ) : (
          <>
            <div className="w-12 h-12 rounded-full border-4 border-terracotta border-t-transparent animate-spin" />
            <p className="text-muted-foreground text-sm">Preparing your deep dive…</p>
          </>
        )}
      </div>
    );
  }

  // Results
  if (step === questions.length + 1 && result) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className="text-center">
          <div className="text-4xl mb-3" aria-hidden>{pillarInfo.icon}</div>
          <h2 className="text-2xl font-display font-bold text-dark mb-1">Your Profile</h2>
          <p className="text-terracotta font-semibold">{pillarInfo.label}</p>
        </div>

        <div className="bg-white rounded-xl border border-border p-5">
          <h3 className="font-semibold text-dark mb-2">What we learned about you</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">{result.insightText}</p>
        </div>

        {result.personalizationTags.length > 0 && (
          <div>
            <p className="text-xs text-muted-foreground mb-2">Your patterns</p>
            <div className="flex flex-wrap gap-2">
              {result.personalizationTags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-terracotta/10 text-terracotta text-xs rounded-full border border-terracotta/20"
                >
                  {tag.replace(/_/g, " ")}
                </span>
              ))}
            </div>
          </div>
        )}

        <Button size="xl" className="w-full" onClick={() => router.push("/practice")}>
          Start my first practice →
        </Button>
      </motion.div>
    );
  }

  // Submitting
  if (isSubmitting) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <div className="w-12 h-12 rounded-full border-4 border-terracotta border-t-transparent animate-spin" />
        <p className="text-muted-foreground text-sm">Building your profile…</p>
      </div>
    );
  }

  if (!currentQuestion) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        {step > 1 && (
          <button
            onClick={handleBack}
            className="p-1 rounded-full hover:bg-muted transition-colors cursor-pointer"
            aria-label="Previous question"
          >
            <ChevronLeft size={20} className="text-muted-foreground" />
          </button>
        )}
        <div className="flex-1">
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span>{DIMENSION_LABELS[currentQuestion.dimension] ?? currentQuestion.dimension}</span>
            <span>{step}/{questions.length}</span>
          </div>
          <Progress value={progress} />
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.25 }}
          className="space-y-4"
        >
          <div className="bg-white rounded-xl border border-border p-6">
            <p className="text-base font-semibold text-dark leading-relaxed">
              {currentQuestion.text}
            </p>
          </div>

          {/* Multiple choice / likert */}
          {currentQuestion.type !== "open_text" && currentQuestion.options && (
            <div className="space-y-2">
              {currentQuestion.options.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleAnswer(option.value)}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-150 cursor-pointer ${
                    selectedValue === option.value
                      ? "border-terracotta bg-terracotta/5 scale-[0.99]"
                      : "border-border bg-white hover:border-terracotta/40 hover:bg-muted/30 active:scale-[0.99]"
                  }`}
                >
                  <span className="text-sm text-dark">{option.label}</span>
                </button>
              ))}
            </div>
          )}

          {/* Open text */}
          {currentQuestion.type === "open_text" && (
            <div className="space-y-3">
              <textarea
                className="w-full min-h-[120px] p-4 rounded-xl border-2 border-border focus:border-terracotta focus:outline-none text-sm text-dark resize-none bg-white transition-colors"
                placeholder="Take your time. There are no wrong answers."
                value={openTextValue}
                onChange={(e) => setOpenTextValue(e.target.value)}
                aria-label="Your answer"
              />
              <Button
                className="w-full"
                disabled={!openTextValue.trim()}
                onClick={() => handleAnswer(openTextValue.trim())}
              >
                Continue
              </Button>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
