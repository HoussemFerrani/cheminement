"use client";

import { useTranslations } from "next-intl";
import ScrollReveal from "@/components/ui/ScrollReveal";
import EnterpriseContactForm from "@/components/sections/services/EnterpriseContactForm";

export default function ContactDirectPage() {
  const t = useTranslations("Services.enterpriseCta");

  return (
    <main className="min-h-screen bg-linear-to-br from-background to-muted/20">
      <div className="container mx-auto px-4 pt-28 pb-12 max-w-3xl">
        <ScrollReveal variant="fade-up" delayMs={100} duration={600}>
          <div className="space-y-2 mb-6 text-center">
            <h1 className="font-serif text-3xl md:text-4xl font-medium text-foreground">
              {t("title")}
            </h1>
            <p className="text-sm text-muted-foreground md:text-base">
              {t("subtitle")}
            </p>
          </div>
        </ScrollReveal>

        <div className="rounded-4xl border border-border/20 bg-card/80 p-6 md:p-10 shadow-xl backdrop-blur">
          {/* Same content as the former modal */}
          <ScrollReveal variant="zoom-in" delayMs={200} duration={700}>
            <EnterpriseContactForm />
          </ScrollReveal>
        </div>
      </div>
    </main>
  );
}

