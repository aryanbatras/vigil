import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import {
  isAuditConfigured,
  listSecurityEvents,
  recordSecurityEvent,
} from "@/lib/audit/store";
import {
  readVerifiedSession,
  readVerifiedUser,
} from "@/lib/audit/verify";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json(
      { ok: false, error: "Unauthorized" },
      { status: 401 },
    );
  }

  const result = await listSecurityEvents(userId, 50);

  return NextResponse.json({
    ok: result.ok,
    configured: isAuditConfigured(),
    reason: result.reason,
    message: result.message,
    events: result.events,
  });
}

export async function POST(request: Request) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json(
      { ok: false, error: "Unauthorized" },
      { status: 401 },
    );
  }

  const payload = (await request.json().catch(() => null)) as {
    action?: unknown;
    sessionId?: unknown;
  } | null;

  const action =
    payload && typeof payload.action === "string" ? payload.action : "sync";

  try {
    if (action === "sync") {
      const state = await readVerifiedUser(userId);
      const result = await recordSecurityEvent({
        userId,
        eventType: "posture_verified",
        source: "server_sync",
        state,
        detail: {
          checkedFrom: "clerk_backend_api",
        },
      });

      if (!result.ok) {
        return NextResponse.json(
          {
            ok: false,
            configured: result.reason !== "not_configured",
            reason: result.reason,
            message: result.message,
            state,
          },
          { status: result.reason === "not_configured" ? 503 : 500 },
        );
      }

      return NextResponse.json({
        ok: true,
        configured: true,
        duplicate: result.duplicate,
        event: result.event,
        state,
      });
    }

    if (action === "session_revoked") {
      const sessionId = payload?.sessionId;

      if (typeof sessionId !== "string" || !sessionId.startsWith("sess_")) {
        return NextResponse.json(
          { ok: false, error: "A valid sessionId is required." },
          { status: 400 },
        );
      }

      const session = await readVerifiedSession(sessionId);

      if (session.userId !== userId) {
        return NextResponse.json(
          { ok: false, error: "That session does not belong to you." },
          { status: 403 },
        );
      }

      if (session.status === "active") {
        return NextResponse.json(
          {
            ok: false,
            error: "The session is still active. Revoke it before recording.",
          },
          { status: 409 },
        );
      }

      const state = await readVerifiedUser(userId);
      const result = await recordSecurityEvent({
        userId,
        eventType: "session_revoked",
        source: "session_action",
        state,
        sessionId,
        detail: {
          sessionStatus: session.status,
          checkedFrom: "clerk_backend_api",
        },
      });

      if (!result.ok) {
        return NextResponse.json(
          {
            ok: false,
            configured: result.reason !== "not_configured",
            reason: result.reason,
            message: result.message,
          },
          { status: result.reason === "not_configured" ? 503 : 500 },
        );
      }

      return NextResponse.json({
        ok: true,
        configured: true,
        event: result.event,
        state,
      });
    }

    return NextResponse.json(
      { ok: false, error: "Unknown audit action." },
      { status: 400 },
    );
  } catch (error) {
    console.error("[audit] verification failed", error);
    return NextResponse.json(
      {
        ok: false,
        error: "The server could not verify the current MFA state.",
      },
      { status: 500 },
    );
  }
}
