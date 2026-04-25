"use client";

import { motion } from "framer-motion";
import Link from "next/link";
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
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
  },
};

export default function ExploreTopicsSection() {
  const t = useTranslations("ExploreTopics");
  const locale = useLocale();

  const topics = [
    {
      titleEn: "Depression",
      titleFr: "Dépression",
      descriptionEn:
        "Persistent feelings of sadness, loss of interest, and lack of energy affecting daily life.",
      descriptionFr:
        "Sentiments persistants de tristesse, perte d'intérêt et manque d'énergie affectant la vie quotidienne.",
      slug: "depression",
    },
    {
      titleEn: "Anxiety",
      titleFr: "Anxiété",
      descriptionEn:
        "Excessive worry and fear that interferes with daily activities and well-being.",
      descriptionFr:
        "Inquiétude et peur excessives qui interfèrent avec les activités quotidiennes et le bien-être.",
      slug: "anxiete",
    },
    {
      titleEn: "Panic Disorder",
      titleFr: "Trouble panique",
      descriptionEn:
        "Recurring panic attacks with intense fear and physical symptoms like rapid heartbeat.",
      descriptionFr:
        "Crises de panique récurrentes avec peur intense et symptômes physiques comme des palpitations.",
      slug: "trouble-panique",
    },
    {
      titleEn: "Social Anxiety",
      titleFr: "Anxiété sociale",
      descriptionEn:
        "Intense fear of social situations and being judged or scrutinized by others.",
      descriptionFr:
        "Peur intense des situations sociales et d'être jugé ou scruté par les autres.",
      slug: "anxiete-sociale",
    },
    {
      titleEn: "Post-Traumatic Stress",
      titleFr: "État de stress post-traumatique",
      descriptionEn:
        "Anxiety and flashbacks triggered by traumatic events, affecting daily functioning.",
      descriptionFr:
        "Anxiété et flashbacks déclenchés par des événements traumatiques, affectant le fonctionnement quotidien.",
      slug: "stress-post-traumatique",
    },
    {
      titleEn: "ADHD",
      titleFr: "TDAH",
      descriptionEn:
        "Difficulty focusing, controlling impulses, and hyperactivity affecting work and relationships.",
      descriptionFr:
        "Difficulté à se concentrer, à contrôler les impulsions et hyperactivité affectant le travail et les relations.",
      slug: "tdah",
    },
    {
      titleEn: "OCD",
      titleFr: "Trouble obsessionnel-compulsif",
      descriptionEn:
        "Intrusive thoughts and repetitive behaviors that cause distress and consume time.",
      descriptionFr:
        "Pensées intrusives et comportements répétitifs qui causent de la détresse et consomment du temps.",
      slug: "trouble-obsessionnel-compulsif",
    },
    {
      titleEn: "Learning Difficulties",
      titleFr: "Difficultés d'apprentissage",
      descriptionEn:
        "Challenges in acquiring and processing information that affect academic performance.",
      descriptionFr:
        "Difficultés à acquérir et traiter l'information qui affectent la performance académique.",
      slug: "difficultes-apprentissage",
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

          {/* Topics Grid */}
          <motion.div
            variants={staggerContainer}
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6"
          >
            {topics.map((topic, index) => (
              <motion.div
                key={index}
                variants={scaleIn}
                transition={{ duration: 0.5 }}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                className="p-6 rounded-xl bg-card/50 backdrop-blur-sm hover:bg-card transition-all duration-300 flex flex-col"
              >
                <h4 className="text-lg font-light text-foreground mb-3">
                  {locale === "fr" ? topic.titleFr : topic.titleEn}
                </h4>
                <p className="text-muted-foreground text-sm leading-relaxed font-light mb-4 flex-1">
                  {locale === "fr" ? topic.descriptionFr : topic.descriptionEn}
                </p>
                <Link
                  href={`/explore/${topic.slug}`}
                  className="inline-flex items-center text-sm text-primary hover:text-primary/80 transition-colors font-light"
                >
                  {t("learnMore")}
                  <svg
                    className="w-4 h-4 ml-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
