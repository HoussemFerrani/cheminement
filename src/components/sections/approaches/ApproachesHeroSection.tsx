"use client";

import { Sparkle, Workflow } from "lucide-react";
import { useTranslations } from "next-intl";
import ScrollReveal from "@/components/ui/ScrollReveal";

export default function ApproachesHeroSection() {
  const t = useTranslations("Approaches.hero");
  return (
    <section className="relative overflow-hidden bg-accent text-foreground">
      <div className="absolute inset-0 opacity-[0.08]">
        <div className="absolute left-0 top-10 h-80 w-80 -translate-x-1/3 rounded-full bg-primary blur-3xl" />
        <div className="absolute bottom-0 right-0 h-md w-md translate-x-1/3 translate-y-1/4 rounded-full bg-primary/50 blur-3xl" />
      </div>

      <div className="container relative z-10 mx-auto px-6 py-24 md:py-32">
        <div className="mx-auto flex max-w-6xl flex-col gap-12">
          <ScrollReveal variant="fade-down" duration={700}>
            <div className="flex flex-wrap items-center gap-3 text-sm uppercase tracking-[0.35em] text-muted-foreground/70">
              <Workflow className="h-5 w-5 text-foreground" />
              <span>{t("badge")}</span>
            </div>
          </ScrollReveal>

          <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <ScrollReveal variant="slide-right" delayMs={100} duration={800}>
              <div className="space-y-8">
                <h1 className="font-serif text-4xl font-light leading-tight md:text-5xl lg:text-6xl">
                  {t("headline")}
                </h1>
                <p className="text-lg leading-relaxed text-muted-foreground md:text-xl">
                  {t("description")}
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal variant="fade-left" delayMs={250} duration={800}>
              <div className="rounded-4xl bg-card/70 p-8 shadow-xl backdrop-blur">
                <div className="flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.25em] text-muted-foreground">
                  <Sparkle className="h-4 w-4" />
                  <span>{t("values.title")}</span>
                </div>
                <dl className="mt-6 space-y-5 text-muted-foreground">
                  <div>
                    <dt className="font-serif text-lg text-foreground">
                      {t("values.respect.title")}
                    </dt>
                    <dd className="text-sm leading-relaxed">
                      {t("values.respect.description")}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-serif text-lg text-foreground">
                      {t("values.rigor.title")}
                    </dt>
                    <dd className="text-sm leading-relaxed">
                      {t("values.rigor.description")}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-serif text-lg text-foreground">
                      {t("values.trust.title")}
                    </dt>
                    <dd className="text-sm leading-relaxed">
                      {t("values.trust.description")}
                    </dd>
                  </div>
                </dl>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </div>
    </section>
  );
}
