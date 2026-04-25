"use client";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Calendar } from "lucide-react";
import ScrollReveal from "@/components/ui/ScrollReveal";
import {
  SentiersProgramSection,
  ServicesHeroSection,
  ServiceProgramsSection,
  WorkplaceSection,
  ComplementaryServicesSection,
} from "@/components/sections/services";
import ColorTransition from "@/components/ui/ColorTransition";

export default function ServicesPage() {
  const tHero = useTranslations("HeroSection");

  return (
    <main>
      <ServicesHeroSection />
      <ColorTransition fromColor="accent" toColor="background" />
      <ServiceProgramsSection />
      <ScrollReveal variant="bounce-in" delayMs={850} duration={600}>
        <div className="mx-auto max-w-6xl px-6 py-12 text-center">
          <Link
            href="/appointment"
            className="group relative inline-flex items-center justify-center gap-3 rounded-full bg-foreground px-8 py-4 text-sm font-semibold uppercase tracking-[0.15em] text-background transition-all hover:gap-4 hover:shadow-lg"
          >
            <Calendar className="h-4 w-4" />
            <span>{tHero("bookNow")}</span>
          </Link>
        </div>
      </ScrollReveal>
      <ColorTransition fromColor="background" toColor="muted" />
      <WorkplaceSection />
      <ColorTransition fromColor="muted" toColor="background" />
      <SentiersProgramSection />
      <ColorTransition fromColor="background" toColor="muted" />
      <ComplementaryServicesSection />
    </main>
  );
}
