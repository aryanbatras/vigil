import Link from "next/link";
import { redirect } from "next/navigation";
import { clerkClient, currentUser } from "@clerk/nextjs/server";
import {
  ArrowRight,
  ArrowUpRight,
  ExternalLink,
  KeyRound,
  ScrollText,
  ShieldCheck,
} from "lucide-react";

import { AuditTable, LedgerNotice } from "@/components/dashboard/audit-table";
import { StatusChain } from "@/components/dashboard/status-chain";
import { VerifyStateButton } from "@/components/dashboard/verify-state-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  countSecurityEvents,
  isAuditConfigured,
  listSecurityEvents,
} from "@/lib/audit/store";
import { site } from "@/lib/site";
import { formatDateTime } from "@/lib/utils";

export const metadata = {
  title: "Overview",
};

export default async function DashboardOverviewPage() {
  const user = await currentUser();

  if (!user) {
    redirect("/sign-in");
  }

  const [eventsResult, eventCount, sessions] = await Promise.all([
    listSecurityEvents(user.id, 7),
    countSecurityEvents(user.id),
    clerkClient()
      .then((client) =>
        client.sessions.getSessionList({ userId: user.id, limit: 20 }),
      )
      .then((response) => response.data)
      .catch(() => []),
  ]);

  const configured = isAuditConfigured();
  const activeSessions = sessions.filter(
    (session) => session.status === "active",
  ).length;
  const email = user.primaryEmailAddress?.emailAddress ?? "No email";
  const emailVerified =
    user.primaryEmailAddress?.verification?.status === "verified";
  const latestEvent = eventsResult.events[0] ?? null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div>
          <p className="label-mono text-muted-foreground/55">
            Overview / 01
          </p>
          <h1 className="mt-3 font-display text-[clamp(2.2rem,4vw,3.6rem)] font-extrabold leading-[0.95] tracking-[-0.045em]">
            Security posture.
          </h1>
          <p className="mt-3 max-w-[56ch] text-sm leading-relaxed text-muted-foreground">
            A live read of the Clerk user, the active session, and the last
            server-verified ledger entry.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <VerifyStateButton size="sm" />
          <Button asChild variant="outline" size="sm">
            <Link href="/dashboard/activity">
              <ScrollText aria-hidden="true" />
              Open ledger
            </Link>
          </Button>
        </div>
      </div>

      <section className="overflow-hidden rounded-md border border-border bg-card/40">
        <div className="grid gap-8 p-6 lg:grid-cols-12 lg:p-8">
          <div className="lg:col-span-7">
            <p className="label-mono text-muted-foreground/50">
              Current posture / TOTP
            </p>
            <div className="mt-5 flex items-start gap-4">
              <span className="status-dot pulse-dot mt-2 size-2.5 shrink-0 rounded-full bg-signal text-signal" />
              <div>
                <h2 className="font-display text-[clamp(2.4rem,4.8vw,4.6rem)] font-extrabold leading-[0.88] tracking-[-0.05em]">
                  The gate is closed.
                </h2>
                <p className="mt-4 max-w-[50ch] text-sm leading-relaxed text-muted-foreground">
                  An authenticator app is enrolled. Clerk will ask for a
                  rotating code after the email factor. The dashboard layout
                  refuses to open without it.
                </p>
              </div>
            </div>

            <div className="mt-7 flex flex-wrap gap-2">
              <Button asChild size="sm">
                <Link href="/dashboard/security">
                  <ShieldCheck aria-hidden="true" />
                  Manage second factor
                  <ArrowRight aria-hidden="true" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link href="/dashboard/security?tab=sessions">
                  <KeyRound aria-hidden="true" />
                  Review sessions
                </Link>
              </Button>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="grid grid-cols-3 divide-x divide-border overflow-hidden rounded-sm border border-border bg-background/60">
              <Metric label="Events" value={eventCount ?? "—"} />
              <Metric label="Sessions" value={activeSessions} />
              <Metric
                label="Recovery"
                value={user.backupCodeEnabled ? "ON" : "OFF"}
              />
            </div>
            <div className="mt-3 flex items-center justify-between gap-4 border border-border bg-background/30 px-4 py-3">
              <span className="label-mono text-muted-foreground/45">
                Last verified
              </span>
              <span className="font-mono text-[0.625rem] text-muted-foreground">
                {latestEvent
                  ? formatDateTime(latestEvent.created_at)
                  : "Not yet"}
              </span>
            </div>
            <div className="mt-3 flex items-center justify-between gap-4 border border-border bg-background/30 px-4 py-3">
              <span className="label-mono text-muted-foreground/45">
                Session
              </span>
              <span className="truncate font-mono text-[0.625rem] text-muted-foreground">
                {user.lastSignInAt
                  ? `last sign-in ${formatDateTime(user.lastSignInAt)}`
                  : "no sign-in recorded"}
              </span>
            </div>
          </div>
        </div>

        <div className="border-t border-border p-4 md:p-5">
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
        </div>
      </section>

      <section className="overflow-hidden rounded-md border border-border bg-card/35">
        <div className="flex flex-col justify-between gap-3 border-b border-border px-5 py-4 sm:flex-row sm:items-center">
          <div>
            <p className="label-mono text-muted-foreground/50">
              Recent ledger
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              The last seven server-verified events for this account.
            </p>
          </div>
          <Link
            href="/dashboard/activity"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground underline decoration-border underline-offset-4 transition-colors hover:text-foreground"
          >
            Open the full ledger
            <ArrowUpRight className="size-3" aria-hidden="true" />
          </Link>
        </div>

        {eventsResult.ok ? (
          <AuditTable events={eventsResult.events} />
        ) : (
          <div className="p-4 md:p-5">
            <LedgerNotice
              configured={configured}
              reason={eventsResult.reason}
              message={eventsResult.message}
            />
          </div>
        )}
      </section>

      <div className="grid gap-6 lg:grid-cols-12">
        <section className="overflow-hidden rounded-md border border-border bg-card/35 lg:col-span-7">
          <div className="border-b border-border px-5 py-4">
            <p className="label-mono text-muted-foreground/50">
              Account / session
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Identity is owned by Clerk. The ledger only keeps the user ID.
            </p>
          </div>
          <dl className="divide-y divide-border text-sm">
            <Row label="Email" value={email} mono />
            <Row label="Clerk user" value={user.id} mono truncate />
            <Row
              label="Member since"
              value={formatDateTime(user.createdAt)}
              mono
            />
            <Row
              label="Last sign-in"
              value={formatDateTime(user.lastSignInAt)}
              mono
            />
            <Row
              label="Second factor"
              value={user.totpEnabled ? "TOTP active" : "Not enrolled"}
            />
          </dl>
        </section>

        <section className="rounded-md border border-border bg-card/35 p-5 lg:col-span-5">
          <p className="label-mono text-muted-foreground/50">Reference</p>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            The app never receives the TOTP secret. The audit API re-reads the
            user from Clerk&apos;s Backend API before it writes a row.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Badge variant="success">Server-verified</Badge>
            <Badge variant="outline">RLS enabled</Badge>
            <Badge variant="outline">No secrets stored</Badge>
          </div>
          <div className="mt-6 space-y-2">
            <ExternalLinkRow
              href="https://dashboard.clerk.com"
              label="Clerk dashboard"
            />
            <ExternalLinkRow
              href="https://supabase.com/dashboard"
              label="Supabase dashboard"
            />
            <ExternalLinkRow
              href={`${site.github}#readme`}
              label="Setup notes"
            />
          </div>
          <p className="mt-6 border-t border-border pt-4 font-mono text-[0.5625rem] uppercase tracking-[0.14em] text-muted-foreground/40">
            POST /api/audit · server sync
          </p>
        </section>
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="px-3 py-4">
      <p className="font-mono text-[0.5625rem] uppercase tracking-[0.14em] text-muted-foreground/45">
        {label}
      </p>
      <p className="mt-3 font-display text-2xl font-extrabold leading-none tracking-[-0.03em] text-foreground md:text-3xl">
        {value}
      </p>
    </div>
  );
}

function Row({
  label,
  value,
  mono,
  truncate,
}: {
  label: string;
  value: string;
  mono?: boolean;
  truncate?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-6 px-5 py-3.5">
      <dt className="label-mono pt-1 text-muted-foreground/45">{label}</dt>
      <dd
        className={[
          "min-w-0 text-right text-sm text-foreground",
          mono ? "font-mono text-[0.6875rem] text-muted-foreground" : "",
          truncate ? "max-w-[62%] truncate" : "",
        ].join(" ")}
      >
        {value}
      </dd>
    </div>
  );
}

function ExternalLinkRow({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="flex items-center justify-between gap-4 rounded-sm border border-border px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:border-muted-foreground/30 hover:text-foreground"
    >
      {label}
      <ExternalLink className="size-3.5" aria-hidden="true" />
    </a>
  );
}
