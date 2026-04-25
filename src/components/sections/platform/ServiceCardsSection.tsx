"use client";

import { useState } from "react";
import {
  Scale,
  Brain,
  Heart,
  Sparkles,
  MessageCircle,
  Calendar,
  Users,
  BookOpen,
  Target,
  AlertCircle,
  ArrowRight,
} from "lucide-react";
import { useTranslations } from "next-intl";
import ScrollReveal from "@/components/ui/ScrollReveal";
import type { AnimationVariant } from "@/components/ui/ScrollReveal";

type Service = {
  id: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  titleKey: string;
  descriptionKey: string;
  color: string;
  bgGradient: string;
};

const services: Service[] = [
  {
    id: "eap",
    icon: Scale,
    titleKey: "eap.title",
    descriptionKey: "eap.description",
    color: "from-[#d4a574] to-[#c09564]",
    bgGradient: "from-[#f5e6d3] via-[#fad4d4] to-[#f5ebe0]",
  },
  {
    id: "mental-health",
    icon: Brain,
    titleKey: "mentalHealth.title",
    descriptionKey: "mentalHealth.description",
    color: "from-blue-500 to-purple-600",
    bgGradient: "from-[#d4e8f0] via-[#e8f4f8] to-[#bde3f0]",
  },
  {
    id: "primary-care",
    icon: Heart,
    titleKey: "primaryCare.title",
    descriptionKey: "primaryCare.description",
    color: "from-red-500 to-pink-600",
    bgGradient: "from-[#fef5f5] via-[#ffe8e8] to-[#ffd4d4]",
  },
  {
    id: "wellness",
    icon: Sparkles,
    titleKey: "wellness.title",
    descriptionKey: "wellness.description",
    color: "from-green-400 to-emerald-600",
    bgGradient: "from-[#f0fdf4] via-[#dcfce7] to-[#bbf7d0]",
  },
];

