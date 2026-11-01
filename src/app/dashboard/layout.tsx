import Link from "next/link";
import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";
import { auth } from "@clerk/nextjs/server";

import { DashboardNav } from "@/components/dashboard/dashboard-nav";
import { MobileNav } from "@/components/dashboard/mobile-nav";
import { SignOutButton } from "@/components/dashboard/sign-out-button";
import { Badge } from "@/components/ui/badge";
import { Toaster } from "@/components/ui/sonner";
import { initials } from "@/lib/utils";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [{ sessionId }, user] = await Promise.all([auth(), currentUser()]);

  if (!user) {
    redirect("/sign-in");
  }

  const email = user.primaryEmailAddress?.emailAddress ?? "No email";
  const name = user.fullName || email;
  const initialsValue = initials(user.fullName, email);

  return (
    <div className="console min-h-svh bg-background text-foreground">
      <div className="mx-auto flex min-h-svh w-full max-w-[1600px]">
        <aside className="hidden w-[252px] shrink-0 flex-col border-r border-border px-3 py-5 lg:flex">
          <Link
            href="/dashboard"
            className="mb-10 flex items-center gap-3 px-3"
          >
            <span className="grid size-8 place-items-center rounded-sm bg-signal font-display text-sm font-extrabold text-teal-deep">
              V
            </span>
            <span>
              <span className="block font-display text-lg font-extrabold leading-none tracking-[-0.03em]">
                Vigil
              </span>
              <span className="mt-1 block font-mono text-[0.5625rem] uppercase tracking-[0.16em] text-muted-foreground">
                MFA console
              </span>
            </span>
          </Link>

          <DashboardNav />

          <div className="mt-auto border-t border-border px-3 pt-5">
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <span className="grid size-8 shrink-0 place-items-center rounded-full border border-border bg-secondary text-[0.625rem] font-medium text-secondary-foreground">
                  {initialsValue || "V"}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-xs font-medium text-foreground">
                    {name}
                  </p>
                  <p className="truncate font-mono text-[0.5625rem] tracking-[0.04em] text-muted-foreground">
                    {email}
                  </p>
                </div>
              </div>
              <SignOutButton />
            </div>
            <p className="mt-4 font-mono text-[0.5625rem] uppercase tracking-[0.14em] text-muted-foreground/40">
              Built with IBM Bob
            </p>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-4 border-b border-border bg-background/92 px-5 backdrop-blur-md md:px-8">
            <div className="flex items-center gap-3">
              <MobileNav />
              <div className="hidden items-center gap-3 sm:flex">
                <span className="label-mono text-muted-foreground/55">
                  Security console
                </span>
                <span className="h-3 w-px bg-border" />
                <span className="label-mono text-muted-foreground/35">
                  {sessionId ? `session ${sessionId.slice(-8)}` : "no session"}
                </span>
              </div>
              <span className="label-mono text-muted-foreground/55 sm:hidden">
                Vigil
              </span>
            </div>

            <div className="flex items-center gap-3">
              <Badge variant={user.totpEnabled ? "success" : "warning"}>
                <span
                  className={
                    user.totpEnabled
                      ? "status-dot size-1.5 rounded-full bg-signal text-signal"
                      : "status-dot size-1.5 rounded-full bg-warning text-warning"
                  }
                />
                {user.totpEnabled ? "Second factor active" : "Setup required"}
              </Badge>
              <SignOutButton className="lg:hidden" />
              <span className="hidden font-mono text-[0.625rem] uppercase tracking-[0.12em] text-muted-foreground/40 md:inline">
                Clerk × Supabase
              </span>
            </div>
          </header>

          <main className="flex-1 px-5 py-8 md:px-8 md:py-10 lg:px-10">
            {children}
          </main>

          <footer className="flex flex-col justify-between gap-2 border-t border-border px-5 py-4 font-mono text-[0.5625rem] uppercase tracking-[0.14em] text-muted-foreground/40 sm:flex-row md:px-8 lg:px-10">
            <span>Vigil / security console</span>
            <span>
              Made by Indeep Kaur · Built with IBM Bob ·{" "}
              <Link
                href="/"
                className="underline decoration-border underline-offset-4 hover:text-foreground"
              >
                Public site
              </Link>
            </span>
          </footer>
        </div>
      </div>
      <Toaster theme="dark" position="bottom-right" richColors={false} />
    </div>
  );
}
