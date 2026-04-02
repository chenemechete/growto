"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Send, ChevronDown, ChevronUp, RotateCcw } from "lucide-react";
import { pillarLabel } from "@/lib/utils";
import { RealWorldApplicationPrompt } from "./RealWorldApplicationPrompt";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

interface Feedback {
  score: number;
  strengths: string[];
  improvements: string[];
  nextSteps: string;
}

interface PracticeSessionProps {
  practiceId: string;
  pillar: string;
  title: string;
  scenario: { setup: string; trigger: string; prompt: string };
  difficulty: string;
  initialStatus: string;
  initialMessages: { role: string; content: string; timestamp: string }[];
  initialFeedback: Feedback | null;
}

export function PracticeSession({
  practiceId,
  pillar,
  title,
  scenario,
  difficulty,
  initialStatus,
  initialMessages,
  initialFeedback,
}: PracticeSessionProps) {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>(
    initialMessages.map((m) => ({ ...m, role: m.role as "user" | "assistant" }))
  );
  const [feedback, setFeedback] = useState<Feedback | null>(initialFeedback);
  const [status, setStatus] = useState(initialStatus);
  const [inputValue, setInputValue] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [scenarioExpanded, setScenarioExpanded] = useState(messages.length === 0);
  const [showApplicationPrompt, setShowApplicationPrompt] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!inputValue.trim() || isSending) return;
    const userText = inputValue.trim();
    setInputValue("");
    setIsSending(true);

    const userMsg: Message = {
      role: "user",
      content: userText,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);

    // Stream AI response
    const assistantMsg: Message = { role: "assistant", content: "", timestamp: new Date().toISOString() };
    setMessages((prev) => [...prev, assistantMsg]);

    try {
      const res = await fetch(`/api/practices/${practiceId}/respond`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ response: userText }),
      });

      if (!res.ok || !res.body) throw new Error("Stream failed");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let accum = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        accum += chunk;
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = { ...assistantMsg, content: accum };
          return updated;
        });
      }
    } catch (err) {
      console.error(err);
      setMessages((prev) => prev.slice(0, -1)); // remove empty assistant msg
    } finally {
      setIsSending(false);
      setStatus("IN_PROGRESS");
    }
  };

  const completePractice = async () => {
    if (isCompleting) return;
    setIsCompleting(true);
    try {
      const res = await fetch(`/api/practices/${practiceId}/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      setFeedback(data.feedback);
      setStatus("COMPLETED");
    } catch (err) {
      console.error(err);
    } finally {
      setIsCompleting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const isCompleted = status === "COMPLETED";

  return (
    <div className="flex flex-col min-h-[calc(100vh-8rem)] space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Badge variant="secondary" className="mb-1">{pillarLabel(pillar)}</Badge>
          <h1 className="text-base font-semibold text-dark leading-tight">{title}</h1>
        </div>
        <Badge variant="muted" className="capitalize shrink-0 ml-2">{difficulty}</Badge>
      </div>

      {/* Scenario card (collapsible) */}
      <Card className="border-terracotta/20 bg-terracotta/5">
        <CardContent className="p-4">
          <button
            onClick={() => setScenarioExpanded((s) => !s)}
            className="w-full flex items-center justify-between text-left cursor-pointer"
            aria-expanded={scenarioExpanded}
          >
            <span className="text-xs font-semibold text-terracotta uppercase tracking-wide">
              Scenario
            </span>
            {scenarioExpanded ? (
              <ChevronUp size={14} className="text-terracotta" />
            ) : (
              <ChevronDown size={14} className="text-terracotta" />
            )}
          </button>
          {scenarioExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-3 space-y-2"
            >
              <p className="text-sm text-dark leading-relaxed">{scenario.setup}</p>
              <p className="text-sm text-muted-foreground italic">{scenario.trigger}</p>
              <div className="mt-3 p-3 bg-white rounded-lg border border-terracotta/20">
                <p className="text-xs text-terracotta font-semibold mb-0.5">Your practice goal</p>
                <p className="text-sm text-dark">{scenario.prompt}</p>
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>

      {/* Message thread */}
      <div className="flex-1 space-y-3 min-h-[200px]">
        {messages.length === 0 && (
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground">
              Type your response to begin the practice.
            </p>
          </div>
        )}
        {messages.map((msg, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-terracotta text-white rounded-br-sm"
                  : "bg-white border border-border text-dark rounded-bl-sm"
              }`}
            >
              {msg.content || (
                <span className="flex gap-1">
                  <span className="animate-bounce delay-0">.</span>
                  <span className="animate-bounce delay-75">.</span>
                  <span className="animate-bounce delay-150">.</span>
                </span>
              )}
            </div>
          </motion.div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Feedback panel */}
      {isCompleted && feedback && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <Card className="border-sage/30 bg-sage/5">
            <CardContent className="p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-dark">Coaching Feedback</h3>
                <div className="flex gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div
                      key={i}
                      className={`w-4 h-4 rounded-full ${
                        i < feedback.score ? "bg-terracotta" : "bg-muted"
                      }`}
                      aria-hidden
                    />
                  ))}
                </div>
              </div>

              {feedback.strengths.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-sage-dark mb-1">What worked</p>
                  {feedback.strengths.map((s, i) => (
                    <p key={i} className="text-sm text-dark">✓ {s}</p>
                  ))}
                </div>
              )}

              {feedback.improvements.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground mb-1">Try next time</p>
                  {feedback.improvements.map((s, i) => (
                    <p key={i} className="text-sm text-muted-foreground">→ {s}</p>
                  ))}
                </div>
              )}

              <div className="p-3 bg-white rounded-lg border border-sage/20">
                <p className="text-xs font-semibold text-dark mb-0.5">Real-life takeaway</p>
                <p className="text-sm text-muted-foreground">{feedback.nextSteps}</p>
              </div>
            </CardContent>
          </Card>

          {!showApplicationPrompt ? (
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => router.push("/practice")}
              >
                Done for today
              </Button>
              <Button
                className="flex-1"
                onClick={() => setShowApplicationPrompt(true)}
              >
                Log real-world use
              </Button>
            </div>
          ) : (
            <RealWorldApplicationPrompt
              practiceId={practiceId}
              pillar={pillar}
              onDone={() => router.push("/dashboard")}
            />
          )}
        </motion.div>
      )}

      {/* Input area */}
      {!isCompleted && (
        <div className="space-y-2">
          <div className="flex gap-2 items-end">
            <div className="flex-1 relative">
              <textarea
                ref={textareaRef}
                rows={2}
                className="w-full resize-none px-4 py-3 pr-12 rounded-xl border-2 border-border focus:border-terracotta focus:outline-none text-sm text-dark bg-white transition-colors"
                placeholder="Type your response… (Enter to send)"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isSending}
                maxLength={500}
                aria-label="Your response"
              />
            </div>
            <Button
              size="icon"
              onClick={sendMessage}
              disabled={!inputValue.trim() || isSending}
              aria-label="Send"
              className="shrink-0 h-11 w-11"
            >
              <Send size={16} />
            </Button>
          </div>

          {messages.filter((m) => m.role === "user").length >= 1 && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 text-xs"
                onClick={() => {
                  setMessages([]);
                  setStatus("PENDING");
                  setScenarioExpanded(true);
                }}
              >
                <RotateCcw size={12} className="mr-1" />
                Start over
              </Button>
              <Button
                size="sm"
                className="flex-1 text-xs"
                onClick={completePractice}
                disabled={isCompleting}
              >
                {isCompleting ? "Getting feedback…" : "Complete practice"}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
