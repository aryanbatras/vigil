import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { site } from "@/lib/site";

const rows = [
  {
    role: "Build",
    name: "Indeep Kaur",
    work: "Product direction, interface, original MFA experiment",
    href: null,
    linkLabel: "Author",
  },
  {
    role: "Pair",
    name: "IBM Bob",
    work: "Implementation partner: code, review, documentation",
    href: site.links.bob,
    linkLabel: "ibm.com/bob",
  },
  {
    role: "Identity",
    name: "Clerk",
    work: "Email code, TOTP, backup codes, session policy",
    href: site.links.clerk,
    linkLabel: "clerk.com",
  },
  {
    role: "Ledger",
    name: "Supabase",
    work: "Postgres audit trail, RLS, server-only writes",
    href: site.links.supabase,
    linkLabel: "supabase.com",
  },
  {
    role: "Photography",
    name: "Pexels",
    work: "Six credited images, downloaded locally",
    href: site.links.pexels,
    linkLabel: "pexels.com",
  },
  {
    role: "Source",
    name: "GitHub",
    work: "Public repository, setup notes, deployment path",
    href: site.github,
    linkLabel: "Repository",
  },
] as const;

export function Record() {
  return (
    <section id="record" className="bg-secondary/55 px-6 py-24 md:px-10 md:py-32">
      <div className="mx-auto max-w-[1360px]">
        <div className="grid gap-10 border-t border-border pt-5 md:grid-cols-12">
          <div className="md:col-span-7">
            <p className="label-mono text-muted-foreground">05 / The record</p>
            <h2 className="mt-6 max-w-[12ch] font-display text-[clamp(2.7rem,5.4vw,5.2rem)] font-extrabold leading-[0.9] tracking-[-0.05em] text-ink">
              Built by people.
              <br />
              Checked by machines.
            </h2>
          </div>
          <div className="md:col-span-4 md:col-start-9 md:pt-8">
            <p className="text-sm leading-relaxed text-muted-foreground">
              Vigil is a deliberate second experiment. The first build used
              Better Auth, Turso and Resend. This one moves identity to Clerk
              and the audit trail to Supabase. Same brief, different
              architecture.
            </p>
            <Link
              href={site.github}
              target="_blank"
              rel="noreferrer"
              className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-teal underline decoration-teal/30 underline-offset-4 transition-colors hover:decoration-teal"
            >
              Read the source
              <ArrowUpRight className="size-3.5" aria-hidden="true" />
            </Link>
          </div>
        </div>

        <div className="mt-16 hidden md:block">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="label-mono text-muted-foreground/70">
                <th className="w-[13%] pb-3 font-normal">Role</th>
                <th className="w-[20%] pb-3 font-normal">Name</th>
                <th className="w-[43%] pb-3 font-normal">Work</th>
                <th className="w-[24%] pb-3 text-right font-normal">
                  Reference
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr
                  key={row.role}
                  className={index % 2 === 1 ? "bg-paper/65" : "bg-transparent"}
                >
                  <td className="py-4 pl-2 align-top font-mono text-[0.625rem] uppercase tracking-[0.14em] text-muted-foreground">
                    {row.role}
                  </td>
                  <td className="py-4 align-top text-[0.95rem] font-medium text-ink">
                    {row.name}
                  </td>
                  <td className="py-4 pr-6 align-top text-sm leading-relaxed text-muted-foreground">
                    {row.work}
                  </td>
                  <td className="py-4 pr-2 text-right align-top text-xs">
                    {row.href ? (
                      <a
                        href={row.href}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-teal underline decoration-teal/25 underline-offset-4 transition-colors hover:decoration-teal"
                      >
                        {row.linkLabel}
                        <ArrowUpRight
                          className="size-3"
                          aria-hidden="true"
                        />
                      </a>
                    ) : (
                      <span className="font-mono text-[0.625rem] uppercase tracking-[0.14em] text-muted-foreground">
                        {row.linkLabel}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-14 space-y-0 md:hidden">
          {rows.map((row, index) => (
            <div
              key={row.role}
              className={
                index % 2 === 1
                  ? "bg-paper/65 px-4 py-4"
                  : "px-4 py-4"
              }
            >
              <div className="flex items-baseline justify-between gap-4">
                <span className="label-mono text-muted-foreground">
                  {row.role}
                </span>
                <span className="font-mono text-[0.625rem] uppercase tracking-[0.14em] text-muted-foreground/60">
                  {String(index + 1).padStart(2, "0")}
                </span>
              </div>
              <p className="mt-2 text-[0.95rem] font-medium text-ink">
                {row.name}
              </p>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                {row.work}
              </p>
              {row.href ? (
                <a
                  href={row.href}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-flex items-center gap-1 text-xs text-teal underline decoration-teal/25 underline-offset-4"
                >
                  {row.linkLabel}
                  <ArrowUpRight className="size-3" aria-hidden="true" />
                </a>
              ) : null}
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col justify-between gap-4 border-t border-border pt-5 sm:flex-row sm:items-start">
          <p className="max-w-[56ch] text-xs leading-relaxed text-muted-foreground">
            The{" "}
            <a
              href={site.links.priorBuild}
              target="_blank"
              rel="noreferrer"
              className="underline decoration-border underline-offset-4 transition-colors hover:text-foreground hover:decoration-muted-foreground"
            >
              original build
            </a>{" "}
            lives in a separate repository and keeps its Better Auth + Turso +
            Resend stack. Vigil is not a migration of that code; it is a second
            answer to the same brief.
          </p>
          <p className="font-mono text-[0.625rem] uppercase tracking-[0.14em] text-muted-foreground/60">
            Two builds / one brief
          </p>
        </div>
      </div>
    </section>
  );
}
