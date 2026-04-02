"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { formatDate } from "@/lib/utils";

interface SettingsFormProps {
  user: { name: string | null; email: string; trialEndDate: Date | null } | null;
  subscription: {
    tier: string;
    status: string;
    currentPeriodEnd: Date | null;
    cancelAtPeriodEnd: boolean;
  } | null;
  notifPrefs: {
    emailReminders: boolean;
    reminderTime: string;
    weeklyDigest: boolean;
  } | null;
}

const TIER_LABELS: Record<string, string> = {
  FREE: "Free Trial",
  BASIC: "Basic",
  PREMIUM: "Premium",
  COACHING: "Coaching",
};

export function SettingsForm({ user, subscription, notifPrefs }: SettingsFormProps) {
  const [isCanceling, setIsCanceling] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [cancelDone, setCancelDone] = useState(false);

  const handleCancel = async () => {
    setIsCanceling(true);
    try {
      await fetch("/api/subscription/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: cancelReason }),
      });
      setCancelDone(true);
      setShowCancelConfirm(false);
    } finally {
      setIsCanceling(false);
    }
  };

  const tierLabel = TIER_LABELS[subscription?.tier ?? "FREE"] ?? "Free Trial";

  return (
    <div className="space-y-4">
      {/* Account */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Account</CardTitle>
        </CardHeader>
        <CardContent className="pt-0 space-y-2">
          <div className="flex justify-between items-center py-2 border-b border-border">
            <span className="text-sm text-muted-foreground">Name</span>
            <span className="text-sm font-medium text-dark">{user?.name ?? "—"}</span>
          </div>
          <div className="flex justify-between items-center py-2">
            <span className="text-sm text-muted-foreground">Email</span>
            <span className="text-sm text-dark">{user?.email}</span>
          </div>
        </CardContent>
      </Card>

      {/* Subscription */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Subscription</CardTitle>
        </CardHeader>
        <CardContent className="pt-0 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Current plan</span>
            <Badge>{tierLabel}</Badge>
          </div>
          {subscription?.currentPeriodEnd && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">
                {subscription.cancelAtPeriodEnd ? "Access until" : "Next billing"}
              </span>
              <span className="text-sm text-dark">
                {formatDate(subscription.currentPeriodEnd)}
              </span>
            </div>
          )}
          {user?.trialEndDate && subscription?.tier === "FREE" && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Trial ends</span>
              <span className="text-sm text-dark">{formatDate(user.trialEndDate)}</span>
            </div>
          )}

          {subscription?.tier === "FREE" && (
            <Button asChild className="w-full mt-2">
              <Link href="/plans">Upgrade plan</Link>
            </Button>
          )}

          {subscription && subscription.tier !== "FREE" && !subscription.cancelAtPeriodEnd && !cancelDone && (
            <>
              {!showCancelConfirm ? (
                <Button
                  variant="ghost"
                  className="w-full text-destructive hover:text-destructive hover:bg-destructive/5"
                  onClick={() => setShowCancelConfirm(true)}
                >
                  Cancel subscription
                </Button>
              ) : (
                <div className="space-y-3 pt-2 border-t border-border">
                  <p className="text-sm font-medium text-dark">Why are you canceling?</p>
                  <div className="space-y-2">
                    {[
                      "Too expensive",
                      "Not using it enough",
                      "Not seeing results",
                      "Found an alternative",
                      "Other",
                    ].map((reason) => (
                      <button
                        key={reason}
                        onClick={() => setCancelReason(reason)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm border transition-colors cursor-pointer ${
                          cancelReason === reason
                            ? "border-destructive bg-destructive/5"
                            : "border-border hover:border-muted-foreground"
                        }`}
                      >
                        {reason}
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => setShowCancelConfirm(false)}
                    >
                      Keep plan
                    </Button>
                    <Button
                      variant="destructive"
                      className="flex-1"
                      onClick={handleCancel}
                      disabled={!cancelReason || isCanceling}
                    >
                      {isCanceling ? "Canceling…" : "Confirm cancel"}
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}

          {(subscription?.cancelAtPeriodEnd || cancelDone) && (
            <p className="text-sm text-muted-foreground text-center">
              Your access continues until {subscription?.currentPeriodEnd ? formatDate(subscription.currentPeriodEnd) : "end of period"}.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Sign out */}
      <Button
        variant="outline"
        className="w-full"
        onClick={() => signOut({ callbackUrl: "/" })}
      >
        Sign out
      </Button>
    </div>
  );
}
