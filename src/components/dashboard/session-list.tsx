"use client";

import { useEffect, useState } from "react";
import { useSession, useUser } from "@clerk/nextjs";
import {
  AlertTriangle,
  Laptop,
  Loader2,
  MapPin,
  MonitorSmartphone,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDateTime } from "@/lib/utils";

type SessionRow = {
  id: string;
  status: string;
  lastActiveAt: Date;
  expireAt: Date;
  latestActivity: {
    browserName?: string;
    browserVersion?: string;
    deviceType?: string;
    city?: string;
    country?: string;
    ipAddress?: string;
  } | null;
  revoke: () => Promise<unknown>;
};

/**
 * Clerk can still report a session as active for a moment after `revoke()`
 * resolves. POST /api/audit refuses to record an active session, so retry a
 * few times instead of dropping the ledger entry on the first 409.
 */
async function recordRevocation(sessionId: string): Promise<boolean> {
  for (let attempt = 0; attempt < 6; attempt += 1) {
    const response = await fetch("/api/audit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "session_revoked", sessionId }),
    }).catch(() => null);

    if (response?.ok) return true;
    if (!response || response.status !== 409) return false;

    await new Promise((resolve) => setTimeout(resolve, 350 * (attempt + 1)));
  }

  return false;
}

export function SessionList() {
  const { user, isLoaded } = useUser();
  const { session: currentSession } = useSession();
  const [sessions, setSessions] = useState<SessionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [revoking, setRevoking] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (!user) return;

    let cancelled = false;

    async function loadSessions() {
      try {
        const rows = await user!.getSessions();
        if (cancelled) return;

        const mapped = rows.map((item) => ({
          id: item.id,
          status: item.status,
          lastActiveAt: item.lastActiveAt,
          expireAt: item.expireAt,
          latestActivity: item.latestActivity ?? null,
          revoke: () => item.revoke(),
        }));
        const ordered = mapped.sort((a, b) => {
          if (a.status === "active" && b.status !== "active") return -1;
          if (a.status !== "active" && b.status === "active") return 1;
          return b.lastActiveAt.getTime() - a.lastActiveAt.getTime();
        });

        setSessions(ordered);
        setError(null);
      } catch (loadError) {
        if (!cancelled) {
          setError(describeError(loadError));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadSessions();

    return () => {
      cancelled = true;
    };
  }, [user, refreshKey]);

  async function revoke(session: SessionRow) {
    setRevoking(session.id);

    try {
      await session.revoke();
      toast.success("Session revoked", {
        description: "The device will need to authenticate again.",
      });
      setLoading(true);
      setRefreshKey((value) => value + 1);

      void recordRevocation(session.id).then((recorded) => {
        if (!recorded) {
          toast.warning("Ledger entry did not land", {
            description:
              "Clerk revoked the session, but the record could not be verified. Use Verify current state on the overview to re-check.",
          });
        }
      });
    } catch (revokeError) {
      toast.error("Could not revoke the session", {
        description: describeError(revokeError),
      });
    } finally {
      setRevoking(null);
    }
  }

  if (!isLoaded || loading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-start gap-3 rounded-md border border-destructive/25 bg-destructive/5 p-4 text-sm text-muted-foreground">
        <AlertTriangle className="mt-0.5 size-4 shrink-0 text-destructive" />
        <div>
          <p className="font-medium text-foreground">Sessions unavailable</p>
          <p className="mt-1">{error}</p>
        </div>
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <p className="rounded-md border border-border bg-background/40 p-4 text-sm text-muted-foreground">
        Clerk returned no sessions for this account.
      </p>
    );
  }

  return (
    <div className="divide-y divide-border overflow-hidden rounded-md border border-border bg-background/35">
      {sessions.map((session) => {
        const current = session.id === currentSession?.id;
        const active = session.status === "active";
        const activity = session.latestActivity;
        const device =
          [activity?.browserName, activity?.deviceType]
            .filter(Boolean)
            .join(" · ") || "Unknown device";
        const location =
          [activity?.city, activity?.country].filter(Boolean).join(", ") ||
          "Unknown location";

        return (
          <div
            key={session.id}
            className="flex flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex min-w-0 items-start gap-3">
              <span className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-sm border border-border bg-secondary text-muted-foreground">
                {activity?.deviceType
                  ?.toLowerCase()
                  .includes("mobile") ? (
                  <MonitorSmartphone className="size-4" aria-hidden="true" />
                ) : (
                  <Laptop className="size-4" aria-hidden="true" />
                )}
              </span>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-medium text-foreground">{device}</p>
                  {current ? (
                    <Badge variant="success">This device</Badge>
                  ) : null}
                  {!active ? (
                    <Badge variant="outline">{session.status}</Badge>
                  ) : null}
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="size-3" aria-hidden="true" />
                    {location}
                  </span>
                  <span>
                    Active {formatDateTime(session.lastActiveAt)}
                  </span>
                  {activity?.ipAddress ? (
                    <span className="font-mono text-[0.625rem]">
                      {activity.ipAddress}
                    </span>
                  ) : null}
                </div>
              </div>
            </div>

            {active && !current ? (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="destructive"
                    size="sm"
                    disabled={revoking === session.id}
                  >
                    {revoking === session.id ? (
                      <Loader2 className="animate-spin" aria-hidden="true" />
                    ) : (
                      <Trash2 aria-hidden="true" />
                    )}
                    Revoke
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Revoke this session?</AlertDialogTitle>
                    <AlertDialogDescription>
                      {device} in {location} will be signed out immediately.
                      This cannot be undone. The action is recorded in the
                      ledger after the server confirms the session is inactive.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Keep session</AlertDialogCancel>
                    <AlertDialogAction onClick={() => void revoke(session)}>
                      Revoke session
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            ) : (
              <span className="font-mono text-[0.5625rem] uppercase tracking-[0.14em] text-muted-foreground/35">
                {current ? "current" : session.status}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

function describeError(error: unknown) {
  if (typeof error === "object" && error && "errors" in error) {
    const clerkError = error as {
      errors?: Array<{ longMessage?: string; message?: string }>;
    };
    const first = clerkError.errors?.[0];
    if (first?.longMessage || first?.message) {
      return first.longMessage || first.message || "Clerk rejected the request.";
    }
  }

  if (error instanceof Error) return error.message;
  return "Clerk rejected the request.";
}
