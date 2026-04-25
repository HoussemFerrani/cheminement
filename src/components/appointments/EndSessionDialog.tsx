"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { appointmentsAPI } from "@/lib/api-client";
import type { AppointmentResponse } from "@/types/api";
import {
  SESSION_ACT_NATURE_VALUES,
  SESSION_OUTCOME_VALUES,
} from "@/lib/session-closure";

type EndSessionDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointmentId: string;
  onCompleted: (apt: AppointmentResponse) => void;
};

export function EndSessionDialog({
  open,
  onOpenChange,
  appointmentId,
  onCompleted,
}: EndSessionDialogProps) {
  const t = useTranslations("Dashboard.sessions.sessionClosure");
  const [act, setAct] = useState("");
  const [outcome, setOutcome] = useState("");
  const [nextDate, setNextDate] = useState("");
  const [nextTime, setNextTime] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setAct("");
      setOutcome("");
      setNextDate("");
      setNextTime("");
    }
  }, [open, appointmentId]);

  const handleSubmit = async () => {
    if (!act || !outcome) return;

    if (outcome === "rescheduled_agreed" && (!nextDate || !nextTime)) {
      window.alert(t("needNextWhenRescheduled"));
      return;
    }

    if ((nextDate && !nextTime) || (!nextDate && nextTime)) {
      window.alert(t("needBothDateTime"));
      return;
    }

    try {
      setSaving(true);
      const payload: {
        sessionActNature: string;
        sessionOutcome: string;
        nextAppointmentDate?: string;
        nextAppointmentTime?: string;
      } = {
        sessionActNature: act,
        sessionOutcome: outcome,
      };
      if (nextDate && nextTime) {
        payload.nextAppointmentDate = nextDate;
        payload.nextAppointmentTime = nextTime;
      }
      const apt = await appointmentsAPI.completeSession(appointmentId, payload);
      onCompleted(apt);
      onOpenChange(false);
    } catch (e) {
      window.alert(e instanceof Error ? e.message : t("genericError"));
    } finally {
      setSaving(false);
    }
  };

  const canSubmit = Boolean(act && outcome) && !saving;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>{t("description")}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>{t("actNatureLabel")}</Label>
            <Select value={act || undefined} onValueChange={setAct}>
              <SelectTrigger>
                <SelectValue placeholder={t("actPlaceholder")} />
              </SelectTrigger>
              <SelectContent>
                {SESSION_ACT_NATURE_VALUES.map((v) => (
                  <SelectItem key={v} value={v}>
                    {t(`acts.${v}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>{t("outcomeLabel")}</Label>
            <Select value={outcome || undefined} onValueChange={setOutcome}>
              <SelectTrigger>
                <SelectValue placeholder={t("outcomePlaceholder")} />
              </SelectTrigger>
              <SelectContent>
                {SESSION_OUTCOME_VALUES.map((v) => (
                  <SelectItem key={v} value={v}>
                    {t(`outcomes.${v}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>{t("nextLabel")}</Label>
            <p className="text-xs text-muted-foreground">{t("nextHint")}</p>
            <div className="grid gap-2 sm:grid-cols-2">
              <div className="space-y-1">
                <Label className="text-xs font-normal text-muted-foreground">
                  {t("nextDate")}
                </Label>
                <Input
                  type="date"
                  value={nextDate}
                  onChange={(e) => setNextDate(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-normal text-muted-foreground">
                  {t("nextTime")}
                </Label>
                <Input
                  type="time"
                  value={nextTime}
                  onChange={(e) => setNextTime(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={saving}
          >
            {t("cancel")}
          </Button>
          <Button type="button" onClick={handleSubmit} disabled={!canSubmit}>
            {saving ? t("saving") : t("submit")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
