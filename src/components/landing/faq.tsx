const questions = [
  {
    question: "Does Vigil store my authenticator secret?",
    answer:
      "No. TOTP secrets and backup codes live inside Clerk. The Supabase ledger stores the verified boolean state — whether TOTP or backup codes were enabled at the moment the server checked — not the secret itself.",
  },
  {
    question: "What exactly is in the audit log?",
    answer:
      "A Clerk user ID, the event type, whether TOTP and backup codes were enabled, the session ID when relevant, the source of the event, and a timestamp. No codes, no secrets, no email body, and no free-form client text.",
  },
  {
    question: "Can I run the console without a Supabase project?",
    answer:
      "Yes. Authentication, enrollment, recovery codes and session review all work. The activity page shows a clear “ledger not connected” state instead of failing silently. Add the Supabase URL and service-role key to switch it on.",
  },
  {
    question: "Why Clerk and Supabase instead of Better Auth and Turso?",
    answer:
      "Clerk handles the MFA factors, recovery and session policy as a managed identity layer. Supabase gives the application a Postgres ledger that is deliberately separate from identity. The separation is the point of this build.",
  },
  {
    question: "Is MFA enforced by the app or by Clerk?",
    answer:
      "Both, at different layers. Clerk enforces the second factor during sign-in. The dashboard layout redirects users who have not enrolled to the setup screen. That redirect is UX; the security boundary is Clerk.",
  },
  {
    question: "What happens if I lose my authenticator?",
    answer:
      "Use one of the single-use backup codes. If both the authenticator and the codes are gone, an instance administrator has to reset the user's MFA in the Clerk dashboard. There is no self-service bypass.",
  },
  {
    question: "Is this a production-ready compliance product?",
    answer:
      "No. It is a working, documented demo. For production, claim the Clerk application, move to a plan that includes MFA, configure the Clerk webhook, set the service-role key in your host, review the RLS policy, and add your own monitoring.",
  },
] as const;

export function Faq() {
  return (
    <section id="faq" className="bg-paper px-6 py-24 md:px-10 md:py-32">
      <div className="mx-auto max-w-[1360px]">
        <div className="grid gap-10 border-t border-border pt-5 md:grid-cols-12">
          <div className="md:col-span-4">
            <p className="label-mono text-muted-foreground">06 / Questions</p>
            <h2 className="mt-6 max-w-[10ch] font-display text-[clamp(2.8rem,5.8vw,5.6rem)] font-extrabold leading-[0.9] tracking-[-0.05em] text-ink">
              Worth asking.
            </h2>
            <p className="mt-6 max-w-[28ch] text-xs leading-relaxed text-muted-foreground">
              The honest version of each answer, including what is deliberately
              left out of this build.
            </p>
          </div>

          <div className="md:col-span-7 md:col-start-6">
            {questions.map((item, index) => (
              <details
                key={item.question}
                className="group border-t border-border last:border-b"
              >
                <summary className="flex cursor-pointer list-none items-start justify-between gap-6 py-5 text-[1.06rem] font-medium leading-snug tracking-[-0.01em] text-ink transition-colors hover:text-teal [&::-webkit-details-marker]:hidden">
                  <span className="flex gap-4">
                    <span className="mt-1 font-mono text-[0.625rem] tracking-[0.12em] text-muted-foreground/50">
                      0{index + 1}
                    </span>
                    <span>{item.question}</span>
                  </span>
                  <span
                    aria-hidden="true"
                    className="mt-0.5 grid size-5 shrink-0 place-items-center border border-border font-mono text-sm text-muted-foreground transition-transform duration-200 group-open:rotate-45 group-open:border-teal/30 group-open:text-teal"
                  >
                    +
                  </span>
                </summary>
                <div className="mb-5 ml-8 max-w-[54ch] bg-secondary/70 px-5 py-4 text-sm leading-relaxed text-muted-foreground">
                  {item.answer}
                </div>
              </details>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
