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
} from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import ScrollReveal from "@/components/ui/ScrollReveal";
import type { AnimationVariant } from "@/components/ui/ScrollReveal";

export default function ServiceSection() {
  const t = useTranslations("ServiceSection");
  const locale = useLocale();

  const services = [
    {
      id: "eap",
      icon: Scale,
      titleEn: "Employee Assistance Program",
      titleFr: "Programme d'aide aux employés",
      highlighted: true,
      descriptionEn:
        "Outdated, fragmented, slow. This should not describe your EAP. Reimagined to answer the needs of today's organizations, our EAP gives you peace of mind knowing that your employees have easy access to the right support, at a time that works for them.",
      descriptionFr:
        "Dépassé, fragmenté, lent. Cela ne devrait pas décrire votre PAE. Réinventé pour répondre aux besoins des organisations d'aujourd'hui, notre PAE vous donne la tranquillité d'esprit en sachant que vos employés ont facilement accès au bon soutien, au moment qui leur convient.",
    },
    {
      id: "mental-health",
      icon: Brain,
      titleEn: "Mental Health+",
      titleFr: "Santé mentale+",
      highlighted: false,
      descriptionEn:
        "Outdated, fragmented, slow. This should not describe your mental health support. Reimagined to answer the needs of today's organizations, our Mental Health+ programs give you peace of mind knowing that your employees have easy access to comprehensive support connecting them with qualified professionals for assessments, therapy, and ongoing care, at a time that works for them.",
      descriptionFr:
        "Dépassé, fragmenté, lent. Cela ne devrait pas décrire votre soutien en santé mentale. Réinventé pour répondre aux besoins des organisations d'aujourd'hui, nos programmes Santé mentale+ vous donnent la tranquillité d'esprit en sachant que vos employés ont facilement accès à un soutien complet les mettant en contact avec des professionnels qualifiés pour des évaluations, une thérapie et des soins continus, au moment qui leur convient.",
    },
    {
      id: "primary-care",
      icon: Heart,
      titleEn: "Primary Care",
      titleFr: "Soins primaires",
      highlighted: false,
      descriptionEn:
        "Outdated, fragmented, slow. This should not describe your primary care access. Reimagined to answer the needs of today's organizations, our primary care services give you peace of mind knowing that your employees have easy access to physicians for general health concerns, preventive care, and medical consultations, at a time that works for them.",
      descriptionFr:
        "Dépassé, fragmenté, lent. Cela ne devrait pas décrire votre accès aux soins primaires. Réinventés pour répondre aux besoins des organisations d'aujourd'hui, nos services de soins primaires vous donnent la tranquillité d'esprit en sachant que vos employés ont facilement accès à des médecins pour des préoccupations de santé générales, des soins préventifs et des consultations médicales, au moment qui leur convient.",
    },
    {
      id: "wellness",
      icon: Sparkles,
      titleEn: "Wellness",
      titleFr: "Bien-être",
      highlighted: false,
      descriptionEn:
        "Outdated, fragmented, slow. This should not describe your wellness programs. Reimagined to answer the needs of today's organizations, our wellness programs give you peace of mind knowing that your employees have easy access to holistic support for nutrition, fitness, and lifestyle coaching, at a time that works for them.",
      descriptionFr:
        "Dépassé, fragmenté, lent. Cela ne devrait pas décrire vos programmes de bien-être. Réinventés pour répondre aux besoins des organisations d'aujourd'hui, nos programmes de bien-être vous donnent la tranquillité d'esprit en sachant que vos employés ont facilement accès à un soutien holistique pour la nutrition, la forme physique et le coaching de style de vie, au moment qui leur convient.",
    },
  ];

  const [selectedService, setSelectedService] = useState(services[0]);

  return (
    <section className="relative pt-12 bg-linear-to-b from-muted via-card to-background overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-40 right-20 w-96 h-96 bg-accent rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-24">
          <ScrollReveal variant="blur-in" duration={700}>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-foreground mb-6">
              {t("title")}
            </h2>
          </ScrollReveal>
          <ScrollReveal variant="fade-up" delayMs={150} duration={600}>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              {t("subtitle")}
              <br />
              {t("subtitleLine2")}
            </p>
          </ScrollReveal>
        </div>

        {/* Service Cards Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 max-w-5xl mx-auto mb-32">
          {services.map((service, index) => {
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
                delayMs={250 + index * 100}
                duration={700}
              >
                <ServiceCard
                  service={service}
                  index={index}
                  isSelected={selectedService.id === service.id}
                  onClick={() => setSelectedService(service)}
                />
              </ScrollReveal>
            );
          })}
        </div>

        {/* Selected Service Detail Section */}
        <ScrollReveal variant="slide-up" delayMs={650} duration={800}>
          <div className="max-w-7xl mx-auto mb-20">
            <div
              key={selectedService.id}
              className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center animate-fade-in-up"
            >
              {/* Visual Design */}
              <div className="relative order-2 lg:order-1">
                {selectedService.id === "eap" && <EAPDesign t={t} />}
                {selectedService.id === "mental-health" && (
                  <MentalHealthDesign t={t} />
                )}
                {selectedService.id === "primary-care" && (
                  <PrimaryCareDesign t={t} />
                )}
                {selectedService.id === "wellness" && <WellnessDesign t={t} />}
              </div>

              {/* Content */}
              <div className="order-1 lg:order-2">
                <div className="flex items-center gap-3 mb-8">
                  <div className="p-3 bg-foreground rounded-lg">
                    <selectedService.icon
                      className="w-8 h-8 text-background"
                      strokeWidth={2}
                    />
                  </div>
                </div>

                <h3 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-8">
                  {locale === "fr"
                    ? selectedService.titleFr
                    : selectedService.titleEn}
                </h3>

                <p className="text-lg text-muted-foreground leading-relaxed mb-8">
                  {locale === "fr"
                    ? selectedService.descriptionFr
                    : selectedService.descriptionEn}
                </p>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}

// EAP Design - Floating Cards Interface (inspired by consultation cards)
function EAPDesign({ t }: { t: (key: string) => string }) {
  return (
    <div className="relative w-full max-w-md mx-auto min-h-[500px] flex items-center justify-center">
      {/* Background gradient blob */}
      <div className="absolute inset-0 bg-linear-to-br from-[#f5e6d3] via-[#fad4d4] to-[#f5ebe0] rounded-3xl opacity-40 blur-3xl"></div>

      <div className="relative z-10 w-full space-y-6">
        {/* Start Consultation Card */}
        <div className="bg-white rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 ml-12">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gray-900 rounded-xl flex items-center justify-center">
              <MessageCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h4 className="font-bold text-lg text-gray-900">
                {t("services.eap.startConsultation")}
              </h4>
              <p className="text-sm text-gray-600">
                {t("services.eap.speakProfessional")}
              </p>
            </div>
          </div>
        </div>

        {/* Appointment Confirmation Card */}
        <div className="bg-white rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 mr-12">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-12 h-12 bg-gray-900 rounded-xl flex items-center justify-center shrink-0">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <div>
              <h4 className="font-bold text-lg text-gray-900 mb-2">
                {t("services.eap.appointmentConfirmed")}
              </h4>
            </div>
          </div>
          <button className="w-full bg-gray-900 text-white text-sm font-semibold py-3 rounded-full hover:bg-gray-800 transition-colors">
            {t("services.eap.goToChat")}
          </button>
        </div>

        {/* Care Plans Card */}
        <div className="bg-linear-to-br from-[#fff5f0] to-[#ffe8e0] rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="font-bold text-base text-gray-900 mb-1">
                {t("services.eap.carePlans")}
              </h4>
              <p className="text-xs text-gray-600">
                {t("services.eap.noCarePlans")}
              </p>
            </div>
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
              <Heart className="w-5 h-5 text-[#d4a574]" />
            </div>
          </div>
          <button className="bg-[#d4a574] text-white text-xs font-semibold px-6 py-2.5 rounded-full hover:bg-[#c09564] transition-colors">
            {t("services.eap.getCare")}
          </button>
        </div>
      </div>
    </div>
  );
}

// Mental Health Design - Floating Cards Interface
function MentalHealthDesign({ t }: { t: (key: string) => string }) {
  return (
    <div className="relative w-full max-w-md mx-auto min-h-[500px] flex items-center justify-center">
      {/* Background gradient blob */}
      <div className="absolute inset-0 bg-linear-to-br from-[#d4e8f0] via-[#e8f4f8] to-[#bde3f0] rounded-3xl opacity-40 blur-3xl"></div>

      <div className="relative z-10 w-full space-y-6">
        {/* Therapist Session Card */}
        <div className="bg-white rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 mr-8">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 bg-linear-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shrink-0">
              <Brain className="w-7 h-7 text-white" />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-lg text-gray-900 mb-2">
                {t("services.mentalHealth.videoSessionAvailable")}
              </h4>
              <p className="text-sm text-gray-600 mb-3">
                {t("services.mentalHealth.therapistReady")}
              </p>
              <div className="flex items-center gap-2 text-xs text-blue-600 font-semibold">
                <span className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></span>
                <span>{t("services.mentalHealth.onlineNow")}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Tracking Card */}
        <div className="bg-linear-to-br from-blue-50 to-purple-50 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 ml-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-linear-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
              <Target className="w-6 h-6 text-white" />
            </div>
            <div>
              <h4 className="font-bold text-base text-gray-900">
                {t("services.mentalHealth.yourProgress")}
              </h4>
              <p className="text-xs text-gray-600">
                {t("services.mentalHealth.weekOfTreatment")}
              </p>
            </div>
          </div>
          <div className="space-y-2 mb-3">
            <div className="flex justify-between text-xs">
              <span className="text-gray-600">
                {t("services.mentalHealth.moodTracking")}
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
            {t("services.mentalHealth.viewFullReport")}
          </button>
        </div>

        {/* Resources Card */}
        <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-gray-900">
                  {t("services.mentalHealth.selfHelpResources")}
                </h4>
                <p className="text-xs text-gray-600">
                  {t("services.mentalHealth.newGuides")}
                </p>
              </div>
            </div>
          </div>
          <button className="bg-blue-100 text-blue-700 text-xs font-semibold px-5 py-2 rounded-full hover:bg-blue-200 transition-colors">
            {t("services.mentalHealth.browseLibrary")}
          </button>
        </div>
      </div>
    </div>
  );
}

