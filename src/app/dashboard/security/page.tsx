import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";
import { AlertTriangle } from "lucide-react";

import { MfaManager } from "@/components/dashboard/mfa-manager";
import { StatusChain } from "@/components/dashboard/status-chain";
import { Badge } from "@/components/ui/badge";
import { isAuditConfigured } from "@/lib/audit/store";

export const metadata: Metadata = {
  title: "Security settings",
};

export default async function SecurityPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const params = await searchParams;
  const user = await currentUser();

  if (!user) {
    redirect("/sign-in");
  }

  const emailVerified =
    user.primaryEmailAddress?.verification?.status === "verified";
  const configured = isAuditConfigured();
  const required = !user.totpEnabled;

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div>
          <p className="label-mono text-muted-foreground/55">
            Security / 02
          </p>
          <h1 className="mt-3 font-display text-[clamp(2.2rem,4vw,3.6rem)] font-extrabold leading-[0.95] tracking-[-0.045em]">
            Security settings.
          </h1>
          <p className="mt-3 max-w-[58ch] text-sm leading-relaxed text-muted-foreground">
            Enroll the second factor, rotate recovery codes, and review the
            devices that still hold a session. Clerk owns the secrets; this
            page only calls its client API and asks the server to verify.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge variant={user.totpEnabled ? "success" : "warning"}>
            {user.totpEnabled ? "Gate closed" : "Gate open"}
          </Badge>
          <Badge variant={user.backupCodeEnabled ? "muted" : "outline"}>
            {user.backupCodeEnabled ? "Recovery active" : "No recovery codes"}
          </Badge>
        </div>
      </div>

      {required ? (
        <div className="flex items-start gap-4 rounded-md border border-warning/25 bg-warning/5 p-4">
          <span className="grid size-9 shrink-0 place-items-center rounded-sm border border-warning/25 bg-warning/10 text-warning">
            <AlertTriangle className="size-4" aria-hidden="true" />
          </span>
          <div>
            <p className="text-sm font-medium text-foreground">
              A second factor is required.
            </p>
            <p className="mt-1 max-w-[64ch] text-sm leading-relaxed text-muted-foreground">
              The secured dashboard is gated. This page stays reachable so you
              can enroll an authenticator. Every other dashboard route will
              redirect back here until the enrollment is verified.
            </p>
          </div>
        </div>
      ) : null}

      <StatusChain
        items={[
          {
            label: "Email factor",
            detail: emailVerified ? "Verified inbox" : "Verification pending",
            state: emailVerified ? "on" : "off",
          },
          {
            label: "Authenticator",
            detail: user.totpEnabled ? "TOTP enrolled" : "Not enrolled",
            state: user.totpEnabled ? "on" : "pending",
          },
          {
            label: "Ledger",
            detail: configured ? "Server-verified" : "Not connected",
            state: configured ? "on" : "off",
          },
        ]}
      />

      <MfaManager initialTab={params.tab} />

      <p className="border-t border-border pt-4 font-mono text-[0.5625rem] uppercase leading-relaxed tracking-[0.14em] text-muted-foreground/35">
        Removing the authenticator opens the gate immediately · the secured
        layout redirects every other dashboard route back here
      </p>
    </div>
  );
}
