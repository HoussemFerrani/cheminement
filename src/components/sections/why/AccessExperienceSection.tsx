"use client";

import {
  Video,
  Building2,
  LayoutDashboard,
  Compass,
  Headset,
} from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import ScrollReveal from "@/components/ui/ScrollReveal";
import type { AnimationVariant } from "@/components/ui/ScrollReveal";

export default function AccessExperienceSection() {
  const t = useTranslations("Why.access");

  const modes = [
    {
      icon: Video,
      title: t("modes.remote.title"),
      description: t("modes.remote.description"),
      highlight: t("modes.remote.highlight"),
    },
    {
      icon: Building2,
      title: t("modes.office.title"),
      description: t("modes.office.description"),
      highlight: t("modes.office.highlight"),
    },
  ];

  const experienceHighlights = [
    {
      icon: LayoutDashboard,
      title: t("platform.highlights.navigation.title"),
      description: t("platform.highlights.navigation.description"),
    },
    {
      icon: Compass,
      title: t("platform.highlights.access.title"),
      description: t("platform.highlights.access.description"),
    },
    {
      icon: Headset,
      title: t("platform.highlights.support.title"),
      description: t("platform.highlights.support.description"),
    },
  ];
  const cardAnimations: AnimationVariant[] = [
    "fade-right",
    "zoom-in",
    "fade-left",
  ];

  return (
    <section className="relative overflow-hidden bg-linear-to-b from-muted via-muted to-muted py-24">
      <div className="absolute inset-0 opacity-[0.06]">
        <div className="absolute left-0 top-24 h-80 w-80 -translate-x-1/3 rounded-full bg-primary blur-3xl animate-float" />
        <div className="absolute right-0 bottom-0 h-96 w-96 translate-x-1/3 translate-y-1/4 rounded-full bg-accent blur-3xl" />
      </div>

      <div className="container relative z-10 mx-auto px-6">
        <div className="mx-auto max-w-7xl space-y-16">
          <ScrollReveal variant="blur-in" duration={700}>
            <header className="text-center">
              <p className="text-sm uppercase tracking-[0.35em] text-muted-foreground/70">
                {t("badge")}
              </p>
              <h2 className="mt-4 font-serif text-3xl font-medium leading-tight text-foreground md:text-4xl">
                {t("title")}
              </h2>
              <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
                {t("description")}
              </p>
            </header>
          </ScrollReveal>

          <ScrollReveal variant="zoom-in" delayMs={200} duration={800}>
            <div className="mx-auto max-w-4xl">
              <div className="relative aspect-21/9 rounded-3xl overflow-hidden shadow-xl">
                <Image
                  src="/PsychologistOfficeWelcoming.jpg"
                  alt="Welcoming psychologist office"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </ScrollReveal>

          <div className="space-y-12">
            <div className="grid gap-6 md:grid-cols-2 items-stretch">
              {modes.map(
                ({ icon: Icon, title, description, highlight }, index) => (
                  <ScrollReveal
                    key={title}
                    variant={cardAnimations[index % cardAnimations.length]}
                    delayMs={400 + index * 150}
                    duration={700}
                    className="flex h-full"
                  >
                    <div className="relative flex h-full w-full flex-col overflow-hidden rounded-4xl border border-border/20 bg-card/90 p-8 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
                      <div className="absolute inset-0 bg-linear-to-br from-primary/10 via-transparent to-accent/10 opacity-0 transition-opacity duration-300 hover:opacity-100" />
                      <div className="relative z-10 flex h-full flex-col gap-5">
                        <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-foreground text-card shadow-md">
                          <Icon className="h-6 w-6" />
                        </div>
                        <h3 className="font-serif text-xl font-medium text-foreground">
                          {title}
                        </h3>
                        <p className="text-base leading-relaxed text-muted-foreground">
                          {description}
                        </p>
                        <div className="mt-auto rounded-2xl bg-muted/40 px-4 py-3 text-sm font-semibold uppercase tracking-[0.25em] text-muted-foreground">
                          {highlight}
                        </div>
                      </div>
                    </div>
                  </ScrollReveal>
                ),
              )}
            </div>

            <ScrollReveal variant="slide-up" delayMs={700} duration={800}>
              <div className="rounded-4xl bg-card/80 p-8 shadow-xl backdrop-blur">
                <ScrollReveal variant="fade-down" delayMs={850} duration={600}>
                  <div className="text-center mb-8">
                    <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground/70">
                      {t("platform.badge")}
                    </p>
                    <h3 className="mt-4 font-serif text-2xl font-medium text-foreground">
                      {t("platform.title")}
                    </h3>
                  </div>
                </ScrollReveal>
                <div className="grid gap-6 md:grid-cols-3">
                  {experienceHighlights.map(
                    ({ icon: Icon, title, description }, index) => (
                      <ScrollReveal
                        key={title}
                        variant="swing-in"
                        delayMs={950 + index * 100}
                        duration={600}
                      >
                        <div className="flex items-start gap-4 rounded-3xl bg-muted/30 p-5">
                          <div className="inline-flex aspect-square h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-foreground text-card shadow-md">
                            <Icon className="h-6 w-6 shrink-0" />
                          </div>
                          <div>
                            <p className="font-serif text-lg font-medium text-foreground">
                              {title}
                            </p>
                            <p className="text-sm leading-relaxed text-muted-foreground">
                              {description}
                            </p>
                          </div>
                        </div>
                      </ScrollReveal>
                    ),
                  )}
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </div>
    </section>
  );
}
