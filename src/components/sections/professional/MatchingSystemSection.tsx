"use client";

import { motion } from "framer-motion";
import { Target, Users, Briefcase, Calendar } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";

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

export default function MatchingSystemSection() {
  const t = useTranslations("MatchingSystem");
  const locale = useLocale();

  const matchingCriteria = [
    {
      icon: Target,
      titleEn: "Issue Type",
      titleFr: "Type de problème",
      descriptionEn:
        "Match with clients based on the specific mental health challenges you specialize in treating",
      descriptionFr:
        "Jumelage avec des clients en fonction des défis spécifiques de santé mentale que vous êtes spécialisé à traiter.",
    },
    {
      icon: Briefcase,
      titleEn: "Therapeutic Approach",
      titleFr: "Approche thérapeutique",
      descriptionEn:
        "Connect with clients who prefer your therapeutic methods and techniques",
      descriptionFr:
        "Connectez-vous avec des clients qui préfèrent votre approche et vision thérapeutique.",
    },
    {
      icon: Users,
      titleEn: "Age Category",
      titleFr: "Catégorie d'âge",
      descriptionEn:
        "Work with the age groups you're most experienced and comfortable with",
      descriptionFr:
        "Travaillez avec les groupes d'âge avec lesquels vous êtes le plus expérimenté et à l'aise.",
    },
    {
      icon: Calendar,
      titleEn: "Expertise & Skills",
      titleFr: "Expertise et compétences",
      descriptionEn:
        "Leverage your unique competencies to help those who need them most",
      descriptionFr:
        "Tirez parti de vos compétences uniques pour aider ceux qui en ont le plus besoin.",
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

          {/* Matching Criteria Grid */}
          <motion.div
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12"
          >
            {matchingCriteria.map((criterion, index) => (
              <motion.div
                key={index}
                variants={scaleIn}
                transition={{ duration: 0.5 }}
                whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
                className="p-8 rounded-xl bg-card/50 backdrop-blur-sm hover:bg-card transition-all duration-300"
              >
                <div className="flex items-start gap-4">
                  <div className="shrink-0">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                      <criterion.icon className="w-6 h-6" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-light text-foreground mb-2">
                      {locale === "fr" ? criterion.titleFr : criterion.titleEn}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed font-light">
                      {locale === "fr"
                        ? criterion.descriptionFr
                        : criterion.descriptionEn}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Benefits Highlight */}
          <motion.div
            variants={fadeInUp}
            transition={{ duration: 0.6 }}
            className="bg-linear-to-br from-muted/30 to-accent/10 rounded-2xl p-8 md:p-12"
          >
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="shrink-0">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                  <Target className="w-10 h-10 text-primary" />
                </div>
              </div>
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-2xl font-serif font-light text-foreground mb-3">
                  {t("benefitTitle")}
                </h3>
                <p className="text-base md:text-lg text-muted-foreground leading-relaxed font-light">
                  {t("benefitDesc")}
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
