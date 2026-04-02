"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { TRIAGE_QUESTIONS } from "@/constants/questions";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ReadinessScoreRing } from "@/components/dashboard/ReadinessScoreRing";
import { getPillar } from "@/constants/pillars";
import { ChevronLeft } from "lucide-react";
import type { TriageAnswer } from "@/types";

interface TriageResult {
  assessmentId: string;
  primaryPillar: string;
  readinessScore: number;
  insightText: string;
  pillarLabel: string;
}

export function TriageAssessment() {
  const router = useRouter();
  const [step, setStep] = useState(0); // 0 = intro, 1-10 = questions, 11 = results
  const [answers, setAnswers] = useState<TriageAnswer[]>([]);
  const [selectedValue, setSelectedValue] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<TriageResult | null>(null);

  const totalQuestions = TRIAGE_QUESTIONS.length;
  const questionIndex = step - 1;
  const currentQuestion = step > 0 && step <= totalQuestions ? TRIAGE_QUESTIONS[questionIndex] : null;
  const progress = step === 0 ? 0 : Math.round((step / totalQuestions) * 100);

  const handleAnswer = async (value: string, score: number) => {
    setSelectedValue(value);

    const newAnswer: TriageAnswer = {
      questionId: currentQuestion!.id,
      answer: value,
      score,
    };

    const updatedAnswers = [...answers, newAnswer];
    setAnswers(updatedAnswers);

    // Small delay for visual feedback
    await new Promise((r) => setTimeout(r, 250));
    setSelectedValue(null);

    if (step < totalQuestions) {
      setStep((s) => s + 1);
    } else {
      // Submit
      setIsSubmitting(true);
      try {
        const res = await fetch("/api/assessments/triage", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ answers: updatedAnswers }),
        });
        const data = await res.json();
        setResult(data);
        setStep(totalQuestions + 1);
      } catch (err) {
        console.error(err);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setAnswers((a) => a.slice(0, -1));
      setStep((s) => s - 1);
    }
  };

  // INTRO
  if (step === 0) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-display font-bold text-dark mb-2">
            Find your growth area
          </h1>
          <p className="text-muted-foreground">
            10 quick questions. We&apos;ll identify your highest-need relationship skill area and give you a personalized readiness score.
          </p>
        </div>
        <div className="space-y-3">
          {[
            { icon: "⏱", text: "Takes about 5 minutes" },
            { icon: "🎯", text: "Identifies your primary growth area" },
            { icon: "📊", text: "Gives you a readiness score (1–100)" },
          ].map((item) => (
            <div key={item.text} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-border">
              <span className="text-xl" aria-hidden>{item.icon}</span>
              <span className="text-sm text-dark">{item.text}</span>
            </div>
          ))}
        </div>
        <Button size="xl" className="w-full" onClick={() => setStep(1)}>
          Start assessment
        </Button>
      </div>
    );
  }

  // RESULTS
  if (step === totalQuestions + 1 && result) {
    const pillar = getPillar(result.primaryPillar as never);
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className="text-center">
          <div className="text-4xl mb-3" aria-hidden>{pillar.icon}</div>
          <h2 className="text-2xl font-display font-bold text-dark mb-1">
            Your Growth Area
          </h2>
          <p className="text-xl font-semibold text-terracotta">{pillar.label}</p>
        </div>

        <div className="flex justify-center">
          <div className="text-center">
            <ReadinessScoreRing score={result.readinessScore} size={140} />
            <p className="text-sm text-muted-foreground mt-2">Readiness Score</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-border p-5">
          <h3 className="font-semibold text-dark mb-2">What this means for you</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">{result.insightText}</p>
        </div>

        <Button
          size="xl"
          className="w-full"
          onClick={() => router.push(`/assessment/hack/${result.primaryPillar.toLowerCase().replace(/_/g, "-")}`)}
        >
          Begin deep dive →
        </Button>
        <Button
          variant="ghost"
          className="w-full"
          onClick={() => router.push("/dashboard")}
        >
          Skip to dashboard
        </Button>
      </motion.div>
    );
  }

  // LOADING
  if (isSubmitting) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <div className="w-12 h-12 rounded-full border-4 border-terracotta border-t-transparent animate-spin" />
        <p className="text-muted-foreground text-sm">Analyzing your responses…</p>
      </div>
    );
  }

  // QUESTION
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
            <span>Question {step} of {totalQuestions}</span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} />
        </div>
      </div>

      {/* Question card */}
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

          <div className="space-y-2">
            {currentQuestion.options.map((option) => (
              <button
                key={option.value}
                onClick={() => handleAnswer(option.value, option.score)}
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
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
