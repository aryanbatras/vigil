"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { QRCodeSVG } from "qrcode.react";
import {
  AlertTriangle,
  CheckCircle2,
  Download,
  KeyRound,
  Loader2,
  LockKeyhole,
  RefreshCw,
  ShieldCheck,
  Smartphone,
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
import { CopyButton } from "@/components/dashboard/copy-button";
import { SessionList } from "@/components/dashboard/session-list";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type SecurityTab = "authenticator" | "recovery" | "sessions";

export function MfaManager({ initialTab }: { initialTab?: string }) {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [tab, setTab] = useState<SecurityTab>(normalizeTab(initialTab));
  const [enrollment, setEnrollment] = useState<{
    uri: string;
    secret: string;
  } | null>(null);
  const [code, setCode] = useState("");
  const [pendingAction, setPendingAction] = useState<string | null>(null);
  const [codes, setCodes] = useState<string[] | null>(null);

  if (!isLoaded) {
    return (
      <div className="space-y-4 rounded-md border border-border bg-card/35 p-6">
        <Skeleton className="h-10 w-56" />
        <Skeleton className="h-4 w-80" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="rounded-md border border-destructive/25 bg-destructive/5 p-4 text-sm text-muted-foreground">
        The Clerk user could not be loaded. Refresh the page and try again.
      </div>
    );
  }

  const totpEnabled = user.totpEnabled;
  const backupCodeEnabled = user.backupCodeEnabled;
  const email = user.primaryEmailAddress?.emailAddress ?? "your account";

  async function syncAudit() {
    try {
      await fetch("/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "sync" }),
      });
    } catch {
      // The ledger is optional. Enrollment should not fail because it is down.
    }
  }

  async function startEnrollment() {
    if (!user) return;
    setPendingAction("start");

    try {
      const resource = await user.createTOTP();

      if (!resource.secret && !resource.uri) {
        throw new Error("Clerk did not return an authenticator secret.");
      }

      setEnrollment({
        uri: resource.uri ?? "",
        secret: resource.secret ?? "",
      });
      setCode("");
    } catch (error) {
      toast.error("Could not start authenticator enrollment", {
        description: `${describeError(error)} If this is a new Clerk instance, enable the Authenticator application strategy in the dashboard.`,
        duration: 9000,
      });
    } finally {
      setPendingAction(null);
    }
  }

  async function verifyCode(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user || !enrollment) return;

    const clean = code.replace(/\D/g, "").slice(0, 6);

    if (clean.length !== 6) {
      toast.error("Enter a six-digit code from the authenticator");
      return;
    }

    setPendingAction("verify");

    try {
      await user.verifyTOTP({ code: clean });
      await user.reload();
      setEnrollment(null);
      setCode("");
      toast.success("Authenticator enrolled", {
        description:
          "Clerk will now ask for a rotating code after your email factor.",
      });
      await syncAudit();
      router.refresh();
    } catch (error) {
      toast.error("The code was not accepted", {
        description: describeError(error),
      });
    } finally {
      setPendingAction(null);
    }
  }

  async function disableTotp() {
    if (!user) return;
    setPendingAction("disable");

    try {
      await user.disableTOTP();
      await user.reload();
      setEnrollment(null);
      toast.success("Authenticator removed", {
        description:
          "The dashboard gate now redirects to this page until you enroll again.",
      });
      await syncAudit();
      router.refresh();
    } catch (error) {
      toast.error("Could not remove the authenticator", {
        description: describeError(error),
      });
    } finally {
      setPendingAction(null);
    }
  }

  async function generateCodes() {
    if (!user) return;
    setPendingAction("generate");

    try {
      const resource = await user.createBackupCode();
      setCodes(resource.codes);
      await user.reload();
      toast.success("Recovery codes generated", {
        description: "Store them now. They are shown once.",
      });
      await syncAudit();
      router.refresh();
    } catch (error) {
      toast.error("Could not generate recovery codes", {
        description: `${describeError(error)} The Backup code strategy may be disabled in Clerk.`,
        duration: 9000,
      });
    } finally {
      setPendingAction(null);
    }
  }

  function downloadCodes() {
    if (!codes) return;

    const body = [
      "Vigil / recovery codes",
      `Account: ${email}`,
      `Generated: ${new Date().toISOString()}`,
      "",
      "Each code works once. Store this file offline.",
      "",
      ...codes,
      "",
    ].join("\n");

    const blob = new Blob([body], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "vigil-recovery-codes.txt";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
    toast.success("Recovery codes downloaded");
  }

  return (
    <Tabs value={tab} onValueChange={(value) => setTab(value as SecurityTab)}>
      <TabsList className="w-full justify-start overflow-x-auto sm:w-fit">
        <TabsTrigger value="authenticator">
          <Smartphone aria-hidden="true" />
          Authenticator
        </TabsTrigger>
        <TabsTrigger value="recovery">
          <KeyRound aria-hidden="true" />
          Recovery
        </TabsTrigger>
        <TabsTrigger value="sessions">
          <ShieldCheck aria-hidden="true" />
          Sessions
        </TabsTrigger>
      </TabsList>

      <TabsContent value="authenticator">
        <div className="grid gap-6 lg:grid-cols-12">
          <section className="rounded-md border border-border bg-card/35 lg:col-span-8">
            <div className="flex flex-col gap-4 border-b border-border px-5 py-5 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-start gap-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-sm border border-border bg-secondary text-signal">
                  <Smartphone className="size-4" aria-hidden="true" />
                </span>
                <div>
                  <p className="label-mono text-muted-foreground/45">
                    Method 01
                  </p>
                  <h2 className="mt-1.5 font-display text-2xl font-extrabold leading-tight tracking-[-0.03em]">
                    {totpEnabled
                      ? "Authenticator active."
                      : "Add an authenticator."}
                  </h2>
                  <p className="mt-1 text-xs text-muted-foreground">
                    TOTP · 30-second rotation · secret held by Clerk
                  </p>
                </div>
              </div>
              <Badge variant={totpEnabled ? "success" : "warning"}>
                {totpEnabled ? "Enrolled" : "Not enrolled"}
              </Badge>
            </div>

            <div className="p-5 md:p-6">
              {totpEnabled ? (
                <>
                  <p className="max-w-[58ch] text-sm leading-relaxed text-muted-foreground">
                    Clerk will ask for a six-digit code after the email factor.
                    Vigil never receives the secret or the codes you type; it
                    only sees the enabled state after the server checks.
                  </p>

                  <dl className="mt-6 grid gap-px overflow-hidden rounded-sm border border-border bg-border sm:grid-cols-2">
                    <Fact label="Method" value="TOTP" />
                    <Fact label="Rotation" value="30 seconds" />
                    <Fact label="Secret storage" value="Clerk" />
                    <Fact
                      label="Recovery codes"
                      value={backupCodeEnabled ? "Active" : "Not generated"}
                    />
                  </dl>

                  <div className="mt-6 flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setTab("recovery")}
                    >
                      <KeyRound aria-hidden="true" />
                      Manage recovery codes
                    </Button>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm">
                          <Trash2 aria-hidden="true" />
                          Remove authenticator
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Remove the second factor?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            Every dashboard route will redirect back to this
                            page until a new authenticator is enrolled.
                            Recovery codes do not replace the TOTP gate. The
                            change is written to the ledger if it is connected.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Keep it</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => void disableTotp()}
                            disabled={pendingAction === "disable"}
                          >
                            {pendingAction === "disable" ? (
                              <Loader2
                                className="animate-spin"
                                aria-hidden="true"
                              />
                            ) : null}
                            Remove authenticator
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </>
              ) : enrollment ? (
                <div className="grid gap-6 md:grid-cols-[190px_minmax(0,1fr)]">
                  <div className="flex flex-col items-center gap-3">
                    <div className="rounded-sm bg-paper p-3">
                      {enrollment.uri ? (
                        <QRCodeSVG
                          value={enrollment.uri}
                          size={166}
                          level="M"
                          bgColor="#f4f7f2"
                          fgColor="#06343a"
                          marginSize={1}
                        />
                      ) : (
                        <div className="grid size-[166px] place-items-center px-4 text-center font-mono text-[0.625rem] uppercase tracking-[0.12em] text-ink/50">
                          URI unavailable — use the manual key
                        </div>
                      )}
                    </div>
                    <p className="max-w-[20ch] text-center font-mono text-[0.5625rem] uppercase leading-relaxed tracking-[0.12em] text-muted-foreground/50">
                      Scan with 1Password, Authy, or Google Authenticator
                    </p>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-foreground">
                      Verify the code
                    </p>
                    <p className="mt-1 max-w-[48ch] text-xs leading-relaxed text-muted-foreground">
                      Enter the six digits currently shown in the app. If the
                      code is accepted, the secret is verified and the gate
                      closes.
                    </p>

                    <form onSubmit={verifyCode} className="mt-4">
                      <Label
                        htmlFor="totp-code"
                        className="font-mono text-[0.625rem] uppercase tracking-[0.14em] text-muted-foreground"
                      >
                        Six-digit code
                      </Label>
                      <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                        <Input
                          id="totp-code"
                          name="code"
                          value={code}
                          onChange={(event) => setCode(event.target.value)}
                          inputMode="numeric"
                          autoComplete="one-time-code"
                          pattern="[0-9]*"
                          maxLength={6}
                          autoFocus
                          placeholder="000000"
                          className="h-11 w-full font-mono text-lg tracking-[0.28em] sm:max-w-[190px]"
                        />
                        <Button
                          type="submit"
                          disabled={pendingAction === "verify"}
                          className="h-11"
                        >
                          {pendingAction === "verify" ? (
                            <Loader2
                              className="animate-spin"
                              aria-hidden="true"
                            />
                          ) : (
                            <CheckCircle2 aria-hidden="true" />
                          )}
                          Verify and enroll
                        </Button>
                      </div>
                    </form>

                    {enrollment.secret ? (
                      <details className="mt-5">
                        <summary className="cursor-pointer text-xs text-muted-foreground underline decoration-border underline-offset-4 hover:text-foreground">
                          Can&apos;t scan? Use the manual key
                        </summary>
                        <div className="mt-3 rounded-sm border border-border bg-background/60 p-3">
                          <p className="font-mono text-[0.625rem] uppercase tracking-[0.12em] text-muted-foreground/50">
                            Manual key
                          </p>
                          <p className="mt-2 break-all font-mono text-xs leading-relaxed text-foreground">
                            {formatSecret(enrollment.secret)}
                          </p>
                          <CopyButton
                            value={enrollment.secret}
                            label="Copy key"
                            className="mt-3"
                          />
                        </div>
                      </details>
                    ) : null}

                    <div className="mt-5 flex flex-wrap gap-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEnrollment(null);
                          setCode("");
                        }}
                      >
                        Cancel enrollment
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <p className="max-w-[58ch] text-sm leading-relaxed text-muted-foreground">
                    The first factor proves the inbox. The authenticator proves
                    the device. Enroll once, then every new session asks for a
                    rotating code.
                  </p>

                  <ol className="mt-6 max-w-[58ch] space-y-3">
                    <Step
                      number="01"
                      title="Open an authenticator app"
                      body="1Password, Authy, Google Authenticator, or any TOTP-compatible app."
                    />
                    <Step
                      number="02"
                      title="Scan the one-time QR"
                      body="Clerk issues the secret. Vigil only uses it to draw the code you scan."
                    />
                    <Step
                      number="03"
                      title="Verify one code"
                      body="A six-digit code proves the secret landed on the device. Then the gate closes."
                    />
                  </ol>

                  <div className="mt-6 flex flex-wrap items-center gap-3">
                    <Button
                      onClick={() => void startEnrollment()}
                      disabled={pendingAction === "start"}
                    >
                      {pendingAction === "start" ? (
                        <Loader2 className="animate-spin" aria-hidden="true" />
                      ) : (
                        <Smartphone aria-hidden="true" />
                      )}
                      Begin enrollment
                    </Button>
                    <p className="text-xs text-muted-foreground">
                      Requires the Authenticator application strategy in Clerk.
                    </p>
                  </div>
                </>
              )}
            </div>
          </section>

          <aside className="space-y-4 lg:col-span-4">
            <div className="rounded-md border border-border bg-card/35 p-5">
              <p className="label-mono text-muted-foreground/45">
                Where it lives
              </p>
              <dl className="mt-4 space-y-3 text-sm">
                <AsideRow label="TOTP secret" value="Clerk" />
                <AsideRow label="Recovery codes" value="Clerk" />
                <AsideRow
                  label="Enabled state"
                  value="Clerk + ledger"
                />
                <AsideRow label="Session token" value="Clerk" />
              </dl>
              <p className="mt-4 border-t border-border pt-4 text-xs leading-relaxed text-muted-foreground">
                The secret is returned to the browser once to draw the QR code.
                It is never sent to Supabase or written to a log by Vigil.
              </p>
            </div>

            <div className="rounded-md border border-border bg-card/35 p-5">
              <p className="label-mono text-muted-foreground/45">
                If enrollment fails
              </p>
              <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                A fresh Clerk application may have the Authenticator
                application strategy turned off. Enable it under{" "}
                <span className="text-foreground">
                  User &amp; Authentication → Multi-factor
                </span>{" "}
                in the Clerk dashboard. The app will surface the API error
                rather than pretending it worked.
              </p>
            </div>
          </aside>
        </div>
      </TabsContent>

      <TabsContent value="recovery">
        <div className="grid gap-6 lg:grid-cols-12">
          <section className="rounded-md border border-border bg-card/35 lg:col-span-8">
            <div className="flex flex-col gap-4 border-b border-border px-5 py-5 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-start gap-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-sm border border-border bg-secondary text-signal">
                  <KeyRound className="size-4" aria-hidden="true" />
                </span>
                <div>
                  <p className="label-mono text-muted-foreground/45">
                    Method 02
                  </p>
                  <h2 className="mt-1.5 font-display text-2xl font-extrabold leading-tight tracking-[-0.03em]">
                    {codes
                      ? "Save these codes."
                      : backupCodeEnabled
                        ? "Recovery codes active."
                        : "Add recovery codes."}
                  </h2>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Single-use · shown once · regenerated on request
                  </p>
                </div>
              </div>
              <Badge variant={backupCodeEnabled ? "success" : "outline"}>
                {backupCodeEnabled ? "Active" : "Not generated"}
              </Badge>
            </div>

            <div className="p-5 md:p-6">
              {codes ? (
                <>
                  <div className="flex items-start gap-3 rounded-sm border border-warning/25 bg-warning/5 p-3 text-xs leading-relaxed text-muted-foreground">
                    <AlertTriangle
                      className="mt-0.5 size-4 shrink-0 text-warning"
                      aria-hidden="true"
                    />
                    <p>
                      These are shown once. Store them offline, not in the same
                      place as your authenticator. Each code works once.
                    </p>
                  </div>

                  <div className="mt-5 grid gap-2 sm:grid-cols-2">
                    {codes.map((backupCode, index) => (
                      <div
                        key={backupCode}
                        className="flex items-center justify-between gap-3 rounded-sm border border-border bg-background/55 px-3 py-2.5"
                      >
                        <span className="font-mono text-sm tracking-[0.08em] text-foreground">
                          {backupCode}
                        </span>
                        <span className="font-mono text-[0.5625rem] text-muted-foreground/35">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-5 flex flex-wrap gap-2">
                    <CopyButton
                      value={codes.join("\n")}
                      label="Copy all"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={downloadCodes}
                    >
                      <Download aria-hidden="true" />
                      Download .txt
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setCodes(null)}
                    >
                      I&apos;ve stored them
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <p className="max-w-[58ch] text-sm leading-relaxed text-muted-foreground">
                    {backupCodeEnabled
                      ? "A set is active, but Clerk will not show it again. Generate a fresh set if you did not store the last one. Every old code stops working immediately."
                      : "Ten single-use codes are the fallback when the authenticator is lost. They are generated by Clerk and shown exactly once."}
                  </p>

                  <div className="mt-6 flex flex-wrap items-center gap-3">
                    {backupCodeEnabled ? (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            disabled={pendingAction === "generate"}
                            variant="outline"
                          >
                            {pendingAction === "generate" ? (
                              <Loader2
                                className="animate-spin"
                                aria-hidden="true"
                              />
                            ) : (
                              <RefreshCw aria-hidden="true" />
                            )}
                            Generate new codes
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Replace the recovery codes?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              Clerk will invalidate the current set and return
                              ten new single-use codes. If you still have the
                              old set, it will stop working.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Keep the old set</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => void generateCodes()}
                            >
                              Generate new codes
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    ) : (
                      <Button
                        onClick={() => void generateCodes()}
                        disabled={pendingAction === "generate"}
                      >
                        {pendingAction === "generate" ? (
                          <Loader2
                            className="animate-spin"
                            aria-hidden="true"
                          />
                        ) : (
                          <KeyRound aria-hidden="true" />
                        )}
                        Generate 10 codes
                      </Button>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Requires the Backup code strategy in Clerk.
                    </p>
                  </div>
                </>
              )}
            </div>
          </section>

          <aside className="space-y-4 lg:col-span-4">
            <div className="rounded-md border border-border bg-card/35 p-5">
              <p className="label-mono text-muted-foreground/45">
                How recovery works
              </p>
              <ul className="mt-4 space-y-3 text-xs leading-relaxed text-muted-foreground">
                <li className="flex gap-2.5">
                  <LockKeyhole
                    className="mt-0.5 size-3.5 shrink-0 text-signal"
                    aria-hidden="true"
                  />
                  Clerk issues the codes. Vigil receives them once to display
                  them and never writes them down.
                </li>
                <li className="flex gap-2.5">
                  <LockKeyhole
                    className="mt-0.5 size-3.5 shrink-0 text-signal"
                    aria-hidden="true"
                  />
                  Each code satisfies the second factor once. A used code is
                  spent.
                </li>
                <li className="flex gap-2.5">
                  <LockKeyhole
                    className="mt-0.5 size-3.5 shrink-0 text-signal"
                    aria-hidden="true"
                  />
                  Regenerating replaces the whole set. There is no &ldquo;view
                  existing codes&rdquo; button.
                </li>
              </ul>
            </div>
            <div className="rounded-md border border-border bg-card/35 p-5">
              <p className="label-mono text-muted-foreground/45">
                Ledger note
              </p>
              <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                The ledger records that the backup-code flag changed. It never
                records the codes themselves.
              </p>
            </div>
          </aside>
        </div>
      </TabsContent>

      <TabsContent value="sessions">
        <div className="grid gap-6 lg:grid-cols-12">
          <section className="rounded-md border border-border bg-card/35 lg:col-span-8">
            <div className="flex items-start gap-3 border-b border-border px-5 py-5">
              <span className="grid size-10 shrink-0 place-items-center rounded-sm border border-border bg-secondary text-signal">
                <ShieldCheck className="size-4" aria-hidden="true" />
              </span>
              <div>
                <p className="label-mono text-muted-foreground/45">
                  Session control
                </p>
                <h2 className="mt-1.5 font-display text-2xl font-extrabold leading-tight tracking-[-0.03em]">
                  Devices with access.
                </h2>
                <p className="mt-1 text-xs text-muted-foreground">
                  Clerk session metadata · revocations are server-verified
                </p>
              </div>
            </div>
            <div className="p-4 md:p-5">
              <SessionList />
            </div>
          </section>

          <aside className="space-y-4 lg:col-span-4">
            <div className="rounded-md border border-border bg-card/35 p-5">
              <p className="label-mono text-muted-foreground/45">
                What revocation does
              </p>
              <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                The session is removed by Clerk. The device must authenticate
                again. Vigil then asks Clerk whether the session is still
                active before writing the event to Supabase.
              </p>
            </div>
            <div className="rounded-md border border-border bg-card/35 p-5">
              <p className="label-mono text-muted-foreground/45">
                Current device
              </p>
              <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                The session you are using is marked{" "}
                <span className="text-signal">This device</span> and cannot be
                revoked from this screen. Sign out instead.
              </p>
            </div>
          </aside>
        </div>
      </TabsContent>
    </Tabs>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-card px-4 py-3">
      <dt className="font-mono text-[0.5625rem] uppercase tracking-[0.12em] text-muted-foreground/45">
        {label}
      </dt>
      <dd className="mt-1.5 text-sm text-foreground">{value}</dd>
    </div>
  );
}

function AsideRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-mono text-[0.625rem] uppercase tracking-[0.1em] text-foreground">
        {value}
      </dd>
    </div>
  );
}

function Step({
  number,
  title,
  body,
}: {
  number: string;
  title: string;
  body: string;
}) {
  return (
    <li className="flex gap-3">
      <span className="mt-0.5 font-mono text-[0.625rem] text-signal">
        {number}
      </span>
      <div>
        <p className="text-sm text-foreground">{title}</p>
        <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
          {body}
        </p>
      </div>
    </li>
  );
}

function normalizeTab(value?: string): SecurityTab {
  if (value === "recovery" || value === "sessions") return value;
  return "authenticator";
}

function formatSecret(secret: string) {
  return secret.replace(/(.{4})/g, "$1 ").trim();
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
