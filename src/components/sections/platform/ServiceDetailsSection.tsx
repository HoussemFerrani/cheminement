"use client";

import {
  Scale,
  Brain,
  Heart,
  Sparkles,
  CheckCircle2,
  Clock,
  Shield,
  Zap,
  Users,
  TrendingUp,
  HeartHandshake,
  Leaf,
} from "lucide-react";
import { useTranslations } from "next-intl";
import ScrollReveal from "@/components/ui/ScrollReveal";
import type { AnimationVariant } from "@/components/ui/ScrollReveal";

type ServiceDetail = {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  colorClass: string;
  bgClass: string;
  borderClass: string;
};

const serviceDetails: ServiceDetail[] = [
  {
    id: "eap",
    icon: Scale,
    colorClass: "text-amber-700",
    bgClass: "bg-amber-50",
    borderClass: "border-amber-200",
  },
  {
    id: "mentalHealth",
    icon: Brain,
    colorClass: "text-blue-700",
    bgClass: "bg-blue-50",
    borderClass: "border-blue-200",
  },
  {
    id: "primaryCare",
    icon: Heart,
    colorClass: "text-red-700",
    bgClass: "bg-red-50",
    borderClass: "border-red-200",
  },
  {
    id: "wellness",
    icon: Sparkles,
    colorClass: "text-emerald-700",
    bgClass: "bg-emerald-50",
    borderClass: "border-emerald-200",
  },
];

const featureIcons = [
  Clock,
  Shield,
  Zap,
  Users,
  TrendingUp,
  HeartHandshake,
  Leaf,
  CheckCircle2,
];

const cardAnimations: AnimationVariant[] = [
  "slide-right",
  "zoom-in",
  "slide-left",
  "fade-up",
];

export default function ServiceDetailsSection() {
  const t = useTranslations("Platform.serviceDetails");

  return (
    <section className="relative overflow-hidden bg-linear-to-b from-muted via-background to-muted py-24">
      <div className="absolute inset-0 opacity-[0.06]">
        <div className="absolute left-0 top-24 h-80 w-80 -translate-x-1/3 rounded-full bg-primary blur-3xl" />
        <div className="absolute right-0 bottom-0 h-104 w-104 translate-x-1/4 translate-y-1/4 rounded-full bg-accent blur-3xl" />
      </div>

      <div className="container relative z-10 mx-auto px-6">
        <ScrollReveal variant="blur-in" duration={700}>
          <div className="mx-auto max-w-5xl text-center mb-16">
            <p className="text-sm uppercase tracking-[0.35em] text-muted-foreground/70">
              {t("badge")}
            </p>
            <h2 className="mt-4 font-serif text-3xl font-medium leading-tight text-foreground md:text-4xl">
              {t("title")}
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-muted-foreground max-w-3xl mx-auto">
              {t("subtitle")}
            </p>
          </div>
        </ScrollReveal>

        <div className="space-y-16 max-w-6xl mx-auto">
          {serviceDetails.map((service, serviceIndex) => {
            const Icon = service.icon;
            const features = t.raw(`${service.id}.features`) as string[];

            return (
              <ScrollReveal
                key={service.id}
                variant={cardAnimations[serviceIndex % cardAnimations.length]}
                delayMs={200 + serviceIndex * 150}
                duration={800}
              >
                <article
                  className={`rounded-4xl border ${service.borderClass} ${service.bgClass}/30 p-8 md:p-12 backdrop-blur`}
                >
                  <div className="grid lg:grid-cols-[1fr_1.5fr] gap-10 items-start">
                    <div className="space-y-6">
                      <div
                        className={`inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-foreground text-card`}
                      >
                        <Icon className="h-7 w-7" />
                      </div>
                      <h3 className="font-serif text-2xl md:text-3xl font-medium text-foreground">
                        {t(`${service.id}.title`)}
                      </h3>
                      <p className="text-base leading-relaxed text-muted-foreground">
                        {t(`${service.id}.description`)}
                      </p>
                      <div className="pt-4">
                        <div className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-foreground">
                          <CheckCircle2 className="h-4 w-4" />
                          <span>{t(`${service.id}.highlight`)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      {features.map((feature: string, index: number) => {
                        const FeatureIcon =
                          featureIcons[
                            (serviceIndex * 2 + index) % featureIcons.length
                          ];
                        return (
                          <div
                            key={index}
                            className="flex items-start gap-3 rounded-3xl bg-card/80 p-5 shadow-sm"
                          >
                            <div
                              className={`mt-0.5 h-8 w-8 shrink-0 rounded-xl ${service.bgClass} flex items-center justify-center`}
                            >
                              <FeatureIcon
                                className={`h-4 w-4 ${service.colorClass}`}
                              />
                            </div>
                            <span className="text-sm leading-relaxed text-muted-foreground">
                              {feature}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </article>
              </ScrollReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
