"use client";

import ColorTransition from "@/components/ui/ColorTransition";
import Link from "next/link";
import {
  ContactChannelsSection,
  ContactHeroSection,
  EmergencySection,
  JoinUsSection,
  SupportSection,
} from "@/components/sections/contact";
import { useTranslations } from "next-intl";
import { Calendar } from "lucide-react";
import ScrollReveal from "@/components/ui/ScrollReveal";

function ContactBookCta() {
  const t = useTranslations("Contact.bookingCta");
  const tHero = useTranslations("HeroSection");
  return (
    <section className="relative overflow-hidden bg-linear-to-b from-muted via-background to-background py-24">
      <div className="absolute inset-0 opacity-[0.08]">
        <div className="absolute left-1/2 top-0 h-64 w-64 -translate-x-1/2 rounded-full bg-primary blur-3xl" />
        <div className="absolute right-16 bottom-0 h-56 w-56 translate-y-1/3 rounded-full bg-primary/60 blur-3xl" />
      </div>

      <div className="container relative z-10 mx-auto px-6">
        <ScrollReveal variant="zoom-in" duration={800}>
          <div className="mx-auto flex max-w-4xl flex-col items-center gap-6 rounded-[3rem] border border-border/15 bg-card/80 p-10 text-center shadow-xl backdrop-blur">
            <ScrollReveal variant="rotate-in" delayMs={150} duration={600}>
              <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-foreground text-card">
                <Calendar className="h-7 w-7" />
              </div>
            </ScrollReveal>
            <ScrollReveal variant="swing-in" delayMs={250} duration={600}>
              <p className="text-sm uppercase tracking-[0.35em] text-muted-foreground/70">
                {t("badge")}
              </p>
            </ScrollReveal>
            <ScrollReveal variant="blur-in" delayMs={350} duration={700}>
              <h2 className="font-serif text-3xl font-medium leading-tight text-foreground md:text-4xl">
                {t("title")}
              </h2>
            </ScrollReveal>
            <ScrollReveal variant="fade-up" delayMs={450} duration={600}>
              <p className="text-base leading-relaxed text-muted-foreground md:text-lg max-w-2xl">
                {t("description")}
              </p>
            </ScrollReveal>
            <ScrollReveal variant="bounce-in" delayMs={600} duration={700}>
              <Link
                href="/appointment"
                className="group relative inline-flex items-center gap-3 rounded-full bg-foreground px-8 py-4 text-sm font-semibold uppercase tracking-[0.15em] text-background transition-all hover:gap-4 hover:shadow-lg"
              >
                <Calendar className="h-4 w-4" />
                <span>{tHero("bookNow")}</span>
              </Link>
            </ScrollReveal>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}

export default function ContactPage() {
  return (
    <main className="bg-background">
      <ContactHeroSection />
      <ColorTransition fromColor="accent" toColor="background" />
      <ContactChannelsSection />
      <ColorTransition fromColor="background" toColor="muted" />
      <ContactBookCta />
      <ColorTransition fromColor="background" toColor="background" />
      <SupportSection />
      <ColorTransition fromColor="background" toColor="accent" />
      <EmergencySection />
      <ColorTransition fromColor="background" toColor="muted" />
      <JoinUsSection />
    </main>
  );
}
