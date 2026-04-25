"use client";

import {
  Puzzle,
  TrendingDown,
  Clock,
  BarChart3,
  Users2,
  Headphones,
  CheckCircle2,
} from "lucide-react";
import { useTranslations } from "next-intl";
import ScrollReveal from "@/components/ui/ScrollReveal";
import type { AnimationVariant } from "@/components/ui/ScrollReveal";

const benefitIcons = [
  Puzzle,
  TrendingDown,
  Clock,
  BarChart3,
  Users2,
  Headphones,
];

export default function IntegrationBenefitsSection() {
  const t = useTranslations("Platform.integrationBenefits");

  const benefits = t.raw("benefits") as Array<{
    title: string;
    description: string;
  }>;

  const cardAnimations: AnimationVariant[] = [
    "fade-right",
    "zoom-in",
    "fade-left",
    "slide-up",
    "rotate-in",
    "blur-in",
  ];

  return (
    <section className="relative overflow-hidden bg-background py-24">
      <div className="absolute inset-0 opacity-[0.05]">
        <div className="absolute left-1/2 top-0 h-80 w-80 -translate-x-1/2 rounded-full bg-primary blur-3xl animate-float" />
        <div className="absolute right-0 bottom-0 h-72 w-72 translate-x-1/3 translate-y-1/4 rounded-full bg-accent blur-3xl" />
      </div>

      <div className="container relative z-10 mx-auto px-6">
        <ScrollReveal variant="blur-in" duration={700}>
          <div className="mx-auto max-w-5xl text-center mb-16">
            <p className="text-sm uppercase tracking-[0.35em] text-muted-foreground/70">
              {t("badge")}
            </p>
            <h2 className="mt-4 font-serif text-3xl font-medium leading-tight text-foreground md:text-4xl">
              {t("title")}
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-muted-foreground max-w-3xl mx-auto">
              {t("subtitle")}
            </p>
          </div>
        </ScrollReveal>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
          {benefits.map((benefit, index) => {
            const Icon = benefitIcons[index % benefitIcons.length];
            return (
              <ScrollReveal
                key={index}
                variant={cardAnimations[index % cardAnimations.length]}
                delayMs={200 + index * 100}
                duration={700}
              >
                <article className="group relative overflow-hidden rounded-4xl border border-border/15 bg-card/85 p-8 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
                  <div className="absolute inset-0 bg-linear-to-br from-primary/12 via-transparent to-accent/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  <div className="relative z-10 space-y-4">
                    <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-foreground text-card">
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="font-serif text-xl font-medium text-foreground">
                      {benefit.title}
                    </h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {benefit.description}
                    </p>
                  </div>
                </article>
              </ScrollReveal>
            );
          })}
        </div>

        <ScrollReveal variant="slide-up" delayMs={800} duration={800}>
          <div className="mt-16 mx-auto max-w-4xl rounded-4xl bg-card/80 p-10 shadow-xl backdrop-blur">
            <div className="text-center space-y-6">
              <h3 className="font-serif text-2xl font-medium text-foreground md:text-3xl">
                {t("cta.title")}
              </h3>
              <p className="text-base leading-relaxed text-muted-foreground">
                {t("cta.description")}
              </p>
              <div className="grid gap-3 text-left text-sm leading-relaxed text-muted-foreground sm:grid-cols-2 mt-8">
                {(t.raw("cta.points") as string[]).map(
                  (point: string, index: number) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 rounded-3xl bg-muted/40 p-4"
                    >
                      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                      <span>{point}</span>
                    </div>
                  ),
                )}
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
