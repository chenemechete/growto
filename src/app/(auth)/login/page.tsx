import { LoginForm } from "@/components/auth/LoginForm";
import Link from "next/link";

export const metadata = { title: "Sign In — GrowTo" };

export default function LoginPage() {
  return (
    <div className="bg-white rounded-xl shadow-card border border-border p-8">
      <h2 className="text-2xl font-display font-semibold text-dark mb-2">Welcome back</h2>
      <p className="text-sm text-muted-foreground mb-6">
        Sign in to continue your practice journey.
      </p>
      <LoginForm />
      <p className="text-center text-sm text-muted-foreground mt-6">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="text-terracotta hover:underline font-medium">
          Start free trial
        </Link>
      </p>
    </div>
  );
}
