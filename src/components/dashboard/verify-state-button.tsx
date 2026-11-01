"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

export function VerifyStateButton({
  label = "Verify current state",
  size = "default",
  variant = "outline",
}: {
  label?: string;
  size?: "default" | "sm" | "lg";
  variant?: "default" | "outline" | "secondary";
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function verify() {
    setPending(true);

    try {
      const response = await fetch("/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "sync" }),
      });

      const data = (await response.json().catch(() => null)) as {
        ok?: boolean;
        message?: string;
        error?: string;
        event?: unknown;
      } | null;

      if (!response.ok || !data?.ok) {
        toast.error("State not written", {
          description:
            data?.message ||
            data?.error ||
            "The audit API could not verify the current state.",
        });
        return;
      }

      toast.success("State verified", {
        description: data.event
          ? "The server re-read Clerk and wrote a new ledger row."
          : "The server re-read Clerk. No ledger row was returned.",
      });
      router.refresh();
    } catch {
      toast.error("State not verified", {
        description: "The audit API is unreachable. Check the server logs.",
      });
    } finally {
      setPending(false);
    }
  }

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      onClick={verify}
      disabled={pending}
    >
      {pending ? (
        <Loader2 className="animate-spin" aria-hidden="true" />
      ) : (
        <RefreshCw aria-hidden="true" />
      )}
      {pending ? "Verifying…" : label}
    </Button>
  );
}
