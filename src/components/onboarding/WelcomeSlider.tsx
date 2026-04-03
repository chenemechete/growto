"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

const SLIDES = [
  {
    emoji: "🎯",
    title: "Welcome to GrowTo",
    subtitle: "Practice relationship skills before the stakes are high.",
    body: "Most people enter relationships repeating the same patterns. GrowTo helps you build real skills — not just insight — before it matters.",
    cta: "Next",
  },
  {
    emoji: "🧠",
    title: "Here's how it works",
    steps: [
      { icon: "📋", label: "Assess", desc: "5-minute quiz finds your growth area" },
      { icon: "💬", label: "Practice", desc: "Daily AI scenarios tailored to you" },
      { icon: "📈", label: "Track", desc: "Watch your readiness score grow" },
    ],
    cta: "Sounds good",
  },
  {
    emoji: "🌱",
    title: "One skill at a time",
    subtitle: "No overwhelm. Real progress.",
    body: "You'll start with your highest-need growth area. As you master it, you unlock the next. Small daily reps create permanent change.",
    cta: "Take my assessment",
    isLast: true,
  },
];

export function WelcomeSlider() {
  const [step, setStep] = useState(0);
  const router = useRouter();
  const slide = SLIDES[step];

  const handleNext = async () => {
    if (step < SLIDES.length - 1) {
      setStep((s) => s + 1);
    } else {
      router.push("/assessment/triage");
    }
  };

  return (
    <div className="flex flex-col min-h-screen max-w-lg mx-auto px-6 py-12">
      {/* Logo */}
      <div className="text-center mb-8">
        <span className="text-2xl font-display font-bold text-terracotta">GrowTo</span>
      </div>

      {/* Slide content */}
      <div className="flex-1 flex flex-col justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.3 }}
            className="text-center space-y-6"
          >
            <div className="text-7xl">{slide.emoji}</div>
            <h2 className="text-3xl font-display font-bold text-dark">{slide.title}</h2>

            {"subtitle" in slide && slide.subtitle && (
              <p className="text-lg text-muted-foreground">{slide.subtitle}</p>
            )}

            {"body" in slide && slide.body && (
              <p className="text-base text-muted-foreground leading-relaxed">{slide.body}</p>
            )}

            {"steps" in slide && slide.steps && (
              <div className="space-y-4 text-left">
                {slide.steps.map((s) => (
                  <div key={s.label} className="flex items-start gap-4 bg-white rounded-lg p-4 border border-border">
                    <span className="text-2xl">{s.icon}</span>
                    <div>
                      <div className="font-semibold text-dark">{s.label}</div>
                      <div className="text-sm text-muted-foreground">{s.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Progress dots */}
      <div className="flex justify-center gap-2 mb-8">
        {SLIDES.map((_, i) => (
          <div
            key={i}
            className={`h-2 rounded-full transition-all duration-300 ${
              i === step ? "w-6 bg-terracotta" : "w-2 bg-border"
            }`}
          />
        ))}
      </div>

      <Button size="xl" className="w-full" onClick={handleNext}>
        {slide.cta}
      </Button>
    </div>
  );
}
