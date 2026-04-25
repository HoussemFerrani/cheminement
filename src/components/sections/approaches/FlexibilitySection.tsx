"use client";

import { Video, Building2, Clock, MapPin } from "lucide-react";
import { useTranslations } from "next-intl";
import ScrollReveal from "@/components/ui/ScrollReveal";
import type { AnimationVariant } from "@/components/ui/ScrollReveal";

export default function FlexibilitySection() {
  const t = useTranslations("Approaches.flexibility");

  const modalities = [
    {
      icon: Video,
      title: t("modalities.online.title"),
      bullets: t.raw("modalities.online.bullets"),
    },
    {
      icon: Building2,
      title: t("modalities.office.title"),
      bullets: t.raw("modalities.office.bullets"),
    },
  ];

  return (
    <section className="relative overflow-hidden bg-linear-to-b from-muted via-muted to-muted py-24">
      <div className="absolute inset-0 opacity-[0.05]">
        <div className="absolute left-0 top-24 h-80 w-80 -translate-x-1/3 rounded-full bg-primary blur-3xl animate-float" />
        <div className="absolute right-0 bottom-0 h-104 w-104 translate-x-1/4 translate-y-1/3 rounded-full bg-accent blur-3xl" />
      </div>

      <div className="container relative z-10 mx-auto px-6">
        <div className="mx-auto max-w-5xl text-center">
          <ScrollReveal variant="swing-in" duration={600}>
            <p className="text-sm uppercase tracking-[0.35em] text-muted-foreground/70">
              {t("badge")}
            </p>
          </ScrollReveal>
          <ScrollReveal variant="blur-in" delayMs={150} duration={700}>
            <h2 className="mt-4 font-serif text-3xl font-medium leading-tight text-foreground md:text-4xl">
              {t("title")}
            </h2>
          </ScrollReveal>
        </div>

        <div className="mt-16 grid gap-8 lg:grid-cols-[1fr_1fr]">
          {modalities.map(({ icon: Icon, title, bullets }, index) => {
            const cardAnimations: AnimationVariant[] = [
              "slide-right",
              "slide-left",
            ];
            return (
              <ScrollReveal
                key={title}
                variant={cardAnimations[index % cardAnimations.length]}
                delayMs={300 + index * 150}
                duration={800}
              >
                <div className="relative overflow-hidden rounded-4xl border border-border/15 bg-card/85 p-8 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
                  <div className="absolute inset-0 bg-linear-to-tr from-primary/10 via-transparent to-accent/10 opacity-0 transition-opacity duration-300 hover:opacity-100" />
                  <div className="relative z-10 space-y-5 text-left">
                    <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-foreground text-card">
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="font-serif text-xl font-medium text-foreground">
                      {title}
                    </h3>
                    <ul className="space-y-3 text-sm leading-relaxed text-muted-foreground">
                      {bullets.map((bullet: string) => (
                        <li key={bullet} className="flex gap-3">
                          <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-primary" />
                          <span>{bullet}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </ScrollReveal>
            );
          })}
        </div>

        <ScrollReveal variant="fade-up" delayMs={600} duration={700}>
          <div className="mt-12 grid gap-6 rounded-4xl border border-dashed border-primary/30 bg-card/70 p-8 shadow-inner sm:grid-cols-3">
            <div className="flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.3em] text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>{t("extras.schedule")}</span>
            </div>
            <div className="flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.3em] text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>{t("extras.accessibility")}</span>
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {t("extras.description")}
            </p>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
