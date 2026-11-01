import { cn } from "@/lib/utils";

const groups = [
  {
    name: "Entry",
    items: [
      {
        label: "Passwordless entry",
        value: "email code",
        description:
          "No password to reuse. Clerk sends a six-digit code to the verified address.",
      },
      {
        label: "Session gate",
        value: "always",
        description:
          "The dashboard will not open until a verified second factor exists.",
      },
    ],
  },
  {
    name: "Second factor",
    items: [
      {
        label: "Authenticator app",
        value: "TOTP / 30s",
        description:
          "Scan once. Verify one rotating code. The secret stays inside Clerk.",
      },
      {
        label: "Backup codes",
        value: "10 / single-use",
        description:
          "Generated once, shown once, and replaced whenever a new set is made.",
      },
    ],
  },
  {
    name: "Evidence",
    items: [
      {
        label: "Server verification",
        value: "per event",
        description:
          "The API re-reads the user from Clerk before it writes a single row.",
      },
      {
        label: "Audit ledger",
        value: "append-only",
        description:
          "Supabase Postgres with RLS on. Service-role writes only, no browser key.",
      },
      {
        label: "Session review",
        value: "per device",
        description:
          "See active sessions and revoke the ones you do not recognise.",
      },
    ],
  },
] as const;

export function Capabilities() {
  return (
    <section
      id="menu"
      className="landing-grain relative overflow-hidden bg-teal px-6 py-24 text-paper md:px-10 md:py-32"
    >
      <div className="mx-auto max-w-[1360px]">
        <div className="flex flex-col justify-between gap-6 border-t border-paper/20 pt-5 sm:flex-row sm:items-start">
          <p className="label-mono text-paper/45">02 / The menu</p>
          <p className="max-w-[32ch] text-xs leading-relaxed text-paper/55 sm:text-right">
            Six controls, one rule: nothing reaches the record until the server
            verifies it.
          </p>
        </div>

        <div className="mt-16 flex justify-center md:mt-24">
          <div className="w-full max-w-[660px] border border-ink/15 bg-paper text-ink shadow-[0_32px_90px_-30px_rgba(2,28,32,0.8)]">
            <div className="flex items-center justify-between gap-4 border-b border-ink/15 px-6 py-4">
              <span className="label-mono text-ink/55">
                Vigil / security menu
              </span>
              <span className="label-mono text-ink/35">Est. 2026</span>
            </div>

            <div className="px-6 py-9 md:px-10 md:py-11">
              <h2 className="max-w-[12ch] font-display text-[clamp(2.5rem,6.2vw,3.6rem)] font-extrabold leading-[0.9] tracking-[-0.045em]">
                What the console does.
              </h2>
              <p className="mt-4 max-w-[40ch] text-sm leading-relaxed text-ink/60">
                A small, deliberate surface. Every item is included; none of
                them stores a secret in this application.
              </p>

              <div className="mt-10 space-y-9">
                {groups.map((group) => (
                  <div key={group.name}>
                    <p className="label-mono text-ink/40">{group.name}</p>
                    <div className="mt-1">
                      {group.items.map((item, index) => (
                        <div
                          key={item.label}
                          className={cn(
                            "py-4",
                            index === 0 && "border-t border-ink/12",
                            "border-b border-ink/12",
                          )}
                        >
                          <div className="flex items-baseline gap-3">
                            <span className="text-[1.02rem] font-medium tracking-[-0.01em]">
                              {item.label}
                            </span>
                            <span aria-hidden="true" className="leader" />
                            <span className="shrink-0 font-mono text-[0.625rem] uppercase tracking-[0.1em] text-ink/55">
                              {item.value}
                            </span>
                          </div>
                          <p className="mt-1.5 max-w-[44ch] text-[0.78rem] leading-relaxed text-ink/55">
                            {item.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col justify-between gap-2 border-t border-ink/15 px-6 py-4 sm:flex-row sm:items-center">
              <span className="label-mono text-ink/45">
                No password stored
              </span>
              <span className="label-mono text-ink/45">
                No TOTP secret stored
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
