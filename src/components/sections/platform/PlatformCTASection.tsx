"use client";

import { ArrowRight, Phone, Mail, Sparkle } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import ScrollReveal from "@/components/ui/ScrollReveal";

export default function PlatformCTASection() {
  const t = useTranslations("Platform.cta");

  return (
    <section className="relative overflow-hidden bg-linear-to-b from-accent via-muted to-background py-24">
      <div className="absolute inset-0 opacity-[0.08]">
        <div className="absolute left-1/2 top-10 h-80 w-80 -translate-x-1/2 rounded-full bg-primary blur-3xl animate-float" />
        <div className="absolute right-10 bottom-0 h-72 w-72 translate-y-1/4 rounded-full bg-primary/60 blur-3xl" />
      </div>

      <div className="container relative z-10 mx-auto px-6">
        <ScrollReveal variant="zoom-in" duration={800}>
          <div className="mx-auto max-w-4xl rounded-[3rem] bg-card/80 p-12 text-center shadow-xl backdrop-blur">
            <ScrollReveal variant="bounce-in" delayMs={200} duration={600}>
              <div className="flex items-center justify-center gap-3 text-sm font-semibold uppercase tracking-[0.25em] text-muted-foreground mb-6">
                <Sparkle className="h-4 w-4" />
                <span>{t("badge")}</span>
              </div>
            </ScrollReveal>

            <ScrollReveal variant="blur-in" delayMs={300} duration={700}>
              <h2 className="font-serif text-3xl font-medium leading-tight text-foreground md:text-4xl">
                {t("title")}
              </h2>
            </ScrollReveal>

            <ScrollReveal variant="fade-up" delayMs={450} duration={700}>
              <p className="mt-6 text-lg leading-relaxed text-muted-foreground max-w-2xl mx-auto">
                {t("description")}
              </p>
            </ScrollReveal>

            <ScrollReveal variant="slide-up" delayMs={600} duration={700}>
              <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-3 rounded-full bg-foreground px-8 py-4 text-sm font-semibold uppercase tracking-[0.15em] text-background transition-all hover:gap-4 hover:shadow-lg"
                >
                  <span>{t("contactButton")}</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/appointment"
                  className="inline-flex items-center gap-3 rounded-full border-2 border-foreground px-8 py-4 text-sm font-semibold uppercase tracking-[0.15em] text-foreground transition-all hover:bg-foreground hover:text-background"
                >
                  <span>{t("demoButton")}</span>
                </Link>
              </div>
            </ScrollReveal>

            <ScrollReveal variant="fade-up" delayMs={750} duration={600}>
              <div className="mt-12 grid gap-6 sm:grid-cols-2 max-w-lg mx-auto">
                <div className="flex items-center justify-center gap-3 text-sm text-muted-foreground">
                  <div className="h-10 w-10 rounded-full bg-muted/60 flex items-center justify-center">
                    <Phone className="h-4 w-4 text-foreground" />
                  </div>
                  <span>{t("phone")}</span>
                </div>
                <div className="flex items-center justify-center gap-3 text-sm text-muted-foreground">
                  <div className="h-10 w-10 rounded-full bg-muted/60 flex items-center justify-center">
                    <Mail className="h-4 w-4 text-foreground" />
                  </div>
                  <span>{t("email")}</span>
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal variant="blur-in" delayMs={900} duration={500}>
              <p className="mt-8 text-xs text-muted-foreground/70">
                {t("helpText")}
              </p>
            </ScrollReveal>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
