import Link from "next/link";
import { Database, FileWarning, Terminal } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { site } from "@/lib/site";
import type { SecurityEvent } from "@/lib/audit/types";
import { eventTypeLabel } from "@/lib/audit/types";
import { formatDateTime } from "@/lib/utils";

const sourceLabels: Record<string, string> = {
  clerk_webhook: "clerk webhook",
  server_sync: "server sync",
  session_action: "session action",
};

export function AuditTable({
  events,
  emptyMessage = "No verified events yet. Run a state check to write the first row.",
}: {
  events: SecurityEvent[];
  emptyMessage?: string;
}) {
  if (events.length === 0) {
    return (
      <div className="flex flex-col items-start gap-3 px-5 py-10">
        <span className="grid size-9 place-items-center rounded-sm border border-border bg-secondary text-muted-foreground">
          <Terminal className="size-4" aria-hidden="true" />
        </span>
        <p className="max-w-[42ch] text-sm text-muted-foreground">
          {emptyMessage}
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[720px] border-collapse text-left">
        <thead>
          <tr className="label-mono border-b border-border text-muted-foreground/55">
            <th className="px-5 py-3 font-normal">Timestamp</th>
            <th className="px-5 py-3 font-normal">Event</th>
            <th className="px-5 py-3 font-normal">Verified state</th>
            <th className="px-5 py-3 font-normal">Session</th>
            <th className="px-5 py-3 pr-6 text-right font-normal">Source</th>
          </tr>
        </thead>
        <tbody>
          {events.map((event) => (
            <tr
              key={event.id}
              className="border-b border-border/70 align-top last:border-b-0 hover:bg-secondary/25"
            >
              <td className="whitespace-nowrap px-5 py-4 font-mono text-[0.6875rem] text-muted-foreground">
                {formatDateTime(event.created_at)}
              </td>
              <td className="px-5 py-4">
                <p className="text-sm text-foreground">
                  {eventTypeLabel(event.event_type)}
                </p>
                <p className="mt-1 font-mono text-[0.5625rem] uppercase tracking-[0.12em] text-muted-foreground/45">
                  {event.event_type}
                </p>
              </td>
              <td className="px-5 py-4">
                <div className="flex flex-wrap gap-1.5">
                  <Badge
                    variant={event.totp_enabled ? "success" : "outline"}
                    className="px-1.5 py-1"
                  >
                    TOTP {event.totp_enabled ? "on" : "off"}
                  </Badge>
                  <Badge
                    variant={event.backup_code_enabled ? "muted" : "outline"}
                    className="px-1.5 py-1"
                  >
                    Codes {event.backup_code_enabled ? "on" : "off"}
                  </Badge>
                </div>
              </td>
              <td className="px-5 py-4 font-mono text-[0.625rem] text-muted-foreground">
                {event.session_id ? event.session_id.slice(-10) : "—"}
              </td>
              <td className="px-5 py-4 pr-6 text-right">
                <span className="font-mono text-[0.625rem] uppercase tracking-[0.12em] text-muted-foreground/60">
                  {sourceLabels[event.source] ?? event.source}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function LedgerNotice({
  configured,
  reason,
  message,
}: {
  configured: boolean;
  reason?: string | null;
  message?: string | null;
}) {
  const missingSchema = reason === "missing_schema";

  return (
    <div className="rounded-md border border-warning/25 bg-warning/5 p-6">
      <div className="flex items-start gap-4">
        <span className="grid size-9 shrink-0 place-items-center rounded-sm border border-warning/25 bg-warning/10 text-warning">
          {missingSchema ? (
            <FileWarning className="size-4" aria-hidden="true" />
          ) : (
            <Database className="size-4" aria-hidden="true" />
          )}
        </span>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-sm font-medium text-foreground">
              {missingSchema
                ? "The ledger table is missing."
                : configured
                  ? "The ledger is unreachable."
                  : "The ledger is not connected."}
            </p>
            <Badge variant="warning">Optional for auth</Badge>
          </div>
          <p className="mt-2 max-w-[64ch] text-sm leading-relaxed text-muted-foreground">
            {message ||
              "Authentication and MFA enrollment still work. Add Supabase credentials to turn on the audit trail."}
          </p>

          {!configured ? (
            <ol className="mt-5 space-y-2 text-sm text-muted-foreground">
              <li className="flex gap-3">
                <span className="font-mono text-[0.625rem] text-warning">
                  01
                </span>
                Create a Supabase project and open the SQL editor.
              </li>
              <li className="flex gap-3">
                <span className="font-mono text-[0.625rem] text-warning">
                  02
                </span>
                Run <code className="text-foreground">supabase/schema.sql</code>{" "}
                from this repository.
              </li>
              <li className="flex gap-3">
                <span className="font-mono text-[0.625rem] text-warning">
                  03
                </span>
                Set <code className="text-foreground">SUPABASE_URL</code> and{" "}
                <code className="text-foreground">
                  SUPABASE_SERVICE_ROLE_KEY
                </code>
                , then restart the server.
              </li>
            </ol>
          ) : null}

          <div className="mt-5 flex flex-wrap gap-4">
            <Link
              href={`${site.github}#supabase-setup`}
              target="_blank"
              rel="noreferrer"
              className="text-xs text-warning underline decoration-warning/30 underline-offset-4 hover:decoration-warning"
            >
              Read the Supabase setup
            </Link>
            <Link
              href={`${site.github}/blob/main/supabase/schema.sql`}
              target="_blank"
              rel="noreferrer"
              className="text-xs text-muted-foreground underline decoration-border underline-offset-4 hover:text-foreground"
            >
              Open schema.sql
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
