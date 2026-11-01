const steps = [
  {
    order: "First",
    line: "First, prove the inbox.",
    body: "Enter your email. Clerk sends a six-digit code to the verified address. Nothing else is asked for.",
    indent: "",
    accent: false,
  },
  {
    order: "Then",
    line: "Then, open the authenticator.",
    body: "Scan the QR code once. Type the rotating six-digit code to prove the secret landed on your device.",
    indent: "ml-[6vw] md:ml-[8%]",
    accent: false,
  },
  {
    order: "Now",
    line: "Now, the session is gated.",
    body: "Without a verified second factor, the console routes back to setup. There is no skip control.",
    indent: "ml-[12vw] md:ml-[16%]",
    accent: false,
  },
  {
    order: "Finally",
    line: "Finally, leave a record.",
    body: "The server re-reads your MFA state from Clerk, then writes the verified snapshot to Supabase.",
    indent: "ml-[18vw] md:ml-[24%]",
    accent: true,
  },
] as const;

export function Sequence() {
  return (
    <section
      id="sequence"
      className="bg-paper px-6 py-24 md:px-10 md:py-32"
    >
      <div className="mx-auto max-w-[1360px]">
        <div className="grid gap-8 border-t border-border pt-5 md:grid-cols-12">
          <div className="md:col-span-3">
            <p className="label-mono text-muted-foreground">03 / Sequence</p>
            <p className="mt-4 max-w-[24ch] text-xs leading-relaxed text-muted-foreground">
              Four movements. No shortcut through the second one.
            </p>
          </div>
          <ol className="md:col-span-9">
            {steps.map((step, index) => (
              <li
                key={step.order}
                className="border-t border-border py-8 first:border-t-0 first:pt-0 md:py-10"
              >
                <div className={step.indent}>
                  <div className="flex items-baseline gap-4">
                    <span className="font-mono text-[0.625rem] uppercase tracking-[0.16em] text-muted-foreground/60">
                      0{index + 1} / {step.order}
                    </span>
                    <span className="h-px flex-1 bg-border" />
                  </div>
                  <h3
                    className={
                      step.accent
                        ? "mt-4 font-display text-[clamp(2rem,4.4vw,4.4rem)] font-extrabold leading-[0.98] tracking-[-0.045em] text-teal"
                        : "mt-4 font-display text-[clamp(2rem,4.4vw,4.4rem)] font-extrabold leading-[0.98] tracking-[-0.045em] text-ink"
                    }
                  >
                    {step.line}
                  </h3>
                  <p className="mt-3 max-w-[46ch] text-sm leading-relaxed text-muted-foreground">
                    {step.body}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
