"use client";

import { motion } from "framer-motion";
import { Clock, MapPin, BookOpen } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import Image from "next/image";
import ScrollReveal from "@/components/ui/ScrollReveal";

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
  },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.3,
    },
  },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
  },
};

export default function QuickAccessSection() {
  const t = useTranslations("QuickAccess");
  const locale = useLocale();

  const benefits = [
    {
      icon: Clock,
      titleEn: "Find Help Quickly",
      titleFr: "Trouvez de l'aide rapidement",
      descriptionEn:
        "No more endless waiting lists. Connect with qualified mental health professionals who are available to help you now.",
      descriptionFr:
        "Fini les longues listes d'attente. Connectez-vous avec des professionnels de la santé mentale qualifiés qui sont disponibles pour vous aider maintenant.",
    },
    {
      icon: MapPin,
      titleEn: "Access from Anywhere",
      titleFr: "Accès de n'importe où",
      descriptionEn:
        "Whether you're in a remote region or a major city, find the right professional who matches your needs, no matter the distance.",
      descriptionFr:
        "Que vous soyez dans une région éloignée ou une grande ville, trouvez le bon professionnel qui correspond à vos besoins, quelle que soit la distance.",
    },
    {
      icon: BookOpen,
      titleEn: "Start Your Journey Today",
      titleFr: "Commencez votre parcours aujourd'hui",
      descriptionEn:
        "Begin with educational resources, self-learning materials, and readings while you prepare for your first session with a professional.",
      descriptionFr:
        "Commencez avec des ressources éducatives, du matériel d'apprentissage autonome et des lectures pendant que vous vous préparez pour votre première séance avec un professionnel.",
    },
  ];

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-6">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
          className="max-w-6xl mx-auto"
        >
          {/* Section Header */}
          <div className="text-center mb-16">
            <motion.div
              variants={fadeInUp}
              transition={{ duration: 0.6 }}
              className="mb-4"
            >
              <p className="text-sm md:text-base tracking-[0.3em] uppercase text-muted-foreground font-light mb-2">
                {t("badge")}
              </p>
              <div className="w-32 h-0.5 bg-muted-foreground mx-auto"></div>
            </motion.div>

            <motion.h2
              variants={fadeInUp}
              transition={{ duration: 0.6 }}
              className="text-3xl md:text-4xl lg:text-5xl font-serif font-light text-foreground mb-6"
            >
              {t("title")}
            </motion.h2>

            <motion.p
              variants={fadeInUp}
              transition={{ duration: 0.6 }}
              className="text-base md:text-lg lg:text-xl text-muted-foreground max-w-3xl mx-auto font-light leading-relaxed"
            >
              {t("subtitle")}
            </motion.p>
          </div>

          {/* Benefits Grid */}
          <motion.div
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12"
          >
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                variants={scaleIn}
                transition={{ duration: 0.5 }}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                className="p-8 rounded-xl bg-card/50 backdrop-blur-sm hover:bg-card transition-all duration-300 text-center"
              >
                <div className="mb-4 flex justify-center">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    <benefit.icon className="w-6 h-6" />
                  </div>
                </div>
                <h3 className="text-xl font-light text-foreground mb-3">
                  {locale === "fr" ? benefit.titleFr : benefit.titleEn}
                </h3>
                <p className="text-muted-foreground leading-relaxed font-light">
                  {locale === "fr"
                    ? benefit.descriptionFr
                    : benefit.descriptionEn}
                </p>
              </motion.div>
            ))}
          </motion.div>

          {/* Image Section */}
          <ScrollReveal variant="fade-up" delayMs={400} duration={800}>
            <div className="mb-12 max-w-4xl mx-auto">
              <div className="relative aspect-[16/9] rounded-2xl overflow-hidden shadow-xl group">
                <Image
                  src="/chem1.avif"
                  alt="Cheminement"
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </div>
            </div>
          </ScrollReveal>

          {/* Highlight Box */}
          <motion.div
            variants={fadeInUp}
            transition={{ duration: 0.6 }}
            className="bg-linear-to-br from-muted/30 to-accent/10 rounded-2xl p-8 md:p-12 text-center"
          >
            <h3 className="text-2xl font-serif font-light text-foreground mb-3">
              {t("highlightTitle")}
            </h3>
            <p className="text-base md:text-lg text-muted-foreground leading-relaxed font-light max-w-2xl mx-auto">
              {t("highlightDesc")}
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
