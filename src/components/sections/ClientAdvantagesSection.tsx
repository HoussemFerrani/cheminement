"use client";

import { useTranslations } from "next-intl";
import Image from "next/image";
import {
  Brain,
  CheckCircle,
  GraduationCap,
  HandHeart,
  HeartPulse,
  Shield,
  Stethoscope,
  UserRound,
  Users,
  Video,
  AlertCircle,
  Flame,
  Zap,
  Heart,
  Sparkles,
  BookOpen,
  Baby,
  Smile,
  MoreHorizontal,
  Clock,
  UserCheck,
  Zap as ZapIcon,
  Network,
  MapPin,
} from "lucide-react";
import ScrollReveal from "@/components/ui/ScrollReveal";
import type { AnimationVariant } from "@/components/ui/ScrollReveal";

export default function ClientAdvantagesSection() {
  const t = useTranslations("ClientAdvantagesSection");
  const tQuick = useTranslations("QuickAccess");
  const tHero = useTranslations("HeroSection");

  // Mapping des topics aux icônes
  const topicIcons: Record<
    string,
    React.ComponentType<{ className?: string }>
  > = {
    // Français
    Anxiété: AlertCircle,
    Épuisement: Flame,
    Stress: Zap,
    Dépression: Heart,
    "Estime de soi": Sparkles,
    TDAH: Brain,
    HPI: Sparkles,
    "rôle parental": Baby,
    "difficultés d'apprentissage": BookOpen,
    "gestion des émotions": Smile,
    "autres problématiques": MoreHorizontal,
    // Anglais
    Anxiety: AlertCircle,
    Burnout: Flame,
    Depression: Heart,
    "Self-esteem": Sparkles,
    ADHD: Brain,
    "High Intellectual Potential": Sparkles,
    "parenting role": Baby,
    "learning difficulties": BookOpen,
    "emotion management": Smile,
    "other issues": MoreHorizontal,
  };

  const professionals = [
    {
      titleKey: "professionals.psychologist",
      icon: UserRound,
      image: "/professionals/psychologist.jpg",
    },
    {
      titleKey: "professionals.neuropsychologist",
      icon: Brain,
      image: "/professionals/neuropsychologist.jpg",
    },
    {
      titleKey: "professionals.psychotherapist",
      icon: HeartPulse,
      image: "/professionals/psychotherapist.jpg",
    },
    {
      titleKey: "professionals.psychoeducator",
      icon: GraduationCap,
      image: "/professionals/psychoeducator.jpg",
    },
    {
      titleKey: "professionals.occupationalTherapistMentalHealth",
      icon: HandHeart,
      image: "/professionals/occupational-therapist.jpg",
    },
    {
      titleKey: "professionals.psychiatrist",
      icon: Stethoscope,
      image: "/professionals/psychiatrist.jpg",
    },
    {
      titleKey: "professionals.otherProfessionals",
      icon: Users,
      image: "/professionals/other-professionals.jpg",
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
    <section className="relative py-24 bg-linear-to-b from-muted via-card to-background overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-40 right-20 w-96 h-96 bg-accent rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 left-10 w-64 h-64 bg-primary rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        {/* Section Vos avantages – même design et typographie que QuickAccessSection (en bas du site) */}
        <ScrollReveal variant="fade-down" duration={700}>
          <div className="text-center mb-16">
            <div className="mb-4">
              <p className="text-sm md:text-base tracking-[0.3em] uppercase text-muted-foreground font-light mb-2">
                {tQuick("badge")}
              </p>
              <div className="w-32 h-0.5 bg-muted-foreground mx-auto" />
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-light text-foreground mb-6">
              {tQuick("title")}
            </h2>
            <p className="text-base md:text-lg lg:text-xl text-muted-foreground max-w-3xl mx-auto font-light leading-relaxed">
              {tQuick("subtitle")}
            </p>
          </div>
        </ScrollReveal>

        {/* Bloc unifié : cartes + image (style QuickAccessSection) */}
        <ScrollReveal variant="fade-up" delayMs={150} duration={700}>
          <div className="mb-20 max-w-6xl mx-auto">
            {/* Ligne 1 : Carte 1 | Image | Carte 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch mb-8">
              <div className="p-8 rounded-xl bg-card/50 backdrop-blur-sm hover:bg-card transition-all duration-300 text-center">
                <div className="mb-4 flex justify-center">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    <Clock className="w-6 h-6" />
                  </div>
                </div>
                <h3 className="text-xl font-light text-foreground mb-3">
                  {tQuick("findHelp")}
                </h3>
                <p className="text-muted-foreground leading-relaxed font-light">
                  {tQuick("findHelpDesc")}
                </p>
              </div>

              <div className="relative rounded-2xl overflow-hidden shadow-xl aspect-[4/3] min-h-[240px] group">
                <Image
                  src="/avantages.png"
                  alt="Vos avantages"
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                  sizes="(max-width: 1024px) 100vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>

              <div className="p-8 rounded-xl bg-card/50 backdrop-blur-sm hover:bg-card transition-all duration-300 text-center">
                <div className="mb-4 flex justify-center">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    <MapPin className="w-6 h-6" />
                  </div>
                </div>
                <h3 className="text-xl font-light text-foreground mb-3">
                  {tQuick("accessAnywhere")}
                </h3>
                <p className="text-muted-foreground leading-relaxed font-light">
                  {tQuick("accessAnywhereDesc")}
                </p>
              </div>
            </div>

            {/* Ligne 2 : Carte 3 (même style que les autres cartes QuickAccess) */}
            <div className="flex justify-center">
              <div className="w-full max-w-2xl p-8 rounded-xl bg-card/50 backdrop-blur-sm hover:bg-card transition-all duration-300 text-center">
                <div className="mb-4 flex justify-center">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    <BookOpen className="w-6 h-6" />
                  </div>
                </div>
                <h3 className="text-xl font-light text-foreground mb-3">
                  {tQuick("startJourney")}
                </h3>
                <p className="text-muted-foreground leading-relaxed font-light">
                  {tQuick("startJourneyDesc")}
                </p>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* Educational Content Highlight */}
        <ScrollReveal variant="slide-left" delayMs={400} duration={800}>
          <div className="bg-linear-to-br from-accent/20 via-accent/10 to-transparent rounded-3xl p-8 md:p-12 mb-24 max-w-5xl mx-auto">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="shrink-0">
                <div className="p-6 bg-foreground rounded-3xl">
                  <Video
                    className="w-12 h-12 text-background"
                    strokeWidth={1.5}
                  />
                </div>
              </div>
              <div className="text-center md:text-left">
                <h3 className="text-2xl md:text-3xl font-serif font-bold text-foreground mb-4">
                  {t("educationalHighlight.title")}
                </h3>
                <p className="text-lg text-muted-foreground leading-relaxed mb-4">
                  {t("educationalHighlight.description")}
                </p>
                {/* Topics List with Icons */}
                <div className="mb-4">
                  <ul className="flex flex-wrap gap-3 mb-2">
                    {t("educationalHighlight.topics")
                      .split(",")
                      .map((topic: string) => topic.trim())
                      .filter((topic: string) => topic.length > 0)
                      .map((topic: string, index: number) => {
                        const IconComponent =
                          topicIcons[topic] || MoreHorizontal;
                        return (
                          <li
                            key={index}
                            className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/5 rounded-full border border-primary/20 hover:border-primary/40 hover:bg-primary/10 transition-all duration-200"
                          >
                            <div className="p-1 bg-primary/10 rounded-full">
                              <IconComponent className="w-3.5 h-3.5 text-primary shrink-0" />
                            </div>
                            <span className="text-sm text-foreground/80 font-medium">
                              {topic}
                            </span>
                          </li>
                        );
                      })}
                  </ul>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {t("educationalHighlight.note")}
                </p>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* Professionals Section */}
        <ScrollReveal variant="fade-up" delayMs={500} duration={700}>
          <div className="text-center mb-12">
            <h3 className="text-2xl md:text-3xl lg:text-4xl font-serif font-bold text-foreground mb-4">
              {t("professionalsSection.title")}
            </h3>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t("professionalsSection.subtitle")}
            </p>
          </div>
        </ScrollReveal>

        {/* Professionals Grid with Photos */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-4 md:gap-6 max-w-6xl mx-auto">
          {professionals.map((professional, index) => (
            <ScrollReveal
              key={index}
              variant="zoom-in"
              delayMs={600 + index * 80}
              duration={500}
            >
              <div className="group relative">
                <div className="relative aspect-3/4 rounded-2xl overflow-hidden bg-muted shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:-translate-y-2">
                  {/* Placeholder image - replace with actual professional photos */}
                  <div className="absolute inset-0 bg-linear-to-br from-primary/20 via-accent/40 to-primary/10 flex items-center justify-center">
                    <div className="p-4 bg-primary/10 rounded-2xl backdrop-blur-sm border border-primary/20">
                      <professional.icon
                        className="w-10 h-10 text-primary"
                        strokeWidth={2}
                      />
                    </div>
                  </div>
                  {/* Gradient overlay at bottom */}
                  <div className="absolute inset-x-0 bottom-0 h-1/2 bg-linear-to-t from-primary/95 via-primary/80 to-transparent"></div>
                  <div className="absolute inset-x-0 bottom-0 h-16 md:h-20 flex items-center justify-center p-2 md:p-3">
                    <h4 className="text-[9px] sm:text-[10px] md:text-[11px] lg:text-xs font-semibold text-white text-center leading-tight drop-shadow-lg break-words max-w-full px-0.5">
                      {t(professional.titleKey)}
                    </h4>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>

        {/* Trust Indicators */}
        <ScrollReveal variant="bounce-in" delayMs={900} duration={700}>
          <div className="mt-16 flex flex-wrap items-center justify-center gap-8 text-muted-foreground">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-primary" />
              <span className="text-sm">{t("trustIndicators.licensed")}</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-primary" />
              <span className="text-sm">{t("trustIndicators.supervised")}</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-primary" />
              <span className="text-sm">
                {t("trustIndicators.confidential")}
              </span>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
