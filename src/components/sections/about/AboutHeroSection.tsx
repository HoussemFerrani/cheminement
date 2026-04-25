"use client";

import { HeartHandshake, Award, Users } from "lucide-react";
import { useTranslations } from "next-intl";
import ScrollReveal from "@/components/ui/ScrollReveal";

export default function AboutHeroSection() {
  const t = useTranslations("About.hero");

  return (
    <section className="relative overflow-hidden bg-accent text-foreground">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute -top-32 right-10 h-80 w-80 rounded-full bg-primary blur-3xl" />
        <div className="absolute bottom-0 left-0 h-96 w-lg -translate-x-1/3 translate-y-1/3 rounded-full bg-primary/30 blur-3xl" />
      </div>

      <div className="container relative z-10 mx-auto px-6 py-24 md:py-32">
        <div className="mx-auto flex max-w-5xl flex-col gap-10">
          <ScrollReveal variant="fade-down" duration={700}>
            <div className="flex items-center gap-3 text-sm uppercase tracking-[0.4em] text-muted-foreground/70">
              <HeartHandshake className="h-5 w-5 text-foreground" />
              <span>{t("badge")}</span>
            </div>
          </ScrollReveal>

          {/* Highlighted: Designed by Psychologists */}
          <ScrollReveal variant="zoom-in" delayMs={100} duration={600}>
            <div className="inline-flex items-center gap-4 rounded-2xl bg-foreground/10 border border-foreground/20 px-6 py-4 w-fit backdrop-blur-sm">
              <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-foreground">
                <Award className="h-6 w-6 text-accent" />
              </div>
              <div>
                <p className="text-sm font-medium uppercase tracking-wider text-foreground/70">
                  {t("designedBy.label")}
                </p>
                <p className="text-lg font-serif font-semibold text-foreground">
                  {t("designedBy.title")}
                </p>
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal variant="slide-up" delayMs={200} duration={800}>
            <div className="space-y-8 text-left">
              <h1 className="max-w-4xl font-serif text-2xl font-light leading-tight text-foreground md:text-3xl lg:text-4xl">
                {t("headline")}
              </h1>
              <p className="text-base leading-relaxed text-muted-foreground md:text-lg">
                {t("description1")}
              </p>
              <p className="text-base leading-relaxed text-muted-foreground md:text-lg">
                {t("description2")}
              </p>
            </div>
          </ScrollReveal>

          {/* Trust indicators */}
          <ScrollReveal variant="blur-in" delayMs={400} duration={600}>
            <div className="flex flex-wrap gap-6 pt-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Users className="h-5 w-5 text-foreground" />
                <span className="text-sm">{t("trustIndicators.experts")}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Award className="h-5 w-5 text-foreground" />
                <span className="text-sm">
                  {t("trustIndicators.certified")}
                </span>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
