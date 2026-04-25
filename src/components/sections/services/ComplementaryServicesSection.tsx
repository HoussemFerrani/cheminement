"use client";

import { Brain, BookOpenCheck, Sparkle, Video } from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { motion, Variants } from "framer-motion";
import ScrollReveal from "@/components/ui/ScrollReveal";
import type { AnimationVariant } from "@/components/ui/ScrollReveal";

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut",
    },
  },
};

export default function ComplementaryServicesSection() {
  const t = useTranslations("Services.complementaryServices");

  const complementary = [
    {
      icon: Brain,
      title: t("services.adhd.title"),
      description: t("services.adhd.description"),
    },
    {
      icon: BookOpenCheck,
      title: t("services.selfLearning.title"),
      description: t("services.selfLearning.description"),
    },
    {
      icon: Video,
      title: t("services.paidContent.title"),
      description: t("services.paidContent.description"),
    },
  ];

  const cardAnimations: AnimationVariant[] = [
    "fade-right",
    "zoom-in",
    "fade-left",
  ];

  return (
    <section className="relative overflow-hidden bg-background py-24">
      <div className="absolute inset-0 opacity-[0.05]">
        <div className="absolute left-0 top-16 h-80 w-80 -translate-x-1/3 rounded-full bg-primary blur-3xl animate-float" />
        <div className="absolute right-0 bottom-0 h-104 w-104 translate-x-1/3 translate-y-1/3 rounded-full bg-accent blur-3xl" />
      </div>

      <div className="container relative z-10 mx-auto px-6">
        <ScrollReveal variant="blur-in" duration={700}>
          <div className="mx-auto max-w-5xl text-center">
            <p className="text-sm uppercase tracking-[0.35em] text-muted-foreground/70">
              {t("badge")}
            </p>
            <h2 className="mt-4 font-serif text-3xl font-medium leading-tight text-foreground md:text-4xl">
              {t("title")}
            </h2>
          </div>
        </ScrollReveal>

        {/* Collaboration Image Section */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeInUp}
          className="mt-12 mx-auto max-w-6xl"
        >
          <div className="rounded-2xl overflow-hidden bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 border border-primary/20 shadow-xl">
            <div className="relative h-[400px] md:h-[500px] lg:h-[600px] w-full">
              <Image
                src="/complementary-services-collaboration.jpg?v=2"
                alt="Collaboration et accompagnement dans les services complémentaires"
                fill
                className="object-cover"
                priority
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1200px"
                unoptimized
              />
              {/* Gradient overlay for better text readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/50 to-transparent" />
              
              {/* Content overlay */}
              <div className="absolute inset-0 flex items-end">
                <div className="w-full p-8 md:p-12 lg:p-16">
                  <div className="max-w-3xl">
                    <motion.h3
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.2, duration: 0.6 }}
                      className="text-2xl md:text-3xl lg:text-4xl font-serif font-light text-foreground mb-4 leading-tight"
                    >
                      Un accompagnement personnalisé pour votre bien-être
                    </motion.h3>
                    <motion.p
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.3, duration: 0.6 }}
                      className="text-base md:text-lg lg:text-xl text-muted-foreground font-light leading-relaxed"
                    >
                      Nos services complémentaires vous offrent des ressources adaptées à vos besoins, avec un soutien professionnel pour vous guider dans votre parcours de santé mentale.
                    </motion.p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="mt-16 grid gap-8 md:grid-cols-3">
          {complementary.map(({ icon: Icon, title, description }, index) => (
            <ScrollReveal
              key={title}
              variant={cardAnimations[index % cardAnimations.length]}
              delayMs={400 + index * 150}
              duration={700}
            >
              <div className="group relative overflow-hidden rounded-4xl border border-border/15 bg-card/85 p-8 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
                <div className="absolute inset-0 bg-linear-to-br from-primary/12 via-transparent to-accent/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                <div className="relative z-10 space-y-4">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-foreground text-card">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-serif text-xl font-medium text-foreground">
                    {title}
                  </h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {description}
                  </p>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>

        <ScrollReveal variant="bounce-in" delayMs={850} duration={600}>
          <div className="mt-12 inline-flex items-center gap-3 rounded-full border border-primary/35 bg-muted/40 px-6 py-3 text-sm font-semibold uppercase tracking-[0.25em] text-muted-foreground">
            <Sparkle className="h-4 w-4" />
            <span>{t("badge2")}</span>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
