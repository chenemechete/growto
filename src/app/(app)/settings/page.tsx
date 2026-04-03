import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SettingsForm } from "@/components/settings/SettingsForm";

export const metadata = { title: "Settings — GrowTo" };

export default async function SettingsPage() {
  const session = await auth();
  const userId = session!.user!.id!;

  const [user, subscription, notifPrefs] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true, trialEndDate: true },
    }),
    prisma.subscription.findUnique({ where: { userId } }),
    prisma.notificationPreference.findUnique({ where: { userId } }),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-display font-bold text-dark">Settings</h1>
      <SettingsForm
        user={user}
        subscription={subscription}
        notifPrefs={notifPrefs}
      />
    </div>
  );
}
