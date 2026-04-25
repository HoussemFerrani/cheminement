"use client";

import {
  HeartPulse,
  Baby,
  Users,
  HeartHandshake,
  Compass,
  Briefcase,
  GraduationCap,
} from "lucide-react";
import { useTranslations } from "next-intl";
import ScrollReveal from "@/components/ui/ScrollReveal";
import type { AnimationVariant } from "@/components/ui/ScrollReveal";

export default function TherapySpectrumSection() {
  const t = useTranslations("Services.therapySpectrum");

  const services = [
    {
      icon: HeartPulse,
      title: t("services.adult.title"),
      description: t("services.adult.description"),
    },
    {
      icon: Baby,
      title: t("services.child.title"),
      description: t("services.child.description"),
    },
    {
      icon: Users,
      title: t("services.family.title"),
      description: t("services.family.description"),
    },
    {
      icon: HeartHandshake,
      title: t("services.couple.title"),
      description: t("services.couple.description"),
    },
    {
      icon: Compass,
      title: t("services.parenting.title"),
      description: t("services.parenting.description"),
    },
    {
      icon: Briefcase,
      title: t("services.workplace.title"),
      description: t("services.workplace.description"),
    },
    {
      icon: GraduationCap,
      title: t("services.schoolAnxiety.title"),
      description: t("services.schoolAnxiety.description"),
    },
  ];

  const cardAnimations: AnimationVariant[] = [
    "fade-right",
    "zoom-in",
    "fade-left",
    "slide-up",
    "rotate-in",
    "blur-in",
    "swing-in",
  ];

  return (
    <section className="relative overflow-hidden bg-background py-24">
      <div className="absolute inset-0 opacity-[0.05]">
        <div className="absolute left-10 top-0 h-72 w-72 rounded-full bg-accent blur-3xl" />
        <div className="absolute right-0 bottom-0 h-104 w-104 translate-x-1/3 translate-y-1/4 rounded-full bg-primary/40 blur-3xl" />
      </div>

      <div className="container relative z-10 mx-auto px-6">
        <ScrollReveal variant="fade-down" duration={700}>
          <div className="mx-auto max-w-5xl text-center">
            <p className="text-sm uppercase tracking-[0.35em] text-muted-foreground/70">
              {t("badge")}
            </p>
            <h2 className="mt-4 font-serif text-3xl font-medium leading-tight text-foreground md:text-4xl">
              {t("title")}
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
              {t("description")}
            </p>
          </div>
        </ScrollReveal>

        {/* Image placeholder for services */}
        <ScrollReveal variant="zoom-in" delayMs={200} duration={800}>
          <div className="mt-12 mx-auto max-w-4xl">
            <div className="relative aspect-[21/9] rounded-3xl overflow-hidden shadow-xl">
              {/* Placeholder - replace with actual image */}
              <div className="absolute inset-0 bg-linear-to-br from-accent/30 via-primary/20 to-muted flex items-center justify-center">
                <div className="text-center p-8">
                  <Users
                    className="h-16 w-16 text-foreground/30 mx-auto mb-4"
                    strokeWidth={1}
                  />
                  <p className="text-sm text-foreground/50 font-medium">
                    {t("imageAlt")}
                  </p>
                </div>
              </div>
              {/* Uncomment when image is available:
              <Image
                src="/images/services-therapy.jpg"
                alt={t("imageAlt")}
                fill
                className="object-cover"
              />
              */}
            </div>
          </div>
        </ScrollReveal>

        <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {services.map(({ icon: Icon, title, description }, index) => (
            <ScrollReveal
              key={title}
              variant={cardAnimations[index % cardAnimations.length]}
              delayMs={400 + index * 100}
              duration={700}
            >
              <article className="group relative overflow-hidden rounded-4xl border border-border/15 bg-card/85 p-8 text-left shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
                <div className="absolute inset-0 bg-linear-to-br from-primary/12 via-transparent to-accent/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                <div className="relative z-10 space-y-4">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-foreground text-card">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-serif text-xl font-medium text-foreground">
                    {title}
                  </h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {description}
                  </p>
                </div>
              </article>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
