"use client";

import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type AnimationVariant =
  | "fade-up"
  | "fade-down"
  | "fade-left"
  | "fade-right"
  | "zoom-in"
  | "zoom-out"
  | "flip-up"
  | "flip-down"
  | "rotate-in"
  | "slide-up"
  | "slide-down"
  | "slide-left"
  | "slide-right"
  | "blur-in"
  | "bounce-in"
  | "swing-in";

type ScrollRevealProps = {
  children: ReactNode;
  className?: string;
  delayMs?: number;
  duration?: number;
  variant?: AnimationVariant;
  once?: boolean;
  threshold?: number;
  easing?: string;
};

const variantStyles: Record<
  AnimationVariant,
  { hidden: string; visible: string; animation: string }
> = {
  "fade-up": {
    hidden: "opacity-0 translate-y-8",
    visible: "opacity-100 translate-y-0",
    animation: "animate-fade-in-up",
  },
  "fade-down": {
    hidden: "opacity-0 -translate-y-8",
    visible: "opacity-100 translate-y-0",
    animation: "animate-fade-in-down",
  },
  "fade-left": {
    hidden: "opacity-0 translate-x-8",
    visible: "opacity-100 translate-x-0",
    animation: "animate-fade-in-left",
  },
  "fade-right": {
    hidden: "opacity-0 -translate-x-8",
    visible: "opacity-100 translate-x-0",
    animation: "animate-fade-in-right",
  },
  "zoom-in": {
    hidden: "opacity-0 scale-90",
    visible: "opacity-100 scale-100",
    animation: "animate-zoom-in",
  },
  "zoom-out": {
    hidden: "opacity-0 scale-110",
    visible: "opacity-100 scale-100",
    animation: "animate-zoom-out",
  },
  "flip-up": {
    hidden: "opacity-0 rotateX-90 perspective-1000",
    visible: "opacity-100 rotateX-0",
    animation: "animate-flip-up",
  },
  "flip-down": {
    hidden: "opacity-0 -rotateX-90 perspective-1000",
    visible: "opacity-100 rotateX-0",
    animation: "animate-flip-down",
  },
  "rotate-in": {
    hidden: "opacity-0 rotate-12 scale-90",
    visible: "opacity-100 rotate-0 scale-100",
    animation: "animate-rotate-in",
  },
  "slide-up": {
    hidden: "opacity-0 translate-y-16",
    visible: "opacity-100 translate-y-0",
    animation: "animate-slide-up",
  },
  "slide-down": {
    hidden: "opacity-0 -translate-y-16",
    visible: "opacity-100 translate-y-0",
    animation: "animate-slide-down",
  },
  "slide-left": {
    hidden: "opacity-0 translate-x-16",
    visible: "opacity-100 translate-x-0",
    animation: "animate-slide-left",
  },
  "slide-right": {
    hidden: "opacity-0 -translate-x-16",
    visible: "opacity-100 translate-x-0",
    animation: "animate-slide-right",
  },
  "blur-in": {
    hidden: "opacity-0 blur-sm scale-95",
    visible: "opacity-100 blur-0 scale-100",
    animation: "animate-blur-in",
  },
  "bounce-in": {
    hidden: "opacity-0 scale-50",
    visible: "opacity-100 scale-100",
    animation: "animate-bounce-in",
  },
  "swing-in": {
    hidden: "opacity-0 -rotate-6 translate-y-4",
    visible: "opacity-100 rotate-0 translate-y-0",
    animation: "animate-swing-in",
  },
};

export default function ScrollReveal({
  children,
  className,
  delayMs = 0,
  duration = 600,
  variant = "fade-up",
  once = true,
  threshold = 0.15,
  easing = "cubic-bezier(0.22, 1, 0.36, 1)",
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (once) {
            observer.disconnect();
          }
        } else if (!once) {
          setIsVisible(false);
        }
      },
      { threshold, rootMargin: "0px 0px -10% 0px" },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [once, threshold]);

  const variantConfig = variantStyles[variant];

  const style = {
    animationDelay: delayMs ? `${delayMs}ms` : undefined,
    animationDuration: `${duration}ms`,
    animationFillMode: "both" as const,
    animationTimingFunction: easing,
  };

  return (
    <div
      ref={ref}
      className={cn(
        "transition-all will-change-transform",
        "motion-reduce:opacity-100 motion-reduce:translate-y-0 motion-reduce:translate-x-0 motion-reduce:scale-100 motion-reduce:rotate-0 motion-reduce:blur-0 motion-reduce:animate-none",
        isVisible ? variantConfig.visible : variantConfig.hidden,
        isVisible && variantConfig.animation,
        className,
      )}
      style={style}
    >
      {children}
    </div>
  );
}

export type { AnimationVariant, ScrollRevealProps };
