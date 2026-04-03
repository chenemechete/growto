import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

// This page triggers the daily practice generation then redirects
export default async function NewPracticePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const baseUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
  const res = await fetch(`${baseUrl}/api/practices/daily`, {
    headers: { Cookie: "" }, // server-to-server; auth handled inside route
    cache: "no-store",
  });

  if (res.ok) {
    const data = await res.json();
    redirect(`/practice/${data.id}`);
  }

  redirect("/practice");
}
