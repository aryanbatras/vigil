import Image from "next/image";

import { mediaCredits } from "@/lib/site";

const credit = mediaCredits[0];

export function ImageBand() {
  return (
    <section className="bg-paper px-0 py-0">
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-teal-deep sm:aspect-[16/9] lg:aspect-[21/9]">
        <Image
          src={credit.file}
          alt={credit.alt}
          fill
          sizes="100vw"
          className="object-cover opacity-90 grayscale-[0.35] contrast-[1.06]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-teal-deep via-teal-deep/35 to-teal-deep/10" />
        <div className="absolute inset-0 bg-teal/10 mix-blend-multiply" />

        <p className="label-mono absolute top-6 left-6 text-paper/65 md:top-8 md:left-10">
          04 / The physical layer
        </p>

        <div className="absolute right-6 bottom-6 left-6 flex flex-col gap-6 md:right-10 md:bottom-8 md:left-10 lg:flex-row lg:items-end lg:justify-between">
          <h2 className="max-w-[13ch] font-display text-[clamp(2.6rem,6.4vw,6.5rem)] font-extrabold leading-[0.86] tracking-[-0.05em] text-paper">
            Small habit.
            <br />
            <span className="text-mint">Permanent record.</span>
          </h2>
          <p className="max-w-[31ch] text-xs leading-relaxed text-paper/65 lg:pb-1 lg:text-right">
            A fingerprint scanner is not a TOTP code. The analogy is the point:
            a second factor should be a physical act, not another password.
          </p>
        </div>
      </div>

      <div className="mx-auto flex max-w-[1600px] flex-col justify-between gap-2 px-6 py-3 font-mono text-[0.625rem] uppercase tracking-[0.14em] text-muted-foreground sm:flex-row md:px-10">
        <span>
          Photo: {credit.photographer} /{" "}
          <a
            href={credit.url}
            target="_blank"
            rel="noreferrer"
            className="underline decoration-border underline-offset-4 transition-colors hover:text-foreground"
          >
            Pexels
          </a>
        </span>
        <span>Vigil / 04</span>
      </div>
    </section>
  );
}
