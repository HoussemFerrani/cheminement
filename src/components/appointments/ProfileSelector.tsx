"use client";

import { useTranslations } from "next-intl";
import { User, Users, Stethoscope } from "lucide-react";
import ScrollReveal from "@/components/ui/ScrollReveal";
import type { AnimationVariant } from "@/components/ui/ScrollReveal";
import ProfileSelectionCard from "./ProfileSelectionCard";

const profiles = [
  { key: "self" as const, href: "/appointment?for=self", icon: User },
  { key: "loved-one" as const, href: "/appointment?for=loved-one", icon: Users },
  { key: "patient" as const, href: "/appointment?for=patient", icon: Stethoscope },
];

const cardAnimations: AnimationVariant[] = ["fade-right", "zoom-in", "fade-left"];

export default function ProfileSelector() {
  const t = useTranslations("HeroSection");

  return (
    <section className="relative py-20 bg-accent/30 overflow-hidden">
      <div className="container mx-auto px-5 sm:px-7 relative z-10 max-w-5xl">
        <ScrollReveal variant="fade-down" duration={700}>
          <div className="text-center mb-14">
            <div className="mb-4">
              <p className="text-sm md:text-base tracking-[0.3em] uppercase text-muted-foreground font-light mb-2">
                {t("bookingTitle")}
              </p>
              <div className="w-24 h-0.5 bg-muted-foreground mx-auto" />
            </div>
            <h2 className="text-2xl md:text-3xl font-serif font-light text-foreground">
              {t("bookingSubtitle")}
            </h2>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {profiles.map((profile, index) => (
            <ScrollReveal
              key={profile.key}
              variant={cardAnimations[index]}
              delayMs={150 + index * 100}
              duration={700}
            >
              <ProfileSelectionCard
                href={profile.href}
                icon={profile.icon}
                title={t(`for${profile.key === "self" ? "Self" : profile.key === "loved-one" ? "LovedOne" : "Patient"}`)}
                description={t(`for${profile.key === "self" ? "Self" : profile.key === "loved-one" ? "LovedOne" : "Patient"}Desc`)}
                cta={t("bookNow")}
              />
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
