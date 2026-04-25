"use client";

import { ArrowRight, Sparkles, Target, Users } from "lucide-react";
import { useTranslations } from "next-intl";
import ScrollReveal from "@/components/ui/ScrollReveal";
import type { AnimationVariant } from "@/components/ui/ScrollReveal";

export default function MatchingSection() {
  const t = useTranslations("Approaches.matching");

  return (
    <section className="relative overflow-hidden bg-background py-24">
      <div className="absolute inset-0 opacity-[0.05]">
        <div className="absolute left-0 top-16 h-80 w-80 -translate-x-1/3 rounded-full bg-primary blur-3xl" />
        <div className="absolute right-0 bottom-0 h-104 w-104 translate-x-1/4 translate-y-1/3 rounded-full bg-accent blur-3xl" />
      </div>

      <div className="container relative z-10 mx-auto px-6">
        <div className="mx-auto flex max-w-6xl flex-col gap-12">
          <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
            <ScrollReveal variant="slide-right" duration={800}>
              <div className="space-y-6">
                <p className="text-sm uppercase tracking-[0.35em] text-muted-foreground/70">
                  {t("badge")}
                </p>
                <h2 className="font-serif text-3xl font-medium leading-tight text-foreground md:text-4xl">
                  {t("title")}
                </h2>
                <p className="text-base leading-relaxed text-muted-foreground">
                  {t("description")}
                </p>
                <div className="inline-flex items-center gap-3 rounded-full border border-primary/40 bg-muted/40 px-5 py-3 text-sm font-semibold uppercase tracking-[0.25em] text-muted-foreground">
                  <Sparkles className="h-4 w-4" />
                  <span>{t("highlight")}</span>
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal variant="fade-left" delayMs={200} duration={800}>
              <div className="rounded-4xl bg-card/80 p-8 shadow-xl backdrop-blur">
                <div className="flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span>{t("criteriaTitle")}</span>
                </div>
                <ul className="mt-5 space-y-3 text-sm leading-relaxed text-muted-foreground">
                  {t.raw("criteria").map((criterion: string) => (
                    <li key={criterion} className="flex items-start gap-3">
                      <span className="mt-2 h-2 w-2 rounded-full bg-primary" />
                      <span>{criterion}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </ScrollReveal>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {t
              .raw("steps")
              .map(
                (
                  step: { title: string; description: string },
                  index: number,
                ) => {
                  const cardAnimations: AnimationVariant[] = [
                    "fade-right",
                    "zoom-in",
                  ];
                  return (
                    <ScrollReveal
                      key={step.title}
                      variant={cardAnimations[index % cardAnimations.length]}
                      delayMs={400 + index * 150}
                      duration={700}
                    >
                      <div className="group relative overflow-hidden rounded-4xl border border-border/15 bg-card/85 p-6 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
                        <div className="absolute inset-0 bg-linear-to-tr from-primary/12 via-transparent to-accent/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                        <div className="relative z-10 space-y-4">
                          <div className="flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.25em] text-muted-foreground">
                            <Target className="h-4 w-4" />
                            <span>
                              {t("stepLabel")} {index + 1}
                            </span>
                          </div>
                          <h3 className="font-serif text-lg font-medium text-foreground">
                            {step.title}
                          </h3>
                          <p className="text-sm leading-relaxed text-muted-foreground">
                            {step.description}
                          </p>
                          <ArrowRight className="h-5 w-5 text-muted-foreground transition-transform duration-300 group-hover:translate-x-1" />
                        </div>
                      </div>
                    </ScrollReveal>
                  );
                },
              )}
          </div>
        </div>
      </div>
    </section>
  );
}