export default function ServiceCardsSection() {
  const t = useTranslations("Platform.services");
  const [selectedService, setSelectedService] = useState<Service>(services[0]);

  return (
    <section className="relative overflow-hidden bg-background py-24">
      <div className="absolute inset-0 opacity-[0.05]">
        <div className="absolute left-10 top-0 h-72 w-72 rounded-full bg-accent blur-3xl" />
        <div className="absolute right-0 bottom-0 h-104 w-104 translate-x-1/3 translate-y-1/4 rounded-full bg-primary/40 blur-3xl" />
      </div>

      <div className="container relative z-10 mx-auto px-6">
        <div className="mx-auto max-w-5xl text-center">
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
            <p className="mt-6 mx-auto max-w-3xl text-lg leading-relaxed text-muted-foreground">
              {t("subtitle")}
            </p>
          </ScrollReveal>
        </div>

        {/* Service Cards Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 max-w-5xl mx-auto mt-16 mb-20">
          {services.map((service, index) => {
            const Icon = service.icon;
            const isSelected = selectedService.id === service.id;
            const cardAnimations: AnimationVariant[] = [
              "fade-right",
              "zoom-in",
              "fade-left",
              "slide-up",
            ];
            return (
              <ScrollReveal
                key={service.id}
                variant={cardAnimations[index % cardAnimations.length]}
                delayMs={400 + index * 100}
                duration={700}
              >
                <button
                  onClick={() => setSelectedService(service)}
                  className={`
                    relative p-6 rounded-4xl transition-all duration-300 text-center w-full
                    ${
                      isSelected
                        ? "bg-foreground text-primary-foreground shadow-xl scale-105"
                        : "bg-card border-2 border-border/15 hover:border-foreground hover:shadow-lg"
                    }
                  `}
                >
                  <div className="mb-4 flex justify-center">
                    <Icon
                      className={`w-8 h-8 ${isSelected ? "text-primary-foreground" : "text-foreground"}`}
                      strokeWidth={2}
                    />
                  </div>
                  <h3
                    className={`text-base md:text-lg font-serif font-bold leading-snug ${isSelected ? "text-primary-foreground" : "text-foreground"}`}
                  >
                    {t(service.titleKey)}
                  </h3>
                </button>
              </ScrollReveal>
            );
          })}
        </div>

        {/* Selected Service Detail */}
        <ScrollReveal variant="slide-up" delayMs={800} duration={800}>
          <div className="max-w-7xl mx-auto">
            <div
              key={selectedService.id}
              className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center animate-fade-in-up"
            >
              {/* Visual Design */}
              <div className="relative order-2 lg:order-1">
                <ServiceVisual service={selectedService} t={t} />
              </div>

              {/* Content */}
              <div className="order-1 lg:order-2">
                <div className="flex items-center gap-3 mb-8">
                  <div className="p-3 bg-foreground rounded-2xl">
                    <selectedService.icon
                      className="w-8 h-8 text-background"
                      strokeWidth={2}
                    />
                  </div>
                </div>

                <h3 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-8">
                  {t(selectedService.titleKey)}
                </h3>

                <p className="text-lg text-muted-foreground leading-relaxed mb-8">
                  {t(selectedService.descriptionKey)}
                </p>

                <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-foreground cursor-pointer hover:gap-4 transition-all">
                  <span>{t("learnMore")}</span>
                  <ArrowRight className="h-4 w-4" />
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}

function ServiceVisual({
  service,
  t,
}: {
  service: Service;
  t: (key: string) => string;
}) {
  switch (service.id) {
    case "eap":
      return <EAPDesign t={t} />;
    case "mental-health":
      return <MentalHealthDesign t={t} />;
    case "primary-care":
      return <PrimaryCareDesign t={t} />;
    case "wellness":
      return <WellnessDesign t={t} />;
    default:
      return null;
  }
}

function EAPDesign({ t }: { t: (key: string) => string }) {
  return (
    <div className="relative w-full max-w-md mx-auto min-h-[500px] flex items-center justify-center">
      <div className="absolute inset-0 bg-linear-to-br from-[#f5e6d3] via-[#fad4d4] to-[#f5ebe0] rounded-4xl opacity-40 blur-3xl"></div>

      <div className="relative z-10 w-full space-y-6">
        <div className="bg-white rounded-3xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 ml-12">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gray-900 rounded-xl flex items-center justify-center">
              <MessageCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h4 className="font-bold text-lg text-gray-900">
                {t("cards.eap.startConsultation")}
              </h4>
              <p className="text-sm text-gray-600">
                {t("cards.eap.speakProfessional")}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 mr-12">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-12 h-12 bg-gray-900 rounded-xl flex items-center justify-center shrink-0">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <div>
              <h4 className="font-bold text-lg text-gray-900 mb-2">
                {t("cards.eap.appointmentConfirmed")}
              </h4>
            </div>
          </div>
          <button className="w-full bg-gray-900 text-white text-sm font-semibold py-3 rounded-full hover:bg-gray-800 transition-colors">
            {t("cards.eap.goToChat")}
          </button>
        </div>

        <div className="bg-linear-to-br from-[#fff5f0] to-[#ffe8e0] rounded-3xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="font-bold text-base text-gray-900 mb-1">
                {t("cards.eap.carePlans")}
              </h4>
              <p className="text-xs text-gray-600">
                {t("cards.eap.noCarePlans")}
              </p>
            </div>
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
              <Heart className="w-5 h-5 text-[#d4a574]" />
            </div>
          </div>
          <button className="bg-[#d4a574] text-white text-xs font-semibold px-6 py-2.5 rounded-full hover:bg-[#c09564] transition-colors">
            {t("cards.eap.getCare")}
          </button>
        </div>
      </div>
    </div>
  );
}

function MentalHealthDesign({ t }: { t: (key: string) => string }) {
  return (
    <div className="relative w-full max-w-md mx-auto min-h-[500px] flex items-center justify-center">
      <div className="absolute inset-0 bg-linear-to-br from-[#d4e8f0] via-[#e8f4f8] to-[#bde3f0] rounded-4xl opacity-40 blur-3xl"></div>

      <div className="relative z-10 w-full space-y-6">
        <div className="bg-white rounded-3xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 mr-8">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 bg-linear-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shrink-0">
              <Brain className="w-7 h-7 text-white" />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-lg text-gray-900 mb-2">
                {t("cards.mentalHealth.videoSessionAvailable")}
              </h4>
              <p className="text-sm text-gray-600 mb-3">
                {t("cards.mentalHealth.therapistReady")}
              </p>
              <div className="flex items-center gap-2 text-xs text-blue-600 font-semibold">
                <span className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></span>
                <span>{t("cards.mentalHealth.onlineNow")}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-linear-to-br from-blue-50 to-purple-50 rounded-3xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 ml-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-linear-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
              <Target className="w-6 h-6 text-white" />
            </div>
            <div>
              <h4 className="font-bold text-base text-gray-900">
                {t("cards.mentalHealth.yourProgress")}
              </h4>
              <p className="text-xs text-gray-600">
                {t("cards.mentalHealth.weekOfTreatment")}
              </p>
            </div>
          </div>
          <div className="space-y-2 mb-3">
            <div className="flex justify-between text-xs">
              <span className="text-gray-600">
                {t("cards.mentalHealth.moodTracking")}
              </span>
              <span className="font-bold text-blue-600">85%</span>
            </div>
            <div className="w-full bg-blue-200 rounded-full h-2">
              <div
                className="bg-linear-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                style={{ width: "85%" }}
              ></div>
            </div>
          </div>
          <button className="w-full bg-linear-to-r from-blue-600 to-purple-600 text-white text-xs font-semibold py-2.5 rounded-lg hover:shadow-lg transition-shadow">
            {t("cards.mentalHealth.viewFullReport")}
          </button>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-gray-900">
                  {t("cards.mentalHealth.selfHelpResources")}
                </h4>
                <p className="text-xs text-gray-600">
                  {t("cards.mentalHealth.newGuides")}
                </p>
              </div>
            </div>
          </div>
          <button className="bg-blue-100 text-blue-700 text-xs font-semibold px-5 py-2 rounded-full hover:bg-blue-200 transition-colors">
            {t("cards.mentalHealth.browseLibrary")}
          </button>
        </div>
      </div>
    </div>
  );
}

function PrimaryCareDesign({ t }: { t: (key: string) => string }) {
  return (
    <div className="relative w-full max-w-md mx-auto min-h-[500px] flex items-center justify-center">
      <div className="absolute inset-0 bg-linear-to-br from-[#fef5f5] via-[#ffe8e8] to-[#ffd4d4] rounded-4xl opacity-40 blur-3xl"></div>

      <div className="relative z-10 w-full space-y-6">
        <div className="bg-white rounded-3xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 ml-10">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center shrink-0">
              <Heart className="w-7 h-7 text-red-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-lg text-gray-900 mb-2">
                {t("cards.primaryCare.doctorAvailable")}
              </h4>
              <p className="text-sm text-gray-600 mb-3">
                {t("cards.primaryCare.doctorReady")}
              </p>
              <div className="flex items-center gap-2 text-xs text-red-600 font-semibold">
                <span className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></span>
                <span>{t("cards.primaryCare.availableForConsultation")}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-linear-to-br from-red-50 to-pink-50 rounded-3xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 mr-10">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-red-600 rounded-xl flex items-center justify-center">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <div>
              <h4 className="font-bold text-base text-gray-900">
                {t("cards.primaryCare.appointmentScheduled")}
              </h4>
              <p className="text-xs text-gray-600">
                {t("cards.primaryCare.tomorrowTime")}
              </p>
            </div>
          </div>
          <div className="space-y-2 mb-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">
                {t("cards.primaryCare.doctorName")}
              </span>
              <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full font-semibold">
                {t("cards.primaryCare.inPerson")}
              </span>
            </div>
            <p className="text-xs text-gray-600">
              {t("cards.primaryCare.checkupType")}
            </p>
          </div>
          <button className="w-full bg-red-600 text-white text-xs font-semibold py-2.5 rounded-lg hover:bg-red-700 transition-colors">
            {t("cards.primaryCare.viewDetails")}
          </button>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-gray-900">
                  {t("cards.primaryCare.prescriptionReady")}
                </h4>
                <p className="text-xs text-gray-600">
                  {t("cards.primaryCare.availableAtPharmacy")}
                </p>
              </div>
            </div>
          </div>
          <button className="bg-red-100 text-red-700 text-xs font-semibold px-5 py-2 rounded-full hover:bg-red-200 transition-colors">
            {t("cards.primaryCare.viewPrescription")}
          </button>
        </div>
      </div>
    </div>
  );
}

function WellnessDesign({ t }: { t: (key: string) => string }) {
  return (
    <div className="relative w-full max-w-md mx-auto min-h-[500px] flex items-center justify-center">
      <div className="absolute inset-0 bg-linear-to-br from-[#f0fdf4] via-[#dcfce7] to-[#bbf7d0] rounded-4xl opacity-40 blur-3xl"></div>

      <div className="relative z-10 w-full space-y-6">
        <div className="bg-white rounded-3xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 mr-10">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-linear-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center shrink-0">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-bold text-base text-gray-900">
                  {t("cards.wellness.dailyWellnessGoals")}
                </h4>
                <span className="text-base">🔥</span>
              </div>
              <p className="text-sm text-gray-600">
                {t("cards.wellness.trackActivities")}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-linear-to-br from-green-50 to-emerald-50 rounded-3xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 ml-10">
          <div className="flex items-center gap-4 mb-3">
            <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h4 className="font-bold text-base text-gray-900">
                {t("cards.wellness.lifestyleCoaching")}
              </h4>
              <p className="text-xs text-gray-600">
                {t("cards.wellness.personalizedGuidance")}
              </p>
            </div>
          </div>
          <button className="w-full bg-green-600 text-white text-xs font-semibold py-2.5 rounded-lg hover:bg-green-700 transition-colors">
            {t("cards.wellness.bookCoachSession")}
          </button>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <Target className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-gray-900">
                  {t("cards.wellness.activityPrograms")}
                </h4>
                <p className="text-xs text-gray-600">
                  {t("cards.wellness.yogaFitness")}
                </p>
              </div>
            </div>
          </div>
          <button className="bg-green-100 text-green-700 text-xs font-semibold px-5 py-2 rounded-full hover:bg-green-200 transition-colors">
            {t("cards.wellness.viewSchedule")}
          </button>
        </div>
      </div>
    </div>
  );
}
