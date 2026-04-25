"use client";

import { Heart } from "lucide-react";
import { useTranslations } from "next-intl";
import ScrollReveal from "@/components/ui/ScrollReveal";

export default function CommitmentSection() {
  const t = useTranslations("About.commitment");
  return (
    <section className="relative overflow-hidden bg-linear-to-b from-accent via-muted to-background py-24">
      <div className="absolute inset-0 opacity-[0.08]">
        <div className="absolute left-1/2 top-16 h-96 w-96 -translate-x-1/2 rounded-full bg-primary blur-3xl animate-float" />
        <div className="absolute bottom-0 right-10 h-80 w-80 translate-y-1/4 rounded-full bg-primary/60 blur-3xl" />
      </div>

      <div className="container relative z-10 mx-auto px-6">
        <ScrollReveal variant="zoom-in" duration={800}>
          <div className="mx-auto max-w-4xl rounded-[3rem] bg-card/80 p-12 text-center shadow-xl backdrop-blur">
            <ScrollReveal variant="bounce-in" delayMs={200} duration={600}>
              <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-foreground text-card">
                <Heart className="h-7 w-7" />
              </div>
            </ScrollReveal>
            <ScrollReveal variant="blur-in" delayMs={300} duration={700}>
              <h2 className="font-serif text-3xl font-medium leading-tight text-foreground md:text-4xl">
                {t("title")}
              </h2>
            </ScrollReveal>
            <ScrollReveal variant="fade-up" delayMs={450} duration={700}>
              <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
                {t("description1")}
              </p>
            </ScrollReveal>
            <ScrollReveal variant="fade-up" delayMs={600} duration={700}>
              <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
                {t("description2")}
              </p>
            </ScrollReveal>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
