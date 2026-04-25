"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Download,
  Wallet,
  CheckCircle2,
  Clock,
  TrendingUp,
  Search,
  Users,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

type PaymentStatus = "paid" | "pending" | "upcoming" | "processing" | "overdue";

interface Payment {
  id: string;
  sessionId: string;
  client: string;
  professional: string;
  date: string;
  sessionDate: string;
  amount: number;
  platformFee: number;
  professionalPayout: number;
  status: PaymentStatus;
  paymentMethod?: string;
  invoiceUrl?: string;
  paidDate?: string;
}

interface BillingData {
  payments: Payment[];
  summary: {
    totalRevenue: number;
    pendingRevenue: number;
    professionalPayouts: number;
    totalTransactions: number;
    overdueCount: number;
  };
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export default function AdminBillingPage() {
  const [data, setData] = useState<BillingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<PaymentStatus | "all">(
    "all",
  );
  const [currentPage, setCurrentPage] = useState(1);
  const t = useTranslations("Admin.billing");

  const fetchBillingData = useCallback(
    async (page = 1) => {
      try {
        setLoading(true);
        setError(null);
        const params = new URLSearchParams({
          page: page.toString(),
          limit: "20",
          search: search,
          status: statusFilter,
        });
        const response = await fetch(`/api/admin/billing?${params}`);
        if (!response.ok) {
          throw new Error("Failed to fetch billing data");
        }
        const result = await response.json();
        setData(result);
        setCurrentPage(page);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    },
    [search, statusFilter],
  );

  useEffect(() => {
    fetchBillingData(1);
  }, [fetchBillingData]);

  const payments = data?.payments || [];
  const stats = data?.summary || {
    totalRevenue: 0,
    pendingRevenue: 0,
    professionalPayouts: 0,
    totalTransactions: 0,
    overdueCount: 0,
  };

  const getStatusColor = (status: PaymentStatus) => {
    switch (status) {
      case "paid":
        return "bg-green-500/15 text-green-700 dark:text-green-400";
      case "pending":
        return "bg-yellow-500/15 text-yellow-700 dark:text-yellow-400";
      case "upcoming":
        return "bg-blue-500/15 text-blue-700 dark:text-blue-400";
      case "processing":
        return "bg-purple-500/15 text-purple-700 dark:text-purple-400";
      case "overdue":
        return "bg-red-500/15 text-red-700 dark:text-red-400";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getStatusIcon = (status: PaymentStatus) => {
    switch (status) {
      case "paid":
        return <CheckCircle2 className="h-4 w-4" />;
      case "pending":
        return <Clock className="h-4 w-4" />;
      case "upcoming":
        return <Clock className="h-4 w-4" />;
      case "processing":
        return <Clock className="h-4 w-4" />;
      case "overdue":
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-CA", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleDownloadReceipt = async (appointmentId: string) => {
    try {
      const response = await fetch(
        `/api/payments/receipt?appointmentId=${appointmentId}`,
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to download receipt");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `receipt-${appointmentId.slice(-8)}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error("Error downloading receipt:", err);
      alert(err instanceof Error ? err.message : "Failed to download receipt");
    }
  };

  const exportBillingReport = () => {
    if (!data) return;

    const { payments, summary } = data;

    // Create CSV content
    let csvContent = "Billing Report Export\n";
    csvContent += `Generated: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}\n\n`;

    // Summary section
    csvContent += "Summary\n";
    csvContent += "Metric,Value\n";
    csvContent += `Total Revenue,$${summary.totalRevenue.toFixed(2)}\n`;
    csvContent += `Pending Revenue,$${summary.pendingRevenue.toFixed(2)}\n`;
    csvContent += `Professional Payouts,$${summary.professionalPayouts.toFixed(2)}\n`;
    csvContent += `Total Transactions,${summary.totalTransactions}\n`;
    csvContent += `Overdue Count,${summary.overdueCount}\n\n`;

    // Payments section
    csvContent += "Payment Transactions\n";
    csvContent +=
      "Invoice ID,Client,Professional,Session Date,Amount,Platform Fee,Professional Payout,Status,Payment Method,Paid Date\n";

    payments.forEach((payment) => {
      csvContent += `${payment.sessionId},"${payment.client}","${payment.professional}",${payment.sessionDate},${payment.amount.toFixed(2)},${payment.platformFee.toFixed(2)},${payment.professionalPayout.toFixed(2)},${payment.status},${payment.paymentMethod || ""},${payment.paidDate || ""}\n`;
    });

    // Create and download the file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `billing-report-${new Date().toISOString().split("T")[0]}.csv`,
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="font-serif text-3xl font-light text-foreground">
              {t("title")}
            </h1>
            <p className="mt-2 text-muted-foreground">{t("subtitle")}</p>
          </div>
        </div>

        {/* Loading skeleton for stats */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="rounded-3xl border border-border/20 bg-card/80 p-6 shadow-lg"
            >
              <div className="animate-pulse">
                <div className="h-4 bg-muted rounded w-24 mb-2"></div>
                <div className="h-8 bg-muted rounded w-16"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Loading skeleton for content */}
        <div className="rounded-3xl border border-border/20 bg-card/60 p-6 shadow-inner">
          <div className="animate-pulse">
            <div className="h-10 bg-muted rounded w-full max-w-md mb-4"></div>
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-24 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="font-serif text-3xl font-light text-foreground">
              {t("title")}
            </h1>
            <p className="mt-2 text-muted-foreground">{t("subtitle")}</p>
          </div>
        </div>

        <div className="rounded-3xl border border-border/20 bg-card/80 p-12 shadow-lg">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-light text-foreground mb-2">
              {t("failedLoad")}
            </h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <button
              onClick={() => fetchBillingData(1)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              {t("tryAgain")}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-serif text-3xl font-light text-foreground">
            {t("title")}
          </h1>
          <p className="mt-2 text-muted-foreground">{t("subtitle")}</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchBillingData(currentPage)}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            {t("refresh")}
          </button>
          <Button className="gap-2 rounded-full" onClick={exportBillingReport}>
            <Download className="h-4 w-4" />
            {t("exportReport")}
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-3xl border border-border/20 bg-card/80 p-6 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-primary/10 p-3">
              <TrendingUp className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                {t("platformRevenue")}
              </p>
              <p className="text-2xl font-light text-foreground">
                {stats.totalRevenue.toFixed(2)} $
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-border/20 bg-card/80 p-6 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-yellow-500/10 p-3">
              <Clock className="h-6 w-6 text-yellow-700 dark:text-yellow-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                {t("pendingRevenue")}
              </p>
              <p className="text-2xl font-light text-foreground">
                {stats.pendingRevenue.toFixed(2)} $
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-border/20 bg-card/80 p-6 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-green-500/10 p-3">
              <Users className="h-6 w-6 text-green-700 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                {t("professionalPayouts")}
              </p>
              <p className="text-2xl font-light text-foreground">
                {stats.professionalPayouts.toFixed(2)} $
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-border/20 bg-card/80 p-6 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-red-500/10 p-3">
              <AlertCircle className="h-6 w-6 text-red-700 dark:text-red-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t("overdue")}</p>
              <p className="text-2xl font-light text-foreground">
                {stats.overdueCount}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <section className="grid gap-4 rounded-3xl border border-border/20 bg-card/60 p-6 shadow-inner">
        <div className="grid gap-4 md:grid-cols-[1fr_auto]">
          <div className="relative flex items-center">
            <Search className="absolute left-4 h-4 w-4 text-muted-foreground" />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={t("searchPlaceholder")}
              className="w-full rounded-full border border-border/40 bg-card/80 py-3 pl-11 pr-4 text-sm text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {(
            [
              "all",
              "paid",
              "pending",
              "upcoming",
              "processing",
              "overdue",
            ] as const
          ).map((status) => {
            const isActive = statusFilter === status;
            return (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition ${
                  isActive
                    ? "border-primary bg-primary text-primary-foreground shadow-lg"
                    : "border-border/40 bg-card/80 text-muted-foreground hover:border-primary/40 hover:text-foreground"
                }`}
              >
                {status !== "all" && getStatusIcon(status as PaymentStatus)}
                {t(`filters.${status}`)}
              </button>
            );
          })}
        </div>
      </section>

      {/* Payments List */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-2xl font-light text-foreground">
            {t("allTransactions")}
          </h2>
          <span className="text-sm text-muted-foreground">
            {payments.length}{" "}
            {payments.length > 1 ? t("transactionsPlural") : t("transactions")}
          </span>
        </div>

        {payments.length === 0 ? (
          <div className="rounded-3xl border border-border/20 bg-card/80 p-12 text-center shadow-lg">
            <Wallet className="mx-auto h-16 w-16 text-muted-foreground/50" />
            <h3 className="mt-4 font-serif text-xl text-foreground">
              {t("noTransactions")}
            </h3>
          </div>
        ) : (
          <div className="space-y-4">
            {payments.map((payment) => (
              <div
                key={payment.id}
                className="rounded-3xl border border-border/20 bg-card/80 p-6 shadow-lg transition hover:shadow-xl"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-4">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-serif text-xl font-light text-foreground">
                          {payment.client} → {payment.professional}
                        </h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {formatDate(payment.sessionDate)}
                        </p>
                      </div>
                      <span
                        className={`flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wider ${getStatusColor(
                          payment.status,
                        )}`}
                      >
                        {getStatusIcon(payment.status)}
                        {t(`status.${payment.status}`)}
                      </span>
                    </div>

                    {/* Details Grid */}
                    <div className="grid gap-4 rounded-2xl bg-muted/30 p-4 md:grid-cols-5">
                      <div>
                        <p className="text-xs text-muted-foreground">
                          {t("invoiceNumber")}
                        </p>
                        <p className="font-medium text-foreground">
                          {payment.sessionId}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">
                          {t("clientPayment")}
                        </p>
                        <p className="font-medium text-foreground">
                          {payment.amount.toFixed(2)} $
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">
                          {t("platformFee")}
                        </p>
                        <p className="font-medium text-primary">
                          {payment.platformFee.toFixed(2)} $
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">
                          {t("professionalPayout")}
                        </p>
                        <p className="font-medium text-foreground">
                          {payment.professionalPayout.toFixed(2)} $
                        </p>
                      </div>
                      {payment.paymentMethod && (
                        <div>
                          <p className="text-xs text-muted-foreground">
                            {t("paymentMethod")}
                          </p>
                          <p className="font-medium text-foreground">
                            {payment.paymentMethod}
                          </p>
                        </div>
                      )}
                      {payment.paidDate && (
                        <div>
                          <p className="text-xs text-muted-foreground">
                            {t("paidDate")}
                          </p>
                          <p className="font-medium text-foreground">
                            {formatDate(payment.paidDate)}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    {payment.status === "paid" && (
                      <div className="flex flex-wrap gap-2">
                        <Button
                          variant="outline"
                          className="gap-2 rounded-full"
                          size="sm"
                          onClick={() => handleDownloadReceipt(payment.id)}
                        >
                          <Download className="h-4 w-4" />
                          {t("downloadInvoice")}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
