"use client";

import Link from "next/link";
import { Briefcase, CheckCircle2 } from "lucide-react";
import { useTranslations } from "next-intl";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { Button } from "@/components/ui/button";

export default function WorkplaceSection() {
  const t = useTranslations("Services.workplaceSection");
  const workplace = useTranslations("Services.programs.workplace");

  return (
    <section className="relative overflow-hidden bg-muted py-24">
      <div className="absolute inset-0 opacity-[0.06]">
        <div className="absolute left-0 top-20 h-80 w-80 -translate-x-1/3 rounded-full bg-primary blur-3xl" />
        <div className="absolute right-0 bottom-0 h-104 w-104 translate-x-1/3 translate-y-1/3 rounded-full bg-accent blur-3xl" />
      </div>

      <div className="container relative z-10 mx-auto px-6">
        <div className="mx-auto max-w-6xl space-y-10">
          <header className="text-center">
            <ScrollReveal variant="swing-in" duration={600}>
              <p className="text-sm uppercase tracking-[0.35em] text-muted-foreground/70">
                {t("badge")}
              </p>
            </ScrollReveal>
            <ScrollReveal variant="blur-in" delayMs={150} duration={700}>
              <h2 className="mt-4 font-serif text-3xl font-medium leading-tight text-foreground md:text-4xl">
                {t("title")}
              </h2>
            </ScrollReveal>
            <ScrollReveal variant="fade-up" delayMs={300} duration={600}>
              <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
                {t("description")}
              </p>
            </ScrollReveal>
          </header>

          <ScrollReveal variant="zoom-in" delayMs={400} duration={800}>
            <article className="rounded-4xl border border-border/20 bg-card/85 p-10 shadow-xl backdrop-blur">
              <div className="grid gap-10 lg:grid-cols-[1fr_1.4fr] lg:items-start">
                <div className="space-y-6">
                  <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-foreground text-card">
                    <Briefcase className="h-7 w-7" />
                  </div>
                  <h3 className="font-serif text-2xl md:text-3xl font-medium text-foreground">
                    {workplace("title")}
                  </h3>
                  <p className="text-base leading-relaxed text-muted-foreground">
                    {workplace("description")}
                  </p>
                  <div className="pt-4">
                    <div className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-foreground">
                      <CheckCircle2 className="h-4 w-4" />
                      <span>{workplace("highlight")}</span>
                    </div>
                  </div>
                  <Button asChild className="mt-6 w-full sm:w-auto">
                    <Link href="/services/contact-direct">
                      {t("contactButton")}
                    </Link>
                  </Button>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  {workplace
                    .raw("features")
                    .map((feature: string, index: number) => (
                      <div
                        key={`${feature}-${index}`}
                        className="flex items-start gap-3 rounded-3xl bg-muted/30 p-5 text-sm leading-relaxed text-muted-foreground"
                      >
                        <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
                        <span>{feature}</span>
                      </div>
                    ))}
                </div>
              </div>
            </article>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
