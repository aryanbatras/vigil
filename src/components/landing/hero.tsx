import Link from "next/link";

import { ConsoleEntry } from "@/components/landing/console-entry";

export function Hero() {
  return (
    <section className="landing-grain relative flex min-h-[100svh] flex-col overflow-hidden bg-teal px-6 py-6 text-paper md:px-10 md:py-8">
      <header className="relative z-10 flex items-start justify-between gap-6">
        <Link href="/" className="group inline-flex items-center gap-3">
          <span className="grid size-8 place-items-center border border-paper/30 font-display text-sm font-extrabold transition-colors group-hover:border-paper/60">
            V
          </span>
          <span className="label-mono hidden whitespace-nowrap text-paper/70 sm:inline">
            Vigil / MFA console
          </span>
        </Link>
        <nav className="flex shrink-0 items-center gap-5 text-paper/75">
          <a
            href="#sequence"
            className="hidden text-xs underline decoration-paper/25 underline-offset-4 transition-colors hover:text-paper hover:decoration-paper/70 sm:inline"
          >
            Sequence
          </a>
          <a
            href="#record"
            className="hidden text-xs underline decoration-paper/25 underline-offset-4 transition-colors hover:text-paper hover:decoration-paper/70 sm:inline"
          >
            The record
          </a>
          <ConsoleEntry
            textLink
            signedOutLabel="Open console"
            signedInLabel="Enter console"
            className="text-paper"
          />
        </nav>
      </header>

      <div className="relative z-10 mt-[18vh] md:mt-[13vh]">
        <h1
          aria-label="Vigil MFA — the second factor, on the record"
          className="font-display text-[clamp(6.5rem,20.5vw,18rem)] font-extrabold leading-[0.72] tracking-[-0.06em]"
        >
          <span className="reveal-mask">
            <span>Vigil</span>
          </span>
          <span className="reveal-mask text-mint">
            <span>MFA</span>
          </span>
        </h1>
      </div>

      <div className="absolute top-[45%] right-10 z-10 hidden max-w-[15rem] lg:block">
        <p className="label-mono text-paper/35">The second factor</p>
        <p className="mt-4 text-sm leading-relaxed text-paper/60">
          Email code in. Authenticator out. The state change written down.
        </p>
      </div>

      <div className="reveal-fade relative z-10 mt-auto grid gap-7 border-t border-paper/20 pt-6 pb-1 md:grid-cols-12 md:items-end">
        <div className="md:col-span-3">
          <p className="label-mono text-paper/45">Vigil / 2026</p>
          <p className="mt-3 text-xs text-paper/60">Clerk × Supabase</p>
        </div>
        <div className="hidden md:col-span-5 md:block">
          <p className="label-mono text-paper/35">A separate experiment</p>
          <p className="mt-3 max-w-[30ch] text-xs leading-relaxed text-paper/55">
            The first build used Better Auth, Turso and Resend. This one moves
            identity to Clerk and the audit trail to Supabase.
          </p>
        </div>
        <div className="md:col-span-4 md:text-right">
          <p className="max-w-[31ch] text-[1.0625rem] leading-relaxed text-paper/85 md:ml-auto">
            A passwordless MFA console where every verified state change is
            written to an append-only ledger.
          </p>
          <div className="mt-5 md:flex md:justify-end">
            <ConsoleEntry
              variant="paper"
              signedOutLabel="Create your console"
              signedInLabel="Enter your console"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
