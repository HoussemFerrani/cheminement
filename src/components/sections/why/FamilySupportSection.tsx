"use client";

import { HeartHandshake, Users, Baby, Brain } from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import ScrollReveal from "@/components/ui/ScrollReveal";
import type { AnimationVariant } from "@/components/ui/ScrollReveal";

export default function FamilySupportSection() {
  const t = useTranslations("Why.familySupport");

  const supports = [
    {
      icon: HeartHandshake,
      title: t("services.adult.title"),
      description: t("services.adult.description"),
    },
    {
      icon: Users,
      title: t("services.family.title"),
      description: t("services.family.description"),
    },
    {
      icon: Brain,
      title: t("services.assessment.title"),
      description: t("services.assessment.description"),
    },
    {
      icon: Baby,
      title: t("services.parenting.title"),
      description: t("services.parenting.description"),
    },
  ];

  const cardAnimations: AnimationVariant[] = [
    "fade-right",
    "zoom-in",
    "fade-left",
    "slide-up",
  ];

  return (
    <section className="relative overflow-hidden bg-linear-to-b from-accent via-accent to-accent py-24">
      <div className="absolute inset-0 opacity-[0.08]">
        <div className="absolute left-0 top-16 h-80 w-80 -translate-x-1/3 rounded-full bg-primary blur-3xl" />
        <div className="absolute right-0 bottom-0 h-104 w-104 translate-x-1/4 translate-y-1/3 rounded-full bg-primary/60 blur-3xl" />
      </div>

      <div className="container relative z-10 mx-auto px-6">
        <div className="mx-auto max-w-6xl space-y-16">
          {/* Header with Family Image */}
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            {/* Left: Content */}
            <ScrollReveal variant="slide-right" duration={800}>
              <div className="space-y-6 rounded-4xl bg-card/70 p-10 shadow-xl backdrop-blur">
                <p className="text-sm uppercase tracking-[0.35em] text-muted-foreground/70">
                  {t("badge")}
                </p>
                <h2 className="font-serif text-3xl font-medium leading-tight text-foreground md:text-4xl">
                  {t("title")}
                </h2>
                <p className="text-base leading-relaxed text-muted-foreground">
                  {t("description")}
                </p>
                <div className="rounded-3xl bg-muted/30 p-6 text-sm font-medium uppercase tracking-[0.25em] text-muted-foreground">
                  {t("coordinated")}
                </div>
              </div>
            </ScrollReveal>

            {/* Right: Family Image */}
            <ScrollReveal variant="zoom-in" delayMs={200} duration={800}>
              <div className="relative aspect-4/3 overflow-hidden rounded-3xl shadow-2xl">
                <Image
                  src="/HappyFamilyEnjoyingAMomentTogether.jpg"
                  alt={t("imageAlt")}
                  fill
                  className="object-cover"
                />
              </div>
            </ScrollReveal>
          </div>

          {/* Services Grid */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 items-stretch">
            {supports.map(({ icon: Icon, title, description }, index) => (
              <ScrollReveal
                key={title}
                variant={cardAnimations[index % cardAnimations.length]}
                delayMs={400 + index * 100}
                duration={700}
                className="flex h-full"
              >
                <div className="flex h-full w-full flex-col rounded-3xl border border-border/10 bg-card/85 p-6 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-foreground text-card">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-serif text-xl font-medium text-foreground">
                    {title}
                  </h3>
                  <p className="mt-3 text-base leading-relaxed text-muted-foreground">
                    {description}
                  </p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
