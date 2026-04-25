"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Loader2,
  AlertCircle,
  Download,
  RefreshCw,
  CreditCard,
  Landmark,
  AlertTriangle,
  BookOpen,
  MinusCircle,
  Users,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AppointmentResponse } from "@/types/api";

type CollectionsData = {
  stripePaid: AppointmentResponse[];
  interacPending: AppointmentResponse[];
  counts: { stripePaid: number; interacPending: number };
};

type AnomaliesData = {
  stripeFailures: AppointmentResponse[];
  interacPendingTooLong: AppointmentResponse[];
  counts: { stripeFailures: number; interacPendingTooLong: number };
};

type BalancePro = {
  _id: string;
  name: string;
  email: string;
  status: string;
  balanceLifetimeCad: number;
  balanceCurrentCycleCad: number;
};

type BalancesData = {
  professionals: BalancePro[];
  currentCycleKey: string;
};

export default function AdminAccountingPage() {
  const t = useTranslations("Admin.accounting");
  const [tab, setTab] = useState<
    "collections" | "anomalies" | "balances" | "exports" | "payout"
  >("collections");
  const [collections, setCollections] = useState<CollectionsData | null>(
    null,
  );
  const [anomalies, setAnomalies] = useState<AnomaliesData | null>(null);
  const [balances, setBalances] = useState<BalancesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exportYear, setExportYear] = useState(
    String(new Date().getFullYear()),
  );
  const [payoutProId, setPayoutProId] = useState("");
  const [payoutAmount, setPayoutAmount] = useState("");
  const [payoutRef, setPayoutRef] = useState("");
  const [payoutNotes, setPayoutNotes] = useState("");
  const [payoutCycle, setPayoutCycle] = useState("");
  const [payoutSaving, setPayoutSaving] = useState(false);

  const loadCollections = useCallback(async () => {
    const res = await fetch("/api/admin/accounting/collections");
    if (!res.ok) throw new Error("collections");
    setCollections(await res.json());
  }, []);

  const loadAnomalies = useCallback(async () => {
    const res = await fetch("/api/admin/accounting/anomalies");
    if (!res.ok) throw new Error("anomalies");
    setAnomalies(await res.json());
  }, []);

  const loadBalances = useCallback(async () => {
    const res = await fetch("/api/admin/accounting/balances");
    if (!res.ok) throw new Error("balances");
    setBalances(await res.json());
  }, []);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      await Promise.all([loadCollections(), loadAnomalies(), loadBalances()]);
    } catch {
      setError(t("loadError"));
    } finally {
      setLoading(false);
    }
  }, [loadCollections, loadAnomalies, t]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const formatName = (apt: AppointmentResponse) => {
    const c = apt.clientId;
    return `${c.firstName} ${c.lastName}`;
  };

  const formatPro = (apt: AppointmentResponse) => {
    const p = apt.professionalId;
    if (!p) return "—";
    return `${p.firstName} ${p.lastName}`;
  };

  const submitPayoutDebit = async () => {
    const amt = parseFloat(payoutAmount.replace(",", "."));
    if (!payoutProId.trim() || !Number.isFinite(amt) || amt <= 0) return;
    try {
      setPayoutSaving(true);
      const res = await fetch("/api/admin/accounting/payout-debit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          professionalId: payoutProId.trim(),
          payoutAmountCad: amt,
          payoutReference: payoutRef.trim() || undefined,
          payoutNotes: payoutNotes.trim() || undefined,
          cycleKey: payoutCycle.trim() || undefined,
        }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(typeof j.error === "string" ? j.error : "save");
      }
      setPayoutAmount("");
      setPayoutRef("");
      setPayoutNotes("");
      alert(t("payoutRecorded"));
    } catch (e) {
      alert(e instanceof Error ? e.message : t("payoutError"));
    } finally {
      setPayoutSaving(false);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-light text-foreground">
            {t("title")}
          </h1>
          <p className="mt-2 text-muted-foreground max-w-2xl">{t("subtitle")}</p>
        </div>
        <Button
          variant="outline"
          className="gap-2 rounded-full"
          onClick={() => void refresh()}
          disabled={loading}
        >
          <RefreshCw
            className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
          />
          {t("refresh")}
        </Button>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      <div className="flex flex-wrap gap-2 border-b border-border/40 pb-2">
        {(
          [
            ["collections", t("tabCollections")],
            ["anomalies", t("tabAnomalies")],
            ["balances", t("tabBalances")],
            ["exports", t("tabExports")],
            ["payout", t("tabPayout")],
          ] as const
        ).map(([k, label]) => (
          <button
            key={k}
            type="button"
            onClick={() => setTab(k)}
            className={`rounded-t-lg px-4 py-2 text-sm font-medium transition ${
              tab === k
                ? "border-b-2 border-primary text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {loading && !collections ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      ) : (
        <>
          {tab === "collections" && collections && (
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <CreditCard className="h-5 w-5 text-primary" />
                    {t("stripePaidTitle")}
                  </CardTitle>
                  <CardDescription>
                    {t("stripePaidDesc")} ({collections.counts.stripePaid})
                  </CardDescription>
                </CardHeader>
                <CardContent className="max-h-[420px] overflow-y-auto space-y-2 text-sm">
                  {collections.stripePaid.length === 0 ? (
                    <p className="text-muted-foreground">{t("empty")}</p>
                  ) : (
                    collections.stripePaid.map((apt) => (
                      <div
                        key={apt._id}
                        className="rounded-lg border border-border/30 bg-muted/20 px-3 py-2"
                      >
                        <p className="font-medium">{formatName(apt)}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatPro(apt)} · {apt.payment.price.toFixed(2)} $
                        </p>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Landmark className="h-5 w-5 text-amber-600" />
                    {t("interacPendingTitle")}
                  </CardTitle>
                  <CardDescription>
                    {t("interacPendingDesc")} (
                    {collections.counts.interacPending})
                  </CardDescription>
                </CardHeader>
                <CardContent className="max-h-[420px] overflow-y-auto space-y-2 text-sm">
                  {collections.interacPending.length === 0 ? (
                    <p className="text-muted-foreground">{t("empty")}</p>
                  ) : (
                    collections.interacPending.map((apt) => (
                      <div
                        key={apt._id}
                        className="rounded-lg border border-border/30 bg-muted/20 px-3 py-2"
                      >
                        <p className="font-medium">{formatName(apt)}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatPro(apt)} · {apt.payment.price.toFixed(2)} $
                        </p>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {tab === "anomalies" && anomalies && (
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="border-red-200/50 dark:border-red-900/40">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                    {t("stripeFailuresTitle")} (
                    {anomalies.counts.stripeFailures})
                  </CardTitle>
                  <CardDescription>{t("stripeFailuresDesc")}</CardDescription>
                </CardHeader>
                <CardContent className="max-h-[360px] overflow-y-auto space-y-2 text-sm">
                  {anomalies.stripeFailures.length === 0 ? (
                    <p className="text-muted-foreground">{t("noneOk")}</p>
                  ) : (
                    anomalies.stripeFailures.map((apt) => (
                      <div
                        key={apt._id}
                        className="rounded-lg border border-red-200/40 bg-red-50/50 px-3 py-2 dark:bg-red-950/20"
                      >
                        <p className="font-medium">{formatName(apt)}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatPro(apt)}
                        </p>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
              <Card className="border-amber-200/50 dark:border-amber-900/40">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <AlertTriangle className="h-5 w-5 text-amber-600" />
                    {t("interac48Title")} (
                    {anomalies.counts.interacPendingTooLong})
                  </CardTitle>
                  <CardDescription>{t("interac48Desc")}</CardDescription>
                </CardHeader>
                <CardContent className="max-h-[360px] overflow-y-auto space-y-2 text-sm">
                  {anomalies.interacPendingTooLong.length === 0 ? (
                    <p className="text-muted-foreground">{t("noneOk")}</p>
                  ) : (
                    anomalies.interacPendingTooLong.map((apt) => (
                      <div
                        key={apt._id}
                        className="rounded-lg border border-amber-200/40 bg-amber-50/50 px-3 py-2 dark:bg-amber-950/20"
                      >
                        <p className="font-medium">{formatName(apt)}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatPro(apt)} · {apt.payment.price.toFixed(2)} $
                        </p>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {tab === "balances" && balances && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-primary" />
                      {t("balancesTitle")}
                    </CardTitle>
                    <CardDescription>{t("balancesDesc")}</CardDescription>
                  </div>
                  <Badge variant="outline">Cycle: {balances.currentCycleKey}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t("colPro")}</TableHead>
                        <TableHead>{t("colStatus")}</TableHead>
                        <TableHead className="text-right">{t("colCycleBalance")}</TableHead>
                        <TableHead className="text-right">{t("colLifetimeBalance")}</TableHead>
                        <TableHead className="text-right">{t("colActions")}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {balances.professionals.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                            {t("empty")}
                          </TableCell>
                        </TableRow>
                      ) : (
                        balances.professionals.map((pro) => (
                          <TableRow key={pro._id}>
                            <TableCell>
                              <div className="font-medium">{pro.name}</div>
                              <div className="text-xs text-muted-foreground">{pro.email}</div>
                            </TableCell>
                            <TableCell>
                              <Badge variant={pro.status === "active" ? "default" : "secondary"} className="capitalize">
                                {pro.status}
                              </Badge>
                            </TableCell>
                            <TableCell className={`text-right font-mono ${pro.balanceCurrentCycleCad > 0 ? "text-green-600" : ""}`}>
                              {pro.balanceCurrentCycleCad.toFixed(2)} $
                            </TableCell>
                            <TableCell className={`text-right font-mono ${pro.balanceLifetimeCad > 0 ? "text-green-600" : ""}`}>
                              {pro.balanceLifetimeCad.toFixed(2)} $
                            </TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="sm" asChild>
                                <Link href={`/admin/dashboard/professionals/${pro._id}?tab=ledger`}>
                                  {t("viewLedger")}
                                </Link>
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}

          {tab === "exports" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  {t("exportsTitle")}
                </CardTitle>
                <CardDescription>{t("exportsDesc")}</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap items-end gap-4">
                <div className="space-y-2">
                  <Label>{t("year")}</Label>
                  <Input
                    type="number"
                    className="w-32"
                    value={exportYear}
                    onChange={(e) => setExportYear(e.target.value)}
                    min={2000}
                    max={2100}
                  />
                </div>
                <Button
                  className="gap-2 rounded-full"
                  variant="outline"
                  asChild
                >
                  <a
                    href={`/api/admin/accounting/sales-journal?year=${encodeURIComponent(exportYear)}`}
                    download
                  >
                    <Download className="h-4 w-4" />
                    {t("downloadSalesJournal")}
                  </a>
                </Button>
                <Button className="gap-2 rounded-full" variant="outline" asChild>
                  <a
                    href={`/api/admin/accounting/ledger-full?year=${encodeURIComponent(exportYear)}`}
                    download
                  >
                    <Download className="h-4 w-4" />
                    {t("downloadFullLedger")}
                  </a>
                </Button>
              </CardContent>
            </Card>
          )}

          {tab === "payout" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MinusCircle className="h-5 w-5" />
                  {t("payoutTitle")}
                </CardTitle>
                <CardDescription>{t("payoutDesc")}</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 max-w-md">
                <div className="space-y-2">
                  <Label>{t("payoutProId")}</Label>
                  <Input
                    value={payoutProId}
                    onChange={(e) => setPayoutProId(e.target.value)}
                    placeholder="MongoDB ObjectId"
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t("payoutAmount")}</Label>
                  <Input
                    value={payoutAmount}
                    onChange={(e) => setPayoutAmount(e.target.value)}
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t("payoutRef")}</Label>
                  <Input
                    value={payoutRef}
                    onChange={(e) => setPayoutRef(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t("payoutNotes")}</Label>
                  <Input
                    value={payoutNotes}
                    onChange={(e) => setPayoutNotes(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t("payoutCycleOptional")}</Label>
                  <Input
                    value={payoutCycle}
                    onChange={(e) => setPayoutCycle(e.target.value)}
                    placeholder="2026-B01"
                  />
                </div>
                <Button
                  className="rounded-full"
                  onClick={() => void submitPayoutDebit()}
                  disabled={payoutSaving}
                >
                  {payoutSaving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    t("payoutSubmit")
                  )}
                </Button>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
