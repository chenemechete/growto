import sgMail from "@sendgrid/mail";

sgMail.setApiKey(process.env.SENDGRID_API_KEY ?? "");

const FROM = {
  email: process.env.SENDGRID_FROM_EMAIL ?? "hello@growto.com",
  name: process.env.SENDGRID_FROM_NAME ?? "GrowTo",
};

export async function sendWelcomeEmail(to: string, name: string) {
  await sgMail.send({
    to,
    from: FROM,
    subject: "Welcome to GrowTo 🎯",
    html: `
      <h1>Welcome, ${name}!</h1>
      <p>You've just taken the first step toward practicing relationship skills before the stakes are high.</p>
      <p>Here's what's next:</p>
      <ol>
        <li><strong>Take your assessment</strong> — 10 questions to find your primary growth area (takes ~5 minutes)</li>
        <li><strong>Get your personalized practice</strong> — AI-generated scenarios tailored to you</li>
        <li><strong>Track real change</strong> — see your readiness score grow over time</li>
      </ol>
      <p><a href="${process.env.NEXTAUTH_URL}/assessment/triage">Start Your Assessment →</a></p>
      <p>You have 7 days free — no credit card required.</p>
      <p>Here for you,<br>Chen & the GrowTo team</p>
    `,
  });
}

export async function sendDailyReminderEmail(
  to: string,
  name: string,
  pillarLabel: string
) {
  await sgMail.send({
    to,
    from: FROM,
    subject: `Your practice is ready 🎯 — ${pillarLabel}`,
    html: `
      <p>Hi ${name},</p>
      <p>Today's practice is waiting for you.</p>
      <p>Just 5 minutes of focused practice compounds into real change over time.</p>
      <p><a href="${process.env.NEXTAUTH_URL}/practice">Start Today's Practice →</a></p>
      <p>Keep going,<br>GrowTo</p>
    `,
  });
}

export async function sendTrialEndingEmail(
  to: string,
  name: string,
  daysLeft: number,
  practicesCompleted: number,
  readinessScore: number
) {
  await sgMail.send({
    to,
    from: FROM,
    subject: `${daysLeft === 1 ? "Last day" : `${daysLeft} days left`} of your GrowTo trial`,
    html: `
      <p>Hi ${name},</p>
      <p>You've completed <strong>${practicesCompleted} practices</strong> and your readiness score is <strong>${readinessScore}/100</strong>. Real progress.</p>
      <p>Your trial ends in ${daysLeft} ${daysLeft === 1 ? "day" : "days"}.</p>
      <p><a href="${process.env.NEXTAUTH_URL}/plans">Continue Building Skills →</a></p>
      <p>Plans start at $19/month. Keep the momentum going.</p>
      <p>GrowTo</p>
    `,
  });
}

export async function sendWeeklyProgressEmail(
  to: string,
  name: string,
  data: {
    practicesThisWeek: number;
    streakDays: number;
    readinessScore: number;
    pillarLabel: string;
  }
) {
  await sgMail.send({
    to,
    from: FROM,
    subject: `Your week in review 📊`,
    html: `
      <p>Hi ${name},</p>
      <h2>This week in ${data.pillarLabel}</h2>
      <ul>
        <li>✅ ${data.practicesThisWeek} practices completed</li>
        <li>🔥 ${data.streakDays} day streak</li>
        <li>📈 Readiness score: ${data.readinessScore}/100</li>
      </ul>
      <p><a href="${process.env.NEXTAUTH_URL}/dashboard">View Your Full Dashboard →</a></p>
      <p>GrowTo</p>
    `,
  });
}

export async function sendPaymentConfirmationEmail(
  to: string,
  name: string,
  tierName: string,
  amount: number
) {
  await sgMail.send({
    to,
    from: FROM,
    subject: `Welcome to GrowTo ${tierName}! 🎉`,
    html: `
      <p>Hi ${name},</p>
      <p>Your payment of $${(amount / 100).toFixed(2)} was successful.</p>
      <p>You're now on <strong>GrowTo ${tierName}</strong>. Your full feature set is unlocked.</p>
      <p><a href="${process.env.NEXTAUTH_URL}/dashboard">Go to Dashboard →</a></p>
      <p>GrowTo</p>
    `,
  });
}
