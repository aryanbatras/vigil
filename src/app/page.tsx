import { Capabilities } from "@/components/landing/capabilities";
import { ClosingCta } from "@/components/landing/closing-cta";
import { Faq } from "@/components/landing/faq";
import { Footer } from "@/components/landing/footer";
import { Hero } from "@/components/landing/hero";
import { ImageBand } from "@/components/landing/image-band";
import { Record } from "@/components/landing/record";
import { Sequence } from "@/components/landing/sequence";

export default function HomePage() {
  return (
    <main className="flex flex-1 flex-col">
      <Hero />
      <Premise />
      <Capabilities />
      <Sequence />
      <ImageBand />
      <Record />
      <Faq />
      <ClosingCta />
      <Footer />
    </main>
  );
}

function Premise() {
  return (
    <section className="bg-paper px-6 py-24 md:px-10 md:py-36">
      <div className="mx-auto max-w-[1360px]">
        <div className="grid gap-12 border-t border-border pt-5 md:grid-cols-12">
          <div className="md:col-span-3">
            <p className="label-mono text-muted-foreground">01 / Premise</p>
            <p className="mt-5 max-w-[26ch] text-xs leading-relaxed text-muted-foreground">
              Most MFA demos stop at the QR code. The interesting part starts
              after the first code is accepted.
            </p>
            <div className="mt-10 hidden h-px w-16 bg-teal/40 md:block" />
          </div>
          <div className="md:col-span-8 md:col-start-5">
            <h2 className="max-w-[17ch] font-display text-[clamp(2.8rem,5.6vw,5.8rem)] font-extrabold leading-[0.92] tracking-[-0.05em] text-ink">
              A password is a promise.
              <br />
              <span className="text-teal">A second factor is proof.</span>
            </h2>
            <p className="mt-8 max-w-[46ch] text-sm leading-relaxed text-muted-foreground md:ml-[18%] md:text-[0.95rem]">
              Vigil treats enrollment as a state change worth recording: who
              enabled what, when the server last checked, and whether Clerk and
              the ledger agree. The UI is quiet. The record is not.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
