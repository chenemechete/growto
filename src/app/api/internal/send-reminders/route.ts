import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendDailyReminderEmail } from "@/lib/sendgrid";
import { PILLARS } from "@/constants/pillars";

export async function POST(req: NextRequest) {
  // Verify cron secret
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const nowUTC = new Date();
  const currentHour = nowUTC.getUTCHours();
  const currentMinute = nowUTC.getUTCMinutes();

  // Find users whose local time matches their preferred reminder time (±15 min window)
  const users = await prisma.user.findMany({
    where: {
      notificationPrefs: {
        emailReminders: true,
        reminderTime: { contains: `${String(currentHour).padStart(2, "0")}:` },
      },
    },
    include: {
      notificationPrefs: true,
      assessments: {
        where: { type: "TRIAGE" },
        orderBy: { completedAt: "desc" },
        take: 1,
      },
    },
  });

  let sent = 0;
  for (const user of users) {
    const pillar = (user.assessments[0]?.primaryPillar as string) ?? "EMOTIONAL_REGULATION";
    const pillarInfo = PILLARS.find((p) => p.id === pillar);
    if (!pillarInfo) continue;

    try {
      await sendDailyReminderEmail(user.email, user.name ?? "there", pillarInfo.label);
      sent++;
    } catch (err) {
      console.error(`Failed to send reminder to ${user.email}:`, err);
    }
  }

  return NextResponse.json({ sent, total: users.length });
}
