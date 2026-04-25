"use client";

import { HeartHandshake, Sparkle } from "lucide-react";
import { useTranslations } from "next-intl";
import ScrollReveal from "@/components/ui/ScrollReveal";

export default function ContactHeroSection() {
  const t = useTranslations("Contact.hero");
  return (
    <section className="relative overflow-hidden bg-accent text-foreground">
      <div className="absolute inset-0 opacity-[0.08]">
        <div className="absolute left-0 top-10 h-80 w-80 -translate-x-1/3 rounded-full bg-primary blur-3xl" />
        <div className="absolute right-0 bottom-0 h-112 w-md translate-x-1/3 translate-y-1/4 rounded-full bg-primary/50 blur-3xl" />
      </div>

      <div className="container relative z-10 mx-auto px-6 py-24 md:py-32">
        <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <ScrollReveal variant="slide-right" duration={800}>
            <div className="space-y-8">
              <div className="flex items-center gap-3 text-sm uppercase tracking-[0.35em] text-muted-foreground/70">
                <HeartHandshake className="h-5 w-5 text-foreground" />
                <span>{t("badge")}</span>
              </div>
              <h1 className="font-serif text-4xl font-light leading-tight md:text-5xl lg:text-6xl">
                {t("headline")}
              </h1>
              <p className="text-lg leading-relaxed text-muted-foreground md:text-xl">
                {t("description")}
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal variant="fade-left" delayMs={200} duration={800}>
            <div className="rounded-4xl bg-card/70 p-8 shadow-xl backdrop-blur">
              <div className="flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                <Sparkle className="h-4 w-4" />
                <span>{t("expectations.title")}</span>
              </div>
              <ul className="mt-6 space-y-4 text-sm leading-relaxed text-muted-foreground">
                {t.raw("expectations.items").map((item: string) => (
                  <li key={item} className="flex gap-3">
                    <span className="mt-2 h-2 w-2 rounded-full bg-primary" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
