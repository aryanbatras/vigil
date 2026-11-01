import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { ConsoleEntry } from "@/components/landing/console-entry";
import { Button } from "@/components/ui/button";
import { site } from "@/lib/site";

export function ClosingCta() {
  return (
    <section className="landing-grain flex min-h-[100svh] flex-col justify-between overflow-hidden bg-teal-deep px-6 py-8 text-paper md:px-10">
      <div className="relative z-10 flex justify-between">
        <p className="label-mono text-paper/40">07 / The gate</p>
        <p className="label-mono text-paper/40">Vigil</p>
      </div>

      <h2 className="relative z-10 text-center font-display text-[clamp(4rem,12vw,11rem)] font-extrabold leading-[0.82] tracking-[-0.06em]">
        Are you
      </h2>

      <div className="relative z-10 flex flex-col items-center gap-3">
        <ConsoleEntry
          variant="paper"
          size="lg"
          signedOutLabel="Create your console"
          signedInLabel="Enter your console"
        />
        <span className="py-1 font-mono text-[0.625rem] uppercase tracking-[0.18em] text-paper/35">
          or
        </span>
        <Button asChild variant="outline-paper" size="lg">
          <Link href={site.github} target="_blank" rel="noreferrer">
            Read the build
            <ArrowUpRight aria-hidden="true" />
          </Link>
        </Button>
        <p className="mt-4 max-w-[38ch] text-center text-xs leading-relaxed text-paper/50">
          Email code first. Authenticator second. The whole verified state on
          the record.
        </p>
      </div>

      <h2 className="relative z-10 text-center font-display text-[clamp(4rem,12vw,11rem)] font-extrabold leading-[0.82] tracking-[-0.06em] text-mint">
        who you say?
      </h2>
    </section>
  );
}
