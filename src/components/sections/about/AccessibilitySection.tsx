"use client";

import { Building2, UserCheck, Video } from "lucide-react";
import { useTranslations } from "next-intl";
import ScrollReveal from "@/components/ui/ScrollReveal";
import type { AnimationVariant } from "@/components/ui/ScrollReveal";

export default function AccessibilitySection() {
  const t = useTranslations("About.accessibility");

  const accessibilityOptions = [
    {
      icon: Video,
      title: t("options.remote.title"),
      description: t("options.remote.description"),
      details: t("options.remote.details"),
    },
    {
      icon: Building2,
      title: t("options.office.title"),
      description: t("options.office.description"),
      details: t("options.office.details"),
    },
    {
      icon: UserCheck,
      title: t("options.choice.title"),
      description: t("options.choice.description"),
      details: t("options.choice.details"),
    },
  ];

  const cardAnimations: AnimationVariant[] = [
    "fade-right",
    "zoom-in",
    "fade-left",
  ];

  return (
    <section className="relative overflow-hidden bg-background py-24">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-16 h-80 w-80 translate-x-1/2 rounded-full bg-primary blur-3xl" />
        <div className="absolute bottom-0 right-0 h-96 w-[28rem] translate-x-1/3 translate-y-1/3 rounded-full bg-accent blur-3xl" />
      </div>

      <div className="container relative z-10 mx-auto px-6">
        <ScrollReveal variant="blur-in" duration={700}>
          <div className="mx-auto max-w-5xl text-center">
            <p className="mb-4 text-sm uppercase tracking-[0.4em] text-muted-foreground/70">
              {t("badge")}
            </p>
            <h2 className="font-serif text-3xl font-medium leading-tight text-foreground md:text-4xl">
              {t("title")}
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
              {t("description")}
            </p>
          </div>
        </ScrollReveal>

        <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3 items-stretch">
          {accessibilityOptions.map(
            ({ icon: Icon, title, description, details }, index) => (
              <ScrollReveal
                key={title}
                variant={cardAnimations[index % cardAnimations.length]}
                delayMs={200 + index * 150}
                duration={700}
                className="flex h-full"
              >
                <div className="flex h-full w-full flex-col gap-4 rounded-3xl border border-border/10 bg-linear-to-b from-card to-card/90 p-8 text-left shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-foreground text-card">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-serif text-xl font-medium text-foreground">
                    {title}
                  </h3>
                  <p className="text-base leading-relaxed text-muted-foreground">
                    {description}
                  </p>
                  <div className="mt-auto rounded-2xl bg-muted/40 p-4 text-sm font-medium text-muted-foreground">
                    {details}
                  </div>
                </div>
              </ScrollReveal>
            ),
          )}
        </div>
      </div>
    </section>
  );
}
