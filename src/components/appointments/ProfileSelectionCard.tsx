"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface ProfileSelectionCardProps {
  href: string;
  icon: LucideIcon;
  title: string;
  description: string;
  cta: string;
}

export default function ProfileSelectionCard({
  href,
  icon: Icon,
  title,
  description,
  cta,
}: ProfileSelectionCardProps) {
  return (
    <Link
      href={href}
      className="group relative flex flex-col items-center gap-5 p-8 rounded-xl bg-card/50 backdrop-blur-sm border border-transparent hover:bg-card hover:border-primary/30 hover:shadow-xl transition-all duration-300"
    >
      <div className="w-14 h-14 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
        <Icon className="w-7 h-7" strokeWidth={1.5} aria-hidden />
      </div>

      <h3 className="text-lg font-serif font-light text-foreground">
        {title}
      </h3>

      <p className="text-sm text-muted-foreground leading-relaxed font-light text-center">
        {description}
      </p>

      <span className="inline-flex items-center gap-1.5 text-sm font-medium text-primary opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
        {cta}
        <ArrowRight className="w-4 h-4" />
      </span>
    </Link>
  );
}