// Primary Care Design - Floating Cards Interface
function PrimaryCareDesign({ t }: { t: (key: string) => string }) {
  return (
    <div className="relative w-full max-w-md mx-auto min-h-[500px] flex items-center justify-center">
      {/* Background gradient blob */}
      <div className="absolute inset-0 bg-linear-to-br from-[#fef5f5] via-[#ffe8e8] to-[#ffd4d4] rounded-3xl opacity-40 blur-3xl"></div>

      <div className="relative z-10 w-full space-y-6">
        {/* Doctor Availability Card */}
        <div className="bg-white rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 ml-10">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center shrink-0">
              <Heart className="w-7 h-7 text-red-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-lg text-gray-900 mb-2">
                {t("services.primaryCare.doctorAvailable")}
              </h4>
              <p className="text-sm text-gray-600 mb-3">
                {t("services.primaryCare.doctorReady")}
              </p>
              <div className="flex items-center gap-2 text-xs text-red-600 font-semibold">
                <span className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></span>
                <span>
                  {t("services.primaryCare.availableForConsultation")}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Appointment Confirmed Card */}
        <div className="bg-linear-to-br from-red-50 to-pink-50 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 mr-10">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-red-600 rounded-xl flex items-center justify-center">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <div>
              <h4 className="font-bold text-base text-gray-900">
                {t("services.primaryCare.appointmentScheduled")}
              </h4>
              <p className="text-xs text-gray-600">
                {t("services.primaryCare.tomorrowTime")}
              </p>
            </div>
          </div>
          <div className="space-y-2 mb-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">
                {t("services.primaryCare.doctorName")}
              </span>
              <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full font-semibold">
                {t("services.primaryCare.inPerson")}
              </span>
            </div>
            <p className="text-xs text-gray-600">
              {t("services.primaryCare.checkupType")}
            </p>
          </div>
          <button className="w-full bg-red-600 text-white text-xs font-semibold py-2.5 rounded-lg hover:bg-red-700 transition-colors">
            {t("services.primaryCare.viewDetails")}
          </button>
        </div>

        {/* Prescription Ready Card */}
        <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-gray-900">
                  {t("services.primaryCare.prescriptionReady")}
                </h4>
                <p className="text-xs text-gray-600">
                  {t("services.primaryCare.availableAtPharmacy")}
                </p>
              </div>
            </div>
          </div>
          <button className="bg-red-100 text-red-700 text-xs font-semibold px-5 py-2 rounded-full hover:bg-red-200 transition-colors">
            {t("services.primaryCare.viewPrescription")}
          </button>
        </div>
      </div>
    </div>
  );
}

