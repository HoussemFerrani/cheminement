"use client";

import { useTranslations } from "next-intl";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import {
  type ClinicalAvailabilitySlotId,
  isClinicalAvailabilitySlotId,
} from "@/config/clinical-availability-grid";

const ROWS: { id: "morning" | "afternoon" | "evening"; slotSuffix: string }[] =
  [
    { id: "morning", slotSuffix: "morning" },
    { id: "afternoon", slotSuffix: "afternoon" },
    { id: "evening", slotSuffix: "evening" },
  ];

const COLS: { id: "week" | "weekend"; prefix: string }[] = [
  { id: "week", prefix: "week" },
  { id: "weekend", prefix: "weekend" },
];

function slotId(
  colPrefix: string,
  rowSuffix: string,
): ClinicalAvailabilitySlotId {
  const id = `${colPrefix}_${rowSuffix}`;
  if (!isClinicalAvailabilitySlotId(id)) {
    throw new Error(`Invalid clinical availability slot: ${id}`);
  }
  return id;
}

export interface ClinicalAvailabilityGridProps {
  value: string[];
  onChange: (value: string[]) => void;
  disabled?: boolean;
  className?: string;
}

/**
 * Matrice à cocher : lignes = périodes (matin / après-midi / soir),
 * colonnes = semaine (lun–ven) / week-end (sam–dim).
 */
export function ClinicalAvailabilityGrid({
  value,
  onChange,
  disabled = false,
  className,
}: ClinicalAvailabilityGridProps) {
  const t = useTranslations("ClinicalAvailabilityGrid");

  const selected = new Set(value.filter(isClinicalAvailabilitySlotId));

  const toggle = (id: ClinicalAvailabilitySlotId) => {
    if (disabled) return;
    if (selected.has(id)) {
      onChange(value.filter((v) => v !== id));
    } else {
      onChange([...value, id]);
    }
  };

  return (
    <div
      className={cn("overflow-x-auto rounded-xl border border-border/60", className)}
      role="group"
      aria-label={t("ariaLabel")}
    >
      <table className="w-full min-w-[280px] border-collapse text-sm">
        <thead>
          <tr>
            <th className="border-b border-border/50 bg-muted/30 p-2 text-left font-medium text-muted-foreground w-[28%]" />
            <th className="border-b border-l border-border/50 bg-muted/30 p-2 text-center font-medium">
              {t("columnWeekday")}
            </th>
            <th className="border-b border-l border-border/50 bg-muted/30 p-2 text-center font-medium">
              {t("columnWeekend")}
            </th>
          </tr>
        </thead>
        <tbody>
          {ROWS.map((row) => (
            <tr key={row.id}>
              <th
                scope="row"
                className="border-b border-border/40 bg-muted/15 p-3 text-left align-middle font-normal"
              >
                <div className="font-medium text-foreground">{t(`rows.${row.id}.label`)}</div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {t(`rows.${row.id}.hours`)}
                </div>
              </th>
              {COLS.map((col) => {
                const id = slotId(col.prefix, row.slotSuffix);
                const checked = selected.has(id);
                return (
                  <td
                    key={id}
                    className="border-b border-l border-border/40 p-2 text-center align-middle"
                  >
                    <div className="flex justify-center py-1">
                      <Checkbox
                        id={`clinical-avail-${id}`}
                        checked={checked}
                        disabled={disabled}
                        onCheckedChange={() => toggle(id)}
                        aria-label={t("checkboxAria", {
                          period: t(`rows.${row.id}.label`),
                          column:
                            col.id === "week"
                              ? t("columnWeekday")
                              : t("columnWeekend"),
                        })}
                      />
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
