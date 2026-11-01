import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export function AuthFrame({
  children,
  mode,
}: {
  children: React.ReactNode;
  mode: "in" | "up";
}) {
  const copy =
    mode === "in"
      ? {
          eyebrow: "Returning session",
          title: (
            <>
              The second
              <br />
              factor, on
              <br />
              <span className="text-mint">the record.</span>
            </>
          ),
          note: "Sign in with the email code. If your authenticator is enrolled, Clerk asks for it next.",
        }
      : {
          eyebrow: "New console",
          title: (
            <>
              Start with
              <br />
              an inbox.
              <br />
              <span className="text-mint">Add proof.</span>
            </>
          ),
          note: "Create an account, verify the email code, then enroll an authenticator on the security page.",
        };

  return (
    <main className="flex min-h-[100svh] flex-1 flex-col bg-paper text-ink lg:grid lg:grid-cols-[minmax(0,44%)_1fr]">
      <aside className="landing-grain relative hidden flex-col justify-between overflow-hidden bg-teal px-10 py-10 text-paper lg:flex">
        <Link href="/" className="relative z-10 inline-flex items-center gap-3">
          <span className="grid size-8 place-items-center border border-paper/30 font-display text-sm font-extrabold">
            V
          </span>
          <span className="label-mono text-paper/70">Vigil / MFA console</span>
        </Link>

        <div className="relative z-10">
          <p className="label-mono text-paper/40">{copy.eyebrow}</p>
          <p className="mt-8 font-display text-[clamp(3.2rem,6vw,5.6rem)] font-extrabold leading-[0.86] tracking-[-0.055em]">
            {copy.title}
          </p>
        </div>

        <div className="relative z-10 flex items-end justify-between gap-8 border-t border-paper/20 pt-5">
          <p className="max-w-[34ch] text-xs leading-relaxed text-paper/55">
            {copy.note}
          </p>
          <p className="label-mono shrink-0 text-paper/35">01 / Access</p>
        </div>
      </aside>

      <div className="flex min-h-[100svh] flex-col">
        <header className="flex items-center justify-between px-6 py-5 md:px-10">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            <span className="grid size-7 place-items-center border border-border font-display text-[0.7rem] font-extrabold text-ink lg:hidden">
              V
            </span>
            <ArrowLeft className="size-3.5" aria-hidden="true" />
            Back to the site
          </Link>
          <p className="label-mono text-muted-foreground/60">Clerk × Supabase</p>
        </header>

        <div className="flex flex-1 items-center justify-center px-6 pb-16">
          <div className="w-full max-w-[400px]">
            <div className="mb-7 lg:hidden">
              <p className="label-mono text-muted-foreground">
                {copy.eyebrow}
              </p>
              <p className="mt-3 font-display text-4xl font-extrabold leading-[0.92] tracking-[-0.045em] text-ink">
                {mode === "in" ? "Welcome back." : "Create your console."}
              </p>
            </div>
            {children}
          </div>
        </div>

        <footer className="flex items-center justify-between border-t border-border px-6 py-4 font-mono text-[0.625rem] uppercase tracking-[0.14em] text-muted-foreground/60 md:px-10">
          <span>Vigil / 2026</span>
          <span>Built with IBM Bob</span>
        </footer>
      </div>
    </main>
  );
}
