import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const user = session.user as typeof session.user & { onboardingDone?: boolean };
  if (!user.onboardingDone) redirect("/welcome");

  return <AppShell user={session.user}>{children}</AppShell>;
}
