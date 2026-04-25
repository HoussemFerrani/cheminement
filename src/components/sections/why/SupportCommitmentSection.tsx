"use client";

import { MessageCircle, UserCheck, HeartHandshake } from "lucide-react";
import { useTranslations } from "next-intl";
import ScrollReveal from "@/components/ui/ScrollReveal";
import type { AnimationVariant } from "@/components/ui/ScrollReveal";

export default function SupportCommitmentSection() {
  const t = useTranslations("Why.supportCommitment");

  const steps = [
    {
      icon: MessageCircle,
      title: t("steps.contact.title"),
      description: t("steps.contact.description"),
    },
    {
      icon: UserCheck,
      title: t("steps.matching.title"),
      description: t("steps.matching.description"),
    },
    {
      icon: HeartHandshake,
      title: t("steps.followUp.title"),
      description: t("steps.followUp.description"),
    },
  ];

  const cardAnimations: AnimationVariant[] = [
    "fade-right",
    "zoom-in",
    "fade-left",
  ];

  return (
    <section className="relative overflow-hidden bg-linear-to-b from-background via-background to-background py-24">
      <div className="absolute inset-0 opacity-[0.08]">
        <div className="absolute left-1/2 top-10 h-80 w-80 -translate-x-1/2 rounded-full bg-primary blur-3xl" />
        <div className="absolute right-10 bottom-0 h-72 w-72 translate-y-1/4 rounded-full bg-primary/60 blur-3xl" />
      </div>

      <div className="container relative z-10 mx-auto px-6">
        <div className="mx-auto max-w-5xl space-y-12">
          <ScrollReveal variant="blur-in" duration={700}>
            <header className="text-center">
              <p className="text-sm uppercase tracking-[0.35em] text-muted-foreground/70">
                {t("badge")}
              </p>
              <h2 className="mt-4 font-serif text-3xl font-medium leading-tight text-foreground md:text-4xl">
                {t("title")}
              </h2>
              <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
                {t("description")}
              </p>
            </header>
          </ScrollReveal>

          <div className="grid gap-8 md:grid-cols-3">
            {steps.map(({ icon: Icon, title, description }, index) => (
              <ScrollReveal
                key={title}
                variant={cardAnimations[index % cardAnimations.length]}
                delayMs={200 + index * 150}
                duration={700}
              >
                <div className="rounded-4xl border border-border/10 bg-card/85 p-8 text-center shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
                  <div className="mx-auto mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-foreground text-card">
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

          <ScrollReveal variant="bounce-in" delayMs={700} duration={700}>
            <div className="rounded-4xl border border-dashed border-primary/35 bg-card/70 p-8 text-center text-base leading-relaxed text-muted-foreground shadow-lg">
              {t("goal")}
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
