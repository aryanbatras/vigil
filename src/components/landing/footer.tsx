import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { site } from "@/lib/site";

const columns = [
  {
    title: "Console",
    links: [
      { label: "Sign in", href: "/sign-in" },
      { label: "Create account", href: "/sign-up" },
      { label: "Security settings", href: "/dashboard/security" },
      { label: "Activity ledger", href: "/dashboard/activity" },
    ],
  },
  {
    title: "Build",
    links: [
      { label: "Source", href: site.github, external: true },
      { label: "Setup notes", href: `${site.github}#readme`, external: true },
      { label: "Credits", href: "#record" },
      { label: "Questions", href: "#faq" },
    ],
  },
] as const;

export function Footer() {
  return (
    <footer className="flex min-h-[100svh] flex-col bg-teal-deep px-6 pt-8 pb-6 text-paper md:px-10 md:pt-10">
      <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Link href="/" className="inline-flex items-center gap-3">
            <span className="grid size-8 place-items-center border border-paper/30 font-display text-sm font-extrabold">
              V
            </span>
            <span className="label-mono text-paper/70">Vigil</span>
          </Link>
          <p className="mt-5 max-w-[24ch] text-xs leading-relaxed text-paper/45">
            A small MFA console with a long memory. Built as a second,
            independent experiment.
          </p>
        </div>

        {columns.map((column) => (
          <div key={column.title}>
            <p className="label-mono text-paper/35">{column.title}</p>
            <ul className="mt-4 space-y-2.5">
              {column.links.map((link) => (
                <li key={link.label}>
                  {"external" in link && link.external ? (
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-sm text-paper/65 transition-colors hover:text-paper"
                    >
                      {link.label}
                      <ArrowUpRight className="size-3" aria-hidden="true" />
                    </a>
                  ) : (
                    <Link
                      href={link.href}
                      className="text-sm text-paper/65 transition-colors hover:text-paper"
                    >
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div>
          <p className="label-mono text-paper/35">Colophon</p>
          <dl className="mt-4 space-y-3 text-xs leading-relaxed">
            <div>
              <dt className="text-paper/35">Type</dt>
              <dd className="text-paper/60">
                Cabinet Grotesk, Public Sans, IBM Plex Mono
              </dd>
            </div>
            <div>
              <dt className="text-paper/35">Photography</dt>
              <dd className="text-paper/60">
                Pexels, credited in{" "}
                <a
                  href={`${site.github}/blob/main/public/media/credits.json`}
                  target="_blank"
                  rel="noreferrer"
                  className="underline decoration-paper/20 underline-offset-4 hover:text-paper"
                >
                  credits.json
                </a>
              </dd>
            </div>
            <div>
              <dt className="text-paper/35">Made with</dt>
              <dd className="text-paper/60">IBM Bob</dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="min-h-[18svh] flex-1" />

      <div>
        <p
          aria-hidden="true"
          className="font-display text-[clamp(5.5rem,27vw,26rem)] font-extrabold leading-[0.7] tracking-[-0.065em] text-paper"
        >
          Vigil<span className="text-mint">.</span>
        </p>
        <div className="mt-6 flex flex-col gap-2 border-t border-paper/15 pt-4 font-mono text-[0.625rem] uppercase tracking-[0.14em] text-paper/35 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 {site.author}</p>
          <p>Built with IBM Bob</p>
          <p>Clerk × Supabase</p>
          <p className="flex items-center gap-2">
            <span className="status-dot size-1.5 rounded-full bg-signal text-signal" />
            Demo instance
          </p>
        </div>
      </div>
    </footer>
  );
}
