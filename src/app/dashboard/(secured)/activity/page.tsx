import Link from "next/link";
import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";
import { ArrowUpRight, Database, ShieldCheck, Webhook } from "lucide-react";

import { AuditTable, LedgerNotice } from "@/components/dashboard/audit-table";
import { VerifyStateButton } from "@/components/dashboard/verify-state-button";
import { Badge } from "@/components/ui/badge";
import {
  countSecurityEvents,
  isAuditConfigured,
  listSecurityEvents,
} from "@/lib/audit/store";
import { site } from "@/lib/site";
import { formatDateTime } from "@/lib/utils";

export const metadata = {
  title: "Activity",
};

export default async function ActivityPage() {
  const user = await currentUser();

  if (!user) {
    redirect("/sign-in");
  }

  const [eventsResult, count] = await Promise.all([
    listSecurityEvents(user.id, 50),
    countSecurityEvents(user.id),
  ]);

  const configured = isAuditConfigured();
  const latest = eventsResult.events[0] ?? null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div>
          <p className="label-mono text-muted-foreground/55">
            Activity / 02
          </p>
          <h1 className="mt-3 font-display text-[clamp(2.2rem,4vw,3.6rem)] font-extrabold leading-[0.95] tracking-[-0.045em]">
            Audit ledger.
          </h1>
          <p className="mt-3 max-w-[58ch] text-sm leading-relaxed text-muted-foreground">
            Every row starts with a Clerk Backend API read or a signed Clerk
            webhook. The browser cannot append an event.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <VerifyStateButton size="sm" />
          <Badge variant="success">
            <ShieldCheck className="size-3" aria-hidden="true" />
            Verified only
          </Badge>
        </div>
      </div>

      <div className="grid divide-y divide-border overflow-hidden rounded-md border border-border bg-card/40 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        <Summary
          label="Ledger"
          value={configured ? "Connected" : "Not connected"}
          note={configured ? "Supabase service role" : "Add credentials to enable"}
        />
        <Summary
          label="Rows"
          value={count === null ? "—" : String(count)}
          note="Shown: latest 50"
        />
        <Summary
          label="Latest check"
          value={latest ? formatDateTime(latest.created_at) : "None yet"}
          note={latest ? latest.event_type : "Run a state check"}
        />
      </div>

      <section className="overflow-hidden rounded-md border border-border bg-card/35">
        <div className="flex flex-col justify-between gap-3 border-b border-border px-5 py-4 sm:flex-row sm:items-center">
          <div>
            <p className="label-mono text-muted-foreground/50">
              security_events
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Append-only snapshots. No codes, secrets, or email bodies.
            </p>
          </div>
          <span className="font-mono text-[0.5625rem] uppercase tracking-[0.14em] text-muted-foreground/40">
            RLS on / service role writes
          </span>
        </div>

        {eventsResult.ok ? (
          <AuditTable
            events={eventsResult.events}
            emptyMessage={
              configured
                ? "No verified events yet. Use “Verify current state” to ask the server to re-read Clerk and write the first row."
                : "The console is working; the ledger is waiting for a Supabase project."
            }
          />
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
        <section className="rounded-md border border-border bg-card/35 p-5 lg:col-span-7">
          <p className="label-mono text-muted-foreground/50">
            How a row gets here
          </p>
          <div className="mt-5 space-y-5">
            <Source
              icon={<Database className="size-4" aria-hidden="true" />}
              title="Server sync"
              body="The authenticated user asks the audit API to verify the current state. The server reads the user from Clerk, then writes the verified snapshot with the service-role key."
              tag="POST /api/audit"
            />
            <Source
              icon={<Webhook className="size-4" aria-hidden="true" />}
              title="Clerk webhook"
              body="Clerk posts user.created and user.updated events to a signed endpoint. The route verifies the Svix signature, compares the MFA booleans with the latest row, and writes only when the state actually changes."
              tag="POST /api/webhooks/clerk"
            />
            <Source
              icon={<ShieldCheck className="size-4" aria-hidden="true" />}
              title="Session action"
              body="After the UI revokes a session, the server confirms the session belongs to the user and is no longer active before recording the event."
              tag="POST /api/audit"
            />
          </div>
        </section>

        <section className="rounded-md border border-border bg-card/35 p-5 lg:col-span-5">
          <p className="label-mono text-muted-foreground/50">Reference</p>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            The ledger is deliberately separate from identity. Clerk owns the
            factors; Supabase owns the evidence. Neither stores the other&apos;s
            secret.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Badge variant="outline">Clerk user id</Badge>
            <Badge variant="outline">MFA booleans</Badge>
            <Badge variant="outline">source</Badge>
            <Badge variant="outline">timestamp</Badge>
          </div>
          <div className="mt-6 space-y-2">
            <a
              href={`${site.github}#supabase-setup`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between gap-4 rounded-sm border border-border px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:border-muted-foreground/30 hover:text-foreground"
            >
              Supabase setup
              <ArrowUpRight className="size-3.5" aria-hidden="true" />
            </a>
            <a
              href={`${site.github}#webhook-setup`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between gap-4 rounded-sm border border-border px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:border-muted-foreground/30 hover:text-foreground"
            >
              Webhook setup
              <ArrowUpRight className="size-3.5" aria-hidden="true" />
            </a>
            <Link
              href={`${site.github}/blob/main/supabase/schema.sql`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between gap-4 rounded-sm border border-border px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:border-muted-foreground/30 hover:text-foreground"
            >
              schema.sql
              <ArrowUpRight className="size-3.5" aria-hidden="true" />
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}

function Summary({
  label,
  value,
  note,
}: {
  label: string;
  value: string;
  note: string;
}) {
  return (
    <div className="px-5 py-4">
      <p className="label-mono text-muted-foreground/45">{label}</p>
      <p className="mt-2 text-sm font-medium text-foreground">{value}</p>
      <p className="mt-1 font-mono text-[0.5625rem] uppercase tracking-[0.12em] text-muted-foreground/40">
        {note}
      </p>
    </div>
  );
}

function Source({
  icon,
  title,
  body,
  tag,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
  tag: string;
}) {
  return (
    <div className="flex gap-4">
      <span className="grid size-8 shrink-0 place-items-center rounded-sm border border-border bg-secondary text-muted-foreground">
        {icon}
      </span>
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm font-medium text-foreground">{title}</p>
          <span className="font-mono text-[0.5625rem] uppercase tracking-[0.1em] text-muted-foreground/40">
            {tag}
          </span>
        </div>
        <p className="mt-1.5 max-w-[60ch] text-xs leading-relaxed text-muted-foreground">
          {body}
        </p>
      </div>
    </div>
  );
}
