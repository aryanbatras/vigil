import { NextResponse } from "next/server";

import {
  isAuditConfigured,
  listSecurityEvents,
  recordSecurityEvent,
} from "@/lib/audit/store";
import { verifyClerkWebhook } from "@/lib/audit/webhook";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ClerkUserWebhook = {
  type?: string;
  data?: {
    id?: string;
    totp_enabled?: boolean;
    backup_code_enabled?: boolean;
    two_factor_enabled?: boolean;
  };
};

export async function POST(request: Request) {
  if (!isAuditConfigured()) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "The audit ledger is not connected. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.",
      },
      { status: 503 },
    );
  }

  const secret = process.env.CLERK_WEBHOOK_SIGNING_SECRET;

  if (!secret) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "CLERK_WEBHOOK_SIGNING_SECRET is not set. Add the signing secret from the Clerk webhook endpoint.",
      },
      { status: 501 },
    );
  }

  const body = await request.text();
  const verification = verifyClerkWebhook({
    body,
    id: request.headers.get("svix-id"),
    timestamp: request.headers.get("svix-timestamp"),
    signature: request.headers.get("svix-signature"),
    secret,
  });

  if (!verification.ok) {
    return NextResponse.json(
      { ok: false, error: "Invalid webhook signature." },
      { status: 401 },
    );
  }

  let event: ClerkUserWebhook;

  try {
    event = JSON.parse(body) as ClerkUserWebhook;
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid JSON payload." },
      { status: 400 },
    );
  }

  if (event.type !== "user.created" && event.type !== "user.updated") {
    return NextResponse.json({ ok: true, skipped: "irrelevant_event" });
  }

  const data = event.data;

  if (!data?.id) {
    return NextResponse.json(
      { ok: false, error: "The webhook is missing a user id." },
      { status: 400 },
    );
  }

  const state = {
    totpEnabled: Boolean(data.totp_enabled),
    backupCodeEnabled: Boolean(data.backup_code_enabled),
    twoFactorEnabled: Boolean(data.two_factor_enabled),
  };

  const latest = await listSecurityEvents(data.id, 1);

  if (!latest.ok) {
    return NextResponse.json(
      { ok: false, error: latest.message },
      { status: 500 },
    );
  }

  const previous = latest.events[0];

  if (
    previous &&
    previous.totp_enabled === state.totpEnabled &&
    previous.backup_code_enabled === state.backupCodeEnabled &&
    previous.two_factor_enabled === state.twoFactorEnabled
  ) {
    return NextResponse.json({ ok: true, skipped: "state_unchanged" });
  }

  const result = await recordSecurityEvent({
    userId: data.id,
    eventType: "mfa_state_changed",
    source: "clerk_webhook",
    state,
    detail: {
      webhookType: event.type,
      checkedFrom: "clerk_webhook_signature",
    },
    clerkEventId: request.headers.get("svix-id"),
  });

  if (!result.ok) {
    return NextResponse.json(
      { ok: false, error: result.message },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true, skipped: result.duplicate });
}
