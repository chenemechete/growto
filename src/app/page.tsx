import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "GrowTo — Practice Relationship Skills Before the Stakes Are High",
  description:
    "AI-powered daily scenarios that build the emotional and communication skills that make relationships last.",
};

const pillars = [
  {
    emoji: "🧘",
    name: "Emotional Regulation",
    description: "Stay grounded when feelings get intense",
  },
  {
    emoji: "💬",
    name: "Communication Clarity",
    description: "Say what you mean. Hear what they mean.",
  },
  {
    emoji: "🔒",
    name: "Trust & Safety",
    description: "Build the conditions where love can grow",
  },
  {
    emoji: "🧭",
    name: "Values Alignment",
    description: "Know what matters before it becomes a conflict",
  },
  {
    emoji: "🤝",
    name: "Relational Capacity",
    description: "Expand your range for depth and closeness",
  },
];

const testimonials = [
  {
    name: "Sarah, 31",
    role: "Marketing Director",
    quote:
      "I used to shut down in hard conversations. After 3 weeks of daily practice, I finally told someone how I really felt — and it went well. GrowTo gave me reps I never had.",
  },
  {
    name: "Marcus, 37",
    role: "Software Engineer",
    quote:
      "I thought I was 'bad at relationships.' Turns out I just had no practice. The AI coach pushed back in ways that taught me so much about my patterns.",
  },
  {
    name: "Jasmine, 28",
    role: "Therapist",
    quote:
      "I recommend GrowTo to clients who want to do the work between sessions. The scenarios are surprisingly realistic and the feedback is genuinely insightful.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-light font-sans">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-4xl mx-auto">
        <span className="font-display font-bold text-xl text-dark">GrowTo</span>
        <div className="flex items-center gap-3">
          <Button variant="ghost" asChild>
            <Link href="/login">Sign in</Link>
          </Button>
          <Button asChild>
            <Link href="/signup">Get started free</Link>
          </Button>
        </div>
      </nav>

      {/* Hero */}
      <section className="px-6 pt-16 pb-12 text-center max-w-2xl mx-auto">
        <div className="inline-block bg-sage/20 text-sage-dark text-xs font-semibold px-3 py-1 rounded-full mb-6 tracking-wide uppercase">
          7-day free trial · No credit card
        </div>
        <h1 className="font-display font-bold text-4xl sm:text-5xl text-dark leading-tight mb-6">
          Practice relationship skills before the stakes are high
        </h1>
        <p className="text-muted-foreground text-lg leading-relaxed mb-8 max-w-xl mx-auto">
          AI-powered daily scenarios that build the emotional and communication skills that make
          relationships last. Like a flight simulator — but for love.
        </p>
        <Button asChild size="lg" className="w-full max-w-xs text-base h-14">
          <Link href="/signup">Start free assessment</Link>
        </Button>
        <p className="text-xs text-muted-foreground mt-3">
          Takes 5 minutes · Personalized to your growth edge
        </p>
      </section>

      {/* Social proof bar */}
      <section className="bg-white border-y border-border py-5">
        <div className="flex items-center justify-center gap-8 px-6 flex-wrap text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <span className="text-base">⭐️</span>
            <span>
              <strong className="text-dark">4.9</strong> avg rating
            </span>
          </div>
          <div className="w-px h-4 bg-border hidden sm:block" />
          <div className="flex items-center gap-2">
            <span className="text-base">🏋️</span>
            <span>
              <strong className="text-dark">5,000+</strong> practices completed
            </span>
          </div>
          <div className="w-px h-4 bg-border hidden sm:block" />
          <div className="flex items-center gap-2">
            <span className="text-base">📈</span>
            <span>
              <strong className="text-dark">60%</strong> report behavior change in 30 days
            </span>
          </div>
        </div>
      </section>

      {/* Pillars */}
      <section className="px-6 py-16 max-w-2xl mx-auto">
        <h2 className="font-display font-bold text-2xl text-dark text-center mb-2">
          Five skills. One practice a day.
        </h2>
        <p className="text-muted-foreground text-sm text-center mb-8">
          Your assessment identifies your primary growth edge. Daily scenarios target it directly.
        </p>
        <div className="space-y-3">
          {pillars.map((p) => (
            <div
              key={p.name}
              className="bg-white rounded-xl border border-border p-4 flex items-center gap-4"
            >
              <span className="text-2xl" aria-hidden>
                {p.emoji}
              </span>
              <div>
                <p className="font-medium text-dark text-sm">{p.name}</p>
                <p className="text-xs text-muted-foreground">{p.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-white border-y border-border px-6 py-16">
        <div className="max-w-2xl mx-auto">
          <h2 className="font-display font-bold text-2xl text-dark text-center mb-10">
            How it works
          </h2>
          <div className="space-y-8">
            {[
              {
                step: "01",
                title: "Take a 5-minute readiness assessment",
                description:
                  "A short triage identifies your primary growth pillar and baseline readiness score across 5 dimensions.",
              },
              {
                step: "02",
                title: "Get a personalized daily scenario",
                description:
                  "Each day you receive a realistic conversation challenge — a text thread, a hard talk, a moment of tension — tailored to your edge.",
              },
              {
                step: "03",
                title: "Practice. Get coached. Grow.",
                description:
                  "Respond naturally. Your AI coach responds in character, then gives honest feedback on what worked and what to try next.",
              },
            ].map((item) => (
              <div key={item.step} className="flex gap-5">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-terracotta/10 flex items-center justify-center">
                  <span className="text-xs font-bold text-terracotta">{item.step}</span>
                </div>
                <div>
                  <p className="font-semibold text-dark mb-1">{item.title}</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Value prop differentiation */}
      <section className="px-6 py-16 max-w-2xl mx-auto text-center">
        <h2 className="font-display font-bold text-2xl text-dark mb-4">
          Not therapy. Not a dating app.
        </h2>
        <p className="text-muted-foreground text-base leading-relaxed max-w-lg mx-auto">
          Therapy is for healing the past. Dating apps get you in the room. GrowTo gives you the
          skills to actually show up — fully, clearly, and without self-sabotage — once you&apos;re there.
        </p>
        <div className="mt-8 grid grid-cols-3 gap-4 text-center">
          {[
            { label: "Therapy", note: "Heals the past" },
            { label: "GrowTo", note: "Builds the future", highlight: true },
            { label: "Dating apps", note: "Just the room" },
          ].map((item) => (
            <div
              key={item.label}
              className={`rounded-xl border p-4 ${
                item.highlight
                  ? "border-terracotta bg-terracotta/5"
                  : "border-border bg-white"
              }`}
            >
              <p
                className={`font-semibold text-sm ${
                  item.highlight ? "text-terracotta" : "text-dark"
                }`}
              >
                {item.label}
              </p>
              <p className="text-xs text-muted-foreground mt-1">{item.note}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-white border-y border-border px-6 py-16">
        <div className="max-w-2xl mx-auto">
          <h2 className="font-display font-bold text-2xl text-dark text-center mb-10">
            What people are saying
          </h2>
          <div className="space-y-4">
            {testimonials.map((t) => (
              <div key={t.name} className="bg-light rounded-xl p-5 border border-border">
                <p className="text-sm text-dark leading-relaxed mb-4">&ldquo;{t.quote}&rdquo;</p>
                <div>
                  <p className="text-xs font-semibold text-dark">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing preview */}
      <section className="px-6 py-16 max-w-2xl mx-auto">
        <h2 className="font-display font-bold text-2xl text-dark text-center mb-2">
          Simple pricing
        </h2>
        <p className="text-muted-foreground text-sm text-center mb-8">
          Start free. Upgrade when you&apos;re ready.
        </p>
        <div className="space-y-3">
          {[
            {
              name: "Basic",
              price: "$19",
              desc: "Daily practice + progress tracking",
            },
            {
              name: "Premium",
              price: "$49",
              desc: "Everything + deep-dive HACK assessment",
              highlight: true,
            },
            {
              name: "Coaching",
              price: "$99",
              desc: "Premium + human coaching sessions",
            },
          ].map((plan) => (
            <div
              key={plan.name}
              className={`rounded-xl border p-4 flex items-center justify-between ${
                plan.highlight ? "border-terracotta bg-terracotta/5" : "border-border bg-white"
              }`}
            >
              <div>
                <p className="font-semibold text-dark text-sm">{plan.name}</p>
                <p className="text-xs text-muted-foreground">{plan.desc}</p>
              </div>
              <p className="font-bold text-dark">
                {plan.price}
                <span className="text-xs font-normal text-muted-foreground">/mo</span>
              </p>
            </div>
          ))}
        </div>
        <Button asChild size="lg" className="w-full mt-6 h-14 text-base">
          <Link href="/signup">Start your free trial</Link>
        </Button>
        <p className="text-xs text-muted-foreground text-center mt-3">
          7 days free · Cancel anytime · No credit card required
        </p>
      </section>

      {/* Footer */}
      <footer className="border-t border-border px-6 py-8">
        <div className="max-w-2xl mx-auto flex items-center justify-between flex-wrap gap-4">
          <span className="font-display font-bold text-dark">GrowTo</span>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <Link href="/privacy" className="hover:text-dark transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-dark transition-colors">
              Terms
            </Link>
            <Link href="/login" className="hover:text-dark transition-colors">
              Sign in
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
