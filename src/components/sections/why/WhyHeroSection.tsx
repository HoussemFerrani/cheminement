"use client";

import { Sparkle, ShieldPlus } from "lucide-react";
import { useTranslations } from "next-intl";
import ScrollReveal from "@/components/ui/ScrollReveal";

export default function WhyHeroSection() {
  const t = useTranslations("Why.hero");
  return (
    <section className="relative overflow-hidden bg-accent text-foreground">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute -top-24 left-16 h-64 w-64 rounded-full bg-primary blur-3xl" />
        <div className="absolute bottom-0 right-0 h-112 w-md translate-x-1/3 translate-y-1/4 rounded-full bg-primary/40 blur-3xl" />
      </div>

      <div className="container relative z-10 mx-auto px-6 py-24 md:py-32">
        <div className="mx-auto flex max-w-5xl flex-col gap-12">
          <ScrollReveal variant="fade-down" duration={700}>
            <div className="flex items-center gap-3 text-sm uppercase tracking-[0.4em] text-muted-foreground/70">
              <ShieldPlus className="h-5 w-5 text-foreground" />
              <span>{t("badge")}</span>
            </div>
          </ScrollReveal>

          <ScrollReveal variant="blur-in" delayMs={150} duration={800}>
            <h1 className="max-w-4xl font-serif text-2xl font-light leading-tight text-foreground md:text-3xl lg:text-4xl">
              {t("headline")}
            </h1>
          </ScrollReveal>

          <ScrollReveal variant="slide-up" delayMs={300} duration={700}>
            <p className="text-lg leading-relaxed text-muted-foreground md:text-xl">
              {t("description")}
            </p>
          </ScrollReveal>

          <ScrollReveal variant="swing-in" delayMs={450} duration={600}>
            <div className="flex items-center gap-3 text-base font-medium uppercase tracking-[0.3em] text-muted-foreground">
              <Sparkle className="h-4 w-4" />
              <span>{t("subtitle")}</span>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
