import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import type {
  AuditEventInput,
  SecurityEvent,
} from "@/lib/audit/types";

let cachedClient: SupabaseClient | null | undefined;

export function isAuditConfigured() {
  return Boolean(
    process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY,
  );
}

/**
 * Server-only Supabase client. The service-role key bypasses RLS, so this
 * module must never be imported into a client component.
 */
export function getAuditClient() {
  if (cachedClient !== undefined) return cachedClient;

  const url = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    cachedClient = null;
    return cachedClient;
  }

  cachedClient = createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    global: {
      headers: {
        "X-Client-Info": "vigil-audit/1.0",
      },
    },
  });

  return cachedClient;
}

export async function recordSecurityEvent(input: AuditEventInput) {
  const client = getAuditClient();

  if (!client) {
    return {
      ok: false as const,
      reason: "not_configured" as const,
      message:
        "The audit ledger is not connected. Add SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.",
    };
  }

  const { data, error } = await client
    .from("security_events")
    .insert({
      user_id: input.userId,
      event_type: input.eventType,
      totp_enabled: input.state.totpEnabled,
      backup_code_enabled: input.state.backupCodeEnabled,
      two_factor_enabled: input.state.twoFactorEnabled,
      session_id: input.sessionId ?? null,
      source: input.source,
      detail: input.detail ?? {},
      clerk_event_id: input.clerkEventId ?? null,
    })
    .select("*")
    .single();

  if (error) {
    if (error.code === "23505") {
      return { ok: true as const, event: null, duplicate: true };
    }

    if (error.code === "42P01") {
      return {
        ok: false as const,
        reason: "missing_schema" as const,
        message:
          "The security_events table does not exist yet. Run supabase/schema.sql in the Supabase SQL editor.",
      };
    }

    return {
      ok: false as const,
      reason: "write_failed" as const,
      message: error.message,
    };
  }

  return { ok: true as const, event: data as SecurityEvent, duplicate: false };
}

export async function listSecurityEvents(userId: string, limit = 50) {
  const client = getAuditClient();

  if (!client) {
    return {
      ok: false as const,
      reason: "not_configured" as const,
      events: [] as SecurityEvent[],
      message:
        "The audit ledger is not connected. Add SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.",
    };
  }

  const safeLimit = Math.min(Math.max(limit, 1), 100);

  const { data, error } = await client
    .from("security_events")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(safeLimit);

  if (error) {
    if (error.code === "42P01") {
      return {
        ok: false as const,
        reason: "missing_schema" as const,
        events: [] as SecurityEvent[],
        message:
          "The security_events table does not exist yet. Run supabase/schema.sql in the Supabase SQL editor.",
      };
    }

    return {
      ok: false as const,
      reason: "read_failed" as const,
      events: [] as SecurityEvent[],
      message: error.message,
    };
  }

  return {
    ok: true as const,
    reason: null,
    events: (data ?? []) as SecurityEvent[],
    message: null,
  };
}

export async function countSecurityEvents(userId: string) {
  const client = getAuditClient();

  if (!client) return null;

  const { count, error } = await client
    .from("security_events")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId);

  if (error) return null;
  return count ?? 0;
}
