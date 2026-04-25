"use client";

import { Compass, ListChecks, Sparkle } from "lucide-react";
import { useTranslations } from "next-intl";
import ScrollReveal from "@/components/ui/ScrollReveal";

export default function PersonalizedJourneySection() {
  const t = useTranslations("About.personalizedJourney");
  return (
    <section className="relative overflow-hidden bg-background py-24">
      <div className="absolute inset-0 opacity-5">
        <div className="absolute left-1/4 top-10 h-72 w-72 rounded-full bg-accent blur-3xl" />
        <div className="absolute bottom-0 right-0 h-96 w-96 translate-x-1/3 rounded-full bg-primary/40 blur-3xl" />
      </div>

      <div className="container relative z-10 mx-auto px-6">
        <div className="mx-auto grid max-w-6xl gap-16 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <ScrollReveal variant="slide-right" duration={800}>
            <div className="space-y-6">
              <div className="flex items-center gap-3 text-sm uppercase tracking-[0.35em] text-muted-foreground/70">
                <Compass className="h-5 w-5 text-foreground" />
                <span>{t("badge")}</span>
              </div>
              <h2 className="font-serif text-3xl font-medium leading-tight text-foreground md:text-4xl">
                {t("title")}
              </h2>
              <p className="text-lg leading-relaxed text-muted-foreground">
                {t("description")}
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal variant="fade-left" delayMs={200} duration={800}>
            <div className="rounded-3xl bg-muted/40 p-8 shadow-lg backdrop-blur">
              <ScrollReveal variant="zoom-in" delayMs={400} duration={600}>
                <div className="mb-6 flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-foreground text-card">
                    <ListChecks className="h-6 w-6" />
                  </div>
                  <p className="text-base font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                    {t("matchingTitle")}
                  </p>
                </div>
              </ScrollReveal>

              <ul className="space-y-4">
                {t.raw("matchingPoints").map((point: string, index: number) => (
                  <ScrollReveal
                    key={point}
                    variant="fade-up"
                    delayMs={500 + index * 100}
                    duration={600}
                  >
                    <li className="flex items-center gap-3 rounded-2xl bg-card/80 p-4 text-base text-card-foreground shadow-sm">
                      <div className="h-2 w-2 shrink-0 rounded-full bg-primary" aria-hidden />
                      <span className="leading-relaxed">{point}</span>
                    </li>
                  </ScrollReveal>
                ))}
              </ul>

              <ScrollReveal variant="blur-in" delayMs={900} duration={600}>
                <div className="mt-8 flex items-center gap-3 text-sm text-muted-foreground">
                  <Sparkle className="h-4 w-4" />
                  <span>{t("goal")}</span>
                </div>
              </ScrollReveal>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
