"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { Award } from "lucide-react";
import ScrollReveal from "@/components/ui/ScrollReveal";

export default function HeroSection() {
  const t = useTranslations("HeroSection");

  return (
    <section className="relative bg-accent overflow-hidden">
      <div className="absolute inset-0 opacity-5"></div>

      <div className="container mx-auto px-5 sm:px-7 pt-24 pb-6 md:pt-32 md:pb-10 relative z-10 max-w-7xl">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-10">
          {/* Left Side: Content */}
          <div className="flex-1 w-full lg:max-w-[55%]">
            <ScrollReveal variant="fade-down" duration={700}>
              <div className="mb-4">
                <p className="text-sm md:text-base tracking-[0.25em] uppercase text-muted-foreground font-light mb-2">
                  {t("tagline")}
                </p>
                <div className="w-24 lg:w-28 h-0.5 bg-muted-foreground mx-auto lg:mx-0"></div>
              </div>
            </ScrollReveal>

            <ScrollReveal variant="zoom-in" delayMs={100} duration={600}>
              <div className="mb-5">
                <div className="inline-flex items-center gap-2.5 rounded-full bg-primary/10 border border-primary/20 px-4 py-2">
                  <div className="flex items-center justify-center h-7 w-7 rounded-full bg-primary">
                    <Award className="h-3.5 w-3.5 text-primary-foreground" />
                  </div>
                  <span className="text-sm font-medium text-foreground">
                    {t("designedByPsychologists")}
                  </span>
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal variant="slide-up" delayMs={200} duration={800}>
              <h1 className="text-[1.75rem] sm:text-3xl md:text-4xl lg:text-[2.75rem] xl:text-5xl font-serif font-light text-foreground mb-5 lg:mb-6 leading-tight text-left">
                {t("headline")}
              </h1>
            </ScrollReveal>

            <ScrollReveal variant="fade-up" delayMs={350} duration={700}>
              <p className="text-sm sm:text-base md:text-lg lg:text-lg text-muted-foreground max-w-none lg:max-w-[95%] mb-6 leading-relaxed font-light text-left">
                {t("description")}
              </p>
            </ScrollReveal>

            <ScrollReveal variant="fade-up" delayMs={500} duration={700}>
              <div className="flex flex-col sm:flex-row items-start justify-start gap-3">
                <Link
                  href="/appointment"
                  className="group relative px-7 py-3.5 bg-primary text-primary-foreground rounded-full text-base font-light tracking-wide overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl"
                >
                  <span className="relative z-10">{t("bookNow")}</span>
                  <div className="absolute inset-0 bg-primary/80 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                </Link>

                <Link
                  href="/book"
                  className="group flex items-center gap-2 px-7 py-3.5 text-foreground text-base font-light tracking-wide transition-all duration-300 hover:gap-3 border border-muted-foreground/20 rounded-full hover:bg-muted/50"
                >
                  <span>{t("learnMore")}</span>
                </Link>
              </div>
            </ScrollReveal>
          </div>

          {/* Right Side: Image */}
          <div className="flex-1 w-full lg:w-auto lg:max-w-[50%]">
            <ScrollReveal variant="fade-left" delayMs={400} duration={900}>
              <div className="relative w-full h-[55vh] sm:h-[60vh] md:h-[65vh] lg:h-[75vh] max-h-[680px] flex items-center justify-center">
                <Image
                  src="/HeroSection.png?v=2"
                  alt="Mental Health Professional"
                  width={720}
                  height={720}
                  className="w-auto h-full max-w-full object-contain"
                  priority
                  unoptimized
                />
                <div className="absolute bottom-0 left-0 right-0 h-32 lg:h-36 bg-linear-to-t from-accent to-transparent"></div>
              </div>
            </ScrollReveal>
          </div>
        </div>
        
      </div>
    </section>
  );
}
