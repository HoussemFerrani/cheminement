"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

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

interface AuthContainerProps {
  children: ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl";
}

export function AuthContainer({
  children,
  maxWidth = "md",
}: AuthContainerProps) {
  const maxWidthClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
      className={`w-full ${maxWidthClasses[maxWidth]} mx-auto`}
    >
      {children}
    </motion.div>
  );
}

interface AuthHeaderProps {
  icon: ReactNode;
  title: string;
  description: string;
}

export function AuthHeader({ icon, title, description }: AuthHeaderProps) {
  return (
    <motion.div
      variants={fadeInUp}
      transition={{ duration: 0.6 }}
      className="text-center mb-8"
    >
      <div className="mb-4 flex justify-center">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
          {icon}
        </div>
      </div>
      <h1 className="text-3xl md:text-4xl font-serif font-light text-foreground mb-3">
        {title}
      </h1>
      <p className="text-muted-foreground font-light">{description}</p>
    </motion.div>
  );
}

interface AuthCardProps {
  children: ReactNode;
}

export function AuthCard({ children }: AuthCardProps) {
  return (
    <motion.div
      variants={fadeInUp}
      transition={{ duration: 0.6 }}
      className="bg-card/50 backdrop-blur-sm border border-border/20 rounded-2xl p-8 shadow-lg"
    >
      {children}
    </motion.div>
  );
}

interface AuthFooterProps {
  children: ReactNode;
}

export function AuthFooter({ children }: AuthFooterProps) {
  return (
    <motion.div
      variants={fadeInUp}
      transition={{ duration: 0.6 }}
      className="mt-6 text-center"
    >
      {children}
    </motion.div>
  );
}

export { fadeInUp, staggerContainer };
