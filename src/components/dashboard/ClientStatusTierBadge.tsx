"use client";

import { clientStatusTierColors } from "@/config/colors";
import type { ClientStatusTier } from "@/lib/client-status-tier";

type Props = {
  tier: ClientStatusTier;
  label: string;
  className?: string;
};

export function ClientStatusTierBadge({ tier, label, className = "" }: Props) {
  const c = clientStatusTierColors[tier];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-1 text-xs font-medium ${c.badge} ${className}`}
    >
      <span
        className={`h-2 w-2 shrink-0 rounded-full ${c.dot}`}
        aria-hidden
      />
      {label}
    </span>
  );
}
