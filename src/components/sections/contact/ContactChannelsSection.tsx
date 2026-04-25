"use client";

import Link from "next/link";
import { Mail, Info, Users, ClipboardList, Wallet, MessageSquare } from "lucide-react";
import { useTranslations } from "next-intl";
import ScrollReveal from "@/components/ui/ScrollReveal";
import type { AnimationVariant } from "@/components/ui/ScrollReveal";
import { Button } from "@/components/ui/button";

export default function ContactChannelsSection() {
  const t = useTranslations("Contact.channels");
  const inquiries = [
    {
      icon: Info,
      title: t("inquiries.services.title"),
      description: t("inquiries.services.description"),
    },
    {
      icon: Users,
      title: t("inquiries.matching.title"),
      description: t("inquiries.matching.description"),
    },
    {
      icon: ClipboardList,
      title: t("inquiries.sentiers.title"),
      description: t("inquiries.sentiers.description"),
    },
    {
      icon: Wallet,
      title: t("inquiries.support.title"),
      description: t("inquiries.support.description"),
    },
  ];

  const cardAnimations: AnimationVariant[] = [
    "fade-right",
    "zoom-in",
    "fade-left",
    "slide-up",
  ];

  return (
    <section className="relative overflow-hidden bg-background py-24">
      <div className="absolute inset-0 opacity-[0.05]">
        <div className="absolute left-10 top-0 h-72 w-72 rounded-full bg-accent blur-3xl animate-float" />
        <div className="absolute right-0 bottom-0 h-104 w-104 translate-x-1/3 translate-y-1/3 rounded-full bg-primary/40 blur-3xl" />
      </div>

      <div className="container relative z-10 mx-auto px-6">
        <div className="mx-auto max-w-6xl space-y-12">
          <ScrollReveal variant="slide-up" duration={800}>
            <header className="grid gap-6 rounded-4xl bg-card/80 px-8 py-10 shadow-xl backdrop-blur md:grid-cols-[1fr_1fr] md:items-center">
              <div className="space-y-3 text-left">
                <p className="text-sm uppercase tracking-[0.35em] text-muted-foreground/70">
                  {t("badge")}
                </p>
                <h2 className="font-serif text-3xl font-medium leading-tight text-foreground md:text-4xl">
                  {t("title")}
                </h2>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-4 rounded-3xl border border-primary/30 bg-muted/40 px-6 py-4 text-sm font-medium text-muted-foreground">
                  <Mail className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                      {t("emailLabel")}
                    </p>
                    <p className="text-base text-foreground">{t("email")}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 rounded-3xl border border-border/20 bg-card/70 px-6 py-4 text-sm font-medium text-muted-foreground">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                      {t("phoneLabel")}
                    </p>
                    <p className="text-base text-foreground">{t("phone")}</p>
                  </div>
                </div>
                <Button asChild variant="default" className="mt-4 w-full sm:w-auto">
                  <Link href="/contact/formulaire">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    {t("formButton")}
                  </Link>
                </Button>
              </div>
            </header>
          </ScrollReveal>

          <div className="grid gap-6 md:grid-cols-2">
            {inquiries.map(({ icon: Icon, title, description }, index) => (
              <ScrollReveal
                key={title}
                variant={cardAnimations[index % cardAnimations.length]}
                delayMs={200 + index * 100}
                duration={700}
              >
                <article className="group relative overflow-hidden rounded-4xl border border-border/15 bg-card/85 p-6 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
                  <div className="absolute inset-0 bg-linear-to-br from-primary/10 via-transparent to-accent/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  <div className="relative z-10 space-y-4">
                    <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-foreground text-card">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="font-serif text-lg font-medium text-foreground">
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

          <ScrollReveal variant="blur-in" delayMs={600} duration={600}>
            <p className="text-sm text-muted-foreground">{t("responseTime")}</p>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
