import Link from "next/link";
import { Button } from "@/components/ui/button";

interface PaywallGateProps {
  title?: string;
  message?: string;
  trigger?: string;
}

export function PaywallGate({
  title = "Upgrade to continue",
  message = "You've completed your 3 free practices. Upgrade to keep building.",
  trigger = "free_limit",
}: PaywallGateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center px-6 space-y-4">
      <div className="text-5xl" aria-hidden>🔒</div>
      <h2 className="text-xl font-display font-bold text-dark">{title}</h2>
      <p className="text-sm text-muted-foreground max-w-xs">{message}</p>
      <Button asChild size="lg" className="w-full max-w-xs">
        <Link href={`/plans?reason=${trigger}`}>View plans</Link>
      </Button>
      <p className="text-xs text-muted-foreground">Plans start at $19/month</p>
    </div>
  );
}
