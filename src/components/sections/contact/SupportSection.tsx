"use client";

import { LifeBuoy, Compass, Laptop2, Wallet } from "lucide-react";
import { useTranslations } from "next-intl";
import ScrollReveal from "@/components/ui/ScrollReveal";
import type { AnimationVariant } from "@/components/ui/ScrollReveal";

export default function SupportSection() {
  const t = useTranslations("Contact.support");

  const supportAreas = [
    {
      icon: Compass,
      title: t("areas.services.title"),
      description: t("areas.services.description"),
    },
    {
      icon: Laptop2,
      title: t("areas.consultations.title"),
      description: t("areas.consultations.description"),
    },
    {
      icon: Wallet,
      title: t("areas.billing.title"),
      description: t("areas.billing.description"),
    },
  ];

  const cardAnimations: AnimationVariant[] = [
    "fade-right",
    "zoom-in",
    "fade-left",
  ];

  return (
    <section className="relative overflow-hidden bg-background py-24">
      <div className="absolute inset-0 opacity-[0.05]">
        <div className="absolute left-0 top-12 h-72 w-72 -translate-x-1/3 rounded-full bg-primary blur-3xl" />
        <div className="absolute right-0 bottom-0 h-104 w-104 translate-x-1/3 translate-y-1/4 rounded-full bg-accent blur-3xl" />
      </div>

      <div className="container relative z-10 mx-auto px-6">
        <div className="mx-auto max-w-6xl space-y-12">
          <ScrollReveal variant="slide-up" duration={800}>
            <header className="rounded-4xl bg-card/80 p-10 text-center shadow-xl backdrop-blur">
              <ScrollReveal variant="rotate-in" delayMs={150} duration={600}>
                <div className="mx-auto mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-foreground text-card">
                  <LifeBuoy className="h-7 w-7" />
                </div>
              </ScrollReveal>
              <ScrollReveal variant="swing-in" delayMs={250} duration={600}>
                <p className="text-sm uppercase tracking-[0.35em] text-muted-foreground/70">
                  {t("badge")}
                </p>
              </ScrollReveal>
              <ScrollReveal variant="blur-in" delayMs={350} duration={700}>
                <h2 className="mt-4 font-serif text-3xl font-medium leading-tight text-foreground md:text-4xl">
                  {t("title")}
                </h2>
              </ScrollReveal>
              <ScrollReveal variant="fade-up" delayMs={450} duration={600}>
                <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
                  {t("description")}
                </p>
              </ScrollReveal>
            </header>
          </ScrollReveal>

          <div className="grid gap-8 md:grid-cols-3">
            {supportAreas.map(({ icon: Icon, title, description }, index) => (
              <ScrollReveal
                key={title}
                variant={cardAnimations[index % cardAnimations.length]}
                delayMs={550 + index * 120}
                duration={700}
              >
                <div className="rounded-3xl border border-border/10 bg-card/85 p-8 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
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

          <ScrollReveal variant="bounce-in" delayMs={900} duration={700}>
            <p className="rounded-3xl border border-dashed border-primary/30 bg-card/70 p-6 text-center text-sm text-muted-foreground">
              {t("contactPrompt")}
            </p>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
