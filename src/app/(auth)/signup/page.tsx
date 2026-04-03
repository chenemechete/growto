import { SignupForm } from "@/components/auth/SignupForm";
import Link from "next/link";

export const metadata = { title: "Start Free Trial — GrowTo" };

export default function SignupPage() {
  return (
    <div className="bg-white rounded-xl shadow-card border border-border p-8">
      <h2 className="text-2xl font-display font-semibold text-dark mb-1">
        Start your free trial
      </h2>
      <p className="text-sm text-muted-foreground mb-6">
        7 days free. No credit card required.
      </p>
      <SignupForm />
      <p className="text-center text-sm text-muted-foreground mt-6">
        Already have an account?{" "}
        <Link href="/login" className="text-terracotta hover:underline font-medium">
          Sign in
        </Link>
      </p>
    </div>
  );
}
