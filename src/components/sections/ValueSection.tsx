"use client";

import { Route, Award, Clock, Lock } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import Image from "next/image";

export default function ValueSection() {
  const t = useTranslations("ValueSection");
  const locale = useLocale();

  const values = [
    {
      icon: Route,
      titleEn: "Personalized pathway",
      titleFr: "Un parcours personnalisé",
      descriptionEn:
        "Our service is designed to create a fully personalized pathway, because we believe that your need and your journey do not follow a single path.",
      descriptionFr:
        "Notre service est conçu pour créer un parcours entièrement personnalisé, car nous croyons que votre besoin et votre démarche ne suivent pas un chemin unique.",
      featuresEn: [],
      featuresFr: [],
    },
    {
      icon: Award,
      titleEn: "Recognized expertise",
      titleFr: "Une expertise reconnue",
      descriptionEn:
        "Whether it's a psychologist, psychotherapist or another professional, you will always work with an expert whose practice is regulated and recognized by their professional order.",
      descriptionFr:
        "Que ce soit un psychologue, un psychothérapeute ou un autre professionnel, vous allez toujours travaillez avec un expert dont la pratique est encadrée et reconnue par son ordre professionnel.",
      featuresEn: [],
      featuresFr: [],
    },
    {
      icon: Clock,
      titleEn: "Accessibility and flexibility",
      titleFr: "Accessibilité et flexibilité",
      subtitleEn: "Where and when you want",
      subtitleFr: "Où et quand vous le souhaitez",
      descriptionEn:
        "We offer flexible support tailored to your needs: remote consultations via secure video calls for accessibility from anywhere, or in-person appointments in our welcoming offices. Our matching process helps you find the right professional for your specific needs and preferences, strengthening engagement and ensuring a successful therapeutic journey.",
      descriptionFr:
        "Nous offrons un soutien flexible adapté à vos besoins : consultations à distance via appels vidéo sécurisés pour une accessibilité partout, ou rendez-vous en personne dans nos bureaux accueillants. Notre processus de jumelage vous aide à trouver le bon professionnel pour vos besoins spécifiques et vos préférences, renforçant l'engagement et assurant un parcours thérapeutique réussi.",
      featuresEn: [],
      featuresFr: [],
    },
    {
      icon: Lock,
      titleEn: "Confidentiality and ethics",
      titleFr: "Confidentialité et Éthique",
      subtitleEn: "The foundation of our commitment",
      subtitleFr: "La fondation de notre engagement",
      descriptionEn:
        "Your well-being and your trust are our absolute priorities. Your data is hosted exclusively on Canadian servers, ensuring full data sovereignty. We follow strict compliance with Bill 25 and apply rigorous protection of your privacy. These principles are the foundations of our service, ensuring that you evolve in a safe and respectful environment.",
      descriptionFr:
        "Votre bien-être et votre confiance sont nos priorités absolues. Vos données sont hébergées exclusivement sur des serveurs canadiens, garantissant une souveraineté complète de vos données. Nous respectons strictement la Loi 25 et appliquons une protection rigoureuse de votre vie privée. Ces principes sont les fondations de notre service, garantissant que vous évoluiez dans un environnement sécuritaire et respectueux.",
      featuresEn: [],
      featuresFr: [],
    },
  ];
  return (
    <section className="relative py-24 bg-linear-to-b from-background via-muted to-accent overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-10 w-64 h-64 bg-[#8b7355] rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#d4a574] rounded-full blur-3xl"></div>
      </div>
      <div
        className="absolute top-0 left-1/3 w-[1200px] h-[1200px] rounded-full animate-fade-in"
        style={{
          background:
            "radial-gradient(circle, oklch(0.92 0.015 75) 0%, oklch(0.92 0.015 75 / 0) 70%)",
        }}
      ></div>

      <div className="container mx-auto px-6 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16 max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-foreground mb-4">
            {t("title")}
          </h2>
          <p className="text-xl md:text-2xl text-foreground font-semibold mb-6">
            {t("subtitle")}
          </p>
          <p className="text-base md:text-lg text-muted-foreground font-normal leading-relaxed whitespace-pre-line">
            {t("description", {
              integratedPlatform: t("integratedPlatform"),
            })}
          </p>
        </div>

        {/* Staggered Grid Layout - 4 Column Stairs Pattern (comme zod-validation) */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8 max-w-[1600px] mx-auto">
          {/* First Column - Carte "Parcours personnalisé" + bloc B image jeune fille */}
          <div className="lg:mt-0">
            <ValueCard value={values[0]} index={0} locale={locale} />
            <div className="-mt-1 relative flex justify-center lg:justify-start">
              <Image
                src="/ValueSection.png"
                alt="Jeune fille parcours personnalisé"
                width={340}
                height={340}
                className="w-full max-w-[340px] h-auto transform scale-x-[-1]"
              />
              {/* Fading effect at bottom */}
              <div className="absolute -bottom-8 left-0 right-0 h-40 bg-linear-to-t from-accent to-transparent z-10"></div>
            </div>
          </div>

          {/* Second Column - Staggered down */}
          <div className="lg:mt-32">
            <ValueCard value={values[1]} index={1} locale={locale} />
          </div>

          {/* Third Column - Staggered down more */}
          <div className="lg:mt-64">
            <ValueCard value={values[2]} index={2} locale={locale} />
          </div>

          {/* Fourth Column - Staggered down most */}
          <div className="lg:mt-96">
            <ValueCard value={values[3]} index={3} locale={locale} />
          </div>
        </div>
      </div>
    </section>
  );
}

function ValueCard({
  value,
  index,
  locale,
}: {
  value: {
    icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
    titleEn: string;
    titleFr: string;
    subtitleEn?: string;
    subtitleFr?: string;
    descriptionEn: string;
    descriptionFr: string;
    featuresEn: string[];
    featuresFr: string[];
  };
  index: number;
  locale: string;
}) {
  const Icon = value.icon;
  const title = locale === "fr" ? value.titleFr : value.titleEn;
  const subtitle = locale === "fr" ? value.subtitleFr : value.subtitleEn;
  const description =
    locale === "fr" ? value.descriptionFr : value.descriptionEn;
  const features = locale === "fr" ? value.featuresFr : value.featuresEn;

  return (
    <div
      className="bg-card rounded-3xl p-6 lg:p-8 shadow-lg hover:shadow-xl transition-all duration-300 animate-fade-in-up"
      style={{ animationDelay: `${index * 0.15}s` }}
    >
      {/* Icon and Title */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-foreground rounded-2xl shrink-0">
          <Icon className="w-6 h-6 text-card" strokeWidth={2} />
        </div>
        <h3 className="text-lg md:text-xl font-serif font-medium text-foreground leading-tight">
          {title}
        </h3>
      </div>

      {/* Subtitle */}
      {subtitle && (
        <p className="text-base font-semibold text-foreground mb-4">
          {subtitle}
        </p>
      )}

      {/* Description */}
      <p className="text-sm md:text-base text-muted-foreground mb-6 leading-relaxed whitespace-pre-line">
        {description}
      </p>

      {/* Features List - Simple bullets */}
      {features.length > 0 && (
        <ul className="space-y-4">
          {features.map((feature, i) => (
            <li
              key={i}
              className="flex items-center gap-2 text-sm text-card-foreground"
            >
              <span className="w-1.5 h-1.5 bg-foreground rounded-full"></span>
              <span className="leading-relaxed">{feature}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