// Wellness Design - Floating Cards Interface
function WellnessDesign({ t }: { t: (key: string) => string }) {
  return (
    <div className="relative w-full max-w-md mx-auto min-h-[500px] flex items-center justify-center">
      {/* Background gradient blob */}
      <div className="absolute inset-0 bg-linear-to-br from-[#f0fdf4] via-[#dcfce7] to-[#bbf7d0] rounded-3xl opacity-40 blur-3xl"></div>

      <div className="relative z-10 w-full space-y-6">
        {/* Wellness Challenge Card */}
        <div className="bg-white rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 mr-10">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-linear-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center shrink-0">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-bold text-base text-gray-900">
                  {t("services.wellness.dailyWellnessGoals")}
                </h4>
                <span className="text-base">🔥</span>
              </div>
              <p className="text-sm text-gray-600">
                {t("services.wellness.trackActivities")}
              </p>
            </div>
          </div>
        </div>

        {/* Coaching Card */}
        <div className="bg-linear-to-br from-green-50 to-emerald-50 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 ml-10">
          <div className="flex items-center gap-4 mb-3">
            <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h4 className="font-bold text-base text-gray-900">
                {t("services.wellness.lifestyleCoaching")}
              </h4>
              <p className="text-xs text-gray-600">
                {t("services.wellness.personalizedGuidance")}
              </p>
            </div>
          </div>
          <button className="w-full bg-green-600 text-white text-xs font-semibold py-2.5 rounded-lg hover:bg-green-700 transition-colors">
            {t("services.wellness.bookCoachSession")}
          </button>
        </div>

        {/* Activity Tracker Card */}
        <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <Target className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-gray-900">
                  {t("services.wellness.activityPrograms")}
                </h4>
                <p className="text-xs text-gray-600">
                  {t("services.wellness.yogaFitness")}
                </p>
              </div>
            </div>
          </div>
          <button className="bg-green-100 text-green-700 text-xs font-semibold px-5 py-2 rounded-full hover:bg-green-200 transition-colors">
            {t("services.wellness.viewSchedule")}
          </button>
        </div>
      </div>
    </div>
  );
}

function ServiceCard({
  service,
  index,
  isSelected,
  onClick,
}: {
  service: {
    id: string;
    icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
    titleEn: string;
    titleFr: string;
    highlighted: boolean;
    descriptionEn: string;
    descriptionFr: string;
  };
  index: number;
  isSelected: boolean;
  onClick: () => void;
}) {
  const Icon = service.icon;
  const locale = useLocale();

  return (
    <button
      onClick={onClick}
      className={`
        relative p-6 rounded-2xl transition-all duration-300 text-center
        ${
          isSelected
            ? "bg-foreground text-primary-foreground shadow-xl scale-105"
            : "bg-card border-2 border-border hover:border-foreground hover:shadow-lg"
        }
      `}
      style={{ animationDelay: `${index * 0.1}s` }}
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
        {locale === "fr" ? service.titleFr : service.titleEn}
      </h3>
    </button>
  );
}
