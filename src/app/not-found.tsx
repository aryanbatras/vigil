import Link from "next/link";
import { ArrowLeft, ArrowUpRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { site } from "@/lib/site";

export default function NotFound() {
  return (
    <main className="landing-grain flex min-h-svh flex-col justify-between overflow-hidden bg-teal-deep px-6 py-8 text-paper md:px-10">
      <div className="relative z-10 flex items-center justify-between gap-6">
        <Link href="/" className="inline-flex items-center gap-3">
          <span className="grid size-8 place-items-center border border-paper/30 font-display text-sm font-extrabold">
            V
          </span>
          <span className="label-mono text-paper/70">Vigil</span>
        </Link>
        <span className="label-mono text-paper/40">404 / Not found</span>
      </div>

      <div className="relative z-10 max-w-[52rem]">
        <p className="label-mono text-mint">The record ends here</p>
        <h1 className="mt-6 font-display text-[clamp(5rem,18vw,15rem)] font-extrabold leading-[0.75] tracking-[-0.06em]">
          404<span className="text-mint">.</span>
        </h1>
        <p className="mt-8 max-w-[42ch] text-sm leading-relaxed text-paper/60">
          This route is not part of the console. Nothing was written to the
          ledger. Return to the site or open the security console.
        </p>
        <div className="mt-7 flex flex-wrap gap-3">
          <Button asChild variant="paper">
            <Link href="/">
              <ArrowLeft aria-hidden="true" />
              Back to the site
            </Link>
          </Button>
          <Button asChild variant="outline-paper">
            <Link href="/dashboard/security">
              Open the console
              <ArrowUpRight aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </div>

      <div className="relative z-10 flex flex-col justify-between gap-2 border-t border-paper/15 pt-4 font-mono text-[0.625rem] uppercase tracking-[0.14em] text-paper/35 sm:flex-row">
        <p>Vigil / 2026</p>
        <a
          href={site.github}
          target="_blank"
          rel="noreferrer"
          className="underline decoration-paper/20 underline-offset-4 transition-colors hover:text-paper"
        >
          Source
        </a>
        <p>Built with IBM Bob</p>
      </div>
    </main>
  );
}
