"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import {
  BarChart3,
  TrendingUp,
  Users,
  DollarSign,
  Calendar,
  Download,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type ReportPeriod = "week" | "month" | "quarter" | "year";

interface ReportMetrics {
  totalRevenue: number;
  revenueChange: number;
  totalSessions: number;
  sessionsChange: number;
  activeProfessionals: number;
  professionalsChange: number;
  activePatients: number;
  patientsChange: number;
}

interface ReportData {
  metrics: ReportMetrics;
  revenueBreakdown: {
    sessionFees: number;
    resourceSales: number;
    total: number;
  };
  topIssueTypes: Array<{
    type: string;
    sessions: number;
  }>;
  professionalPerformance: Array<{
    name: string;
    totalSessions: number;
    activeClients: number;
    revenueGenerated: number;
    avgRating: number;
  }>;
}

export default function ReportsPage() {
  const t = useTranslations("AdminDashboard.reports");
  const [period, setPeriod] = useState<ReportPeriod>("month");
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReports = async (selectedPeriod: ReportPeriod) => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(
        `/api/admin/reports?period=${selectedPeriod}`,
      );
      if (!response.ok) {
        throw new Error("Failed to fetch reports data");
      }
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports(period);
  }, [period]);

  const handlePeriodChange = (newPeriod: ReportPeriod) => {
    setPeriod(newPeriod);
  };

  const exportReport = () => {
    if (!data) return;

    const {
      metrics,
      revenueBreakdown,
      topIssueTypes,
      professionalPerformance,
    } = data;

    // Create CSV content
    let csvContent = "Reports & Analytics Export\n";
    csvContent += `Period: ${period.charAt(0).toUpperCase() + period.slice(1)}\n`;
    csvContent += `Generated: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}\n\n`;

    // Metrics section
    csvContent += "Key Metrics\n";
    csvContent += "Metric,Value,Change\n";
    csvContent += `Total Revenue,$${metrics.totalRevenue.toLocaleString()},${metrics.revenueChange}%\n`;
    csvContent += `Total Sessions,${metrics.totalSessions.toLocaleString()},${metrics.sessionsChange}%\n`;
    csvContent += `Active Professionals,${metrics.activeProfessionals},${metrics.professionalsChange}%\n`;
    csvContent += `Active Patients,${metrics.activePatients},${metrics.patientsChange}%\n\n`;

    // Revenue breakdown
    csvContent += "Revenue Breakdown\n";
    csvContent += "Category,Amount,Percentage\n";
    csvContent += `Session Fees,$${revenueBreakdown.sessionFees.toLocaleString()},${revenueBreakdown.total > 0 ? ((revenueBreakdown.sessionFees / revenueBreakdown.total) * 100).toFixed(1) : 0}%\n`;
    if (revenueBreakdown.resourceSales > 0) {
      csvContent += `Resource Sales,$${revenueBreakdown.resourceSales.toLocaleString()},${revenueBreakdown.total > 0 ? ((revenueBreakdown.resourceSales / revenueBreakdown.total) * 100).toFixed(1) : 0}%\n`;
    }
    csvContent += `Total,$${revenueBreakdown.total.toLocaleString()},100%\n\n`;

    // Top issue types
    csvContent += "Top Issue Types\n";
    csvContent += "Issue Type,Sessions\n";
    topIssueTypes.forEach((issue) => {
      csvContent += `${issue.type},${issue.sessions}\n`;
    });
    csvContent += "\n";

    // Professional performance
    csvContent += "Professional Performance\n";
    csvContent +=
      "Professional Name,Total Sessions,Active Clients,Revenue Generated,Avg Rating\n";
    professionalPerformance.forEach((prof) => {
      csvContent += `${prof.name},${prof.totalSessions},${prof.activeClients},$${prof.revenueGenerated.toLocaleString()},${prof.avgRating.toFixed(1)}\n`;
    });

    // Create and download the file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `reports-analytics-${period}-${new Date().toISOString().split("T")[0]}.csv`,
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-serif font-light text-foreground">
              {t("title")}
            </h1>
            <p className="text-muted-foreground font-light mt-2">
              {t("subtitle")}
            </p>
          </div>
        </div>

        {/* Loading skeleton */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="rounded-xl bg-card p-6 border border-border/40"
            >
              <div className="animate-pulse">
                <div className="h-4 bg-muted rounded w-24 mb-2"></div>
                <div className="h-8 bg-muted rounded w-16 mb-2"></div>
                <div className="h-3 bg-muted rounded w-20"></div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-xl bg-card p-6 border border-border/40">
            <div className="animate-pulse">
              <div className="h-6 bg-muted rounded w-32 mb-4"></div>
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-4 bg-muted rounded"></div>
                ))}
              </div>
            </div>
          </div>
          <div className="rounded-xl bg-card p-6 border border-border/40">
            <div className="animate-pulse">
              <div className="h-6 bg-muted rounded w-32 mb-4"></div>
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-16 bg-muted rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-serif font-light text-foreground">
              {t("title")}
            </h1>
            <p className="text-muted-foreground font-light mt-2">
              {t("subtitle")}
            </p>
          </div>
        </div>

        <div className="rounded-xl bg-card p-6 border border-border/40">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-light text-foreground mb-2">
                {t("failedLoad")}
              </h3>
              <p className="text-muted-foreground mb-4">{error}</p>
              <button
                onClick={() => fetchReports(period)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                <RefreshCw className="h-4 w-4" />
                {t("tryAgain")}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { metrics, revenueBreakdown, topIssueTypes, professionalPerformance } =
    data;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif font-light text-foreground">
            {t("title")}
          </h1>
          <p className="text-muted-foreground font-light mt-2">
            {t("subtitle")}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={period} onValueChange={handlePeriodChange}>
            <SelectTrigger className="w-[180px]">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">{t("thisWeek")}</SelectItem>
              <SelectItem value="month">{t("thisMonth")}</SelectItem>
              <SelectItem value="quarter">{t("thisQuarter")}</SelectItem>
              <SelectItem value="year">{t("thisYear")}</SelectItem>
            </SelectContent>
          </Select>
          <Button className="gap-2" onClick={exportReport}>
            <Download className="h-4 w-4" />
            {t("exportReport")}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl bg-card p-6 border border-border/40">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-light text-muted-foreground">
                {t("totalRevenue")}
              </p>
              <p className="text-2xl font-serif font-light text-foreground mt-2">
                ${metrics.totalRevenue.toLocaleString()}
              </p>
              <div className="flex items-center gap-1 mt-2">
                <TrendingUp
                  className={`h-3 w-3 ${metrics.revenueChange >= 0 ? "text-green-600" : "text-red-600"}`}
                />
                <span
                  className={`text-xs font-medium ${metrics.revenueChange >= 0 ? "text-green-600" : "text-red-600"}`}
                >
                  {metrics.revenueChange >= 0 ? "+" : ""}
                  {metrics.revenueChange}%
                </span>
                <span className="text-xs text-muted-foreground">
                  {t("vsLastPeriod")}
                </span>
              </div>
            </div>
            <div className="rounded-full bg-green-100 p-3">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-card p-6 border border-border/40">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-light text-muted-foreground">
                {t("totalSessions")}
              </p>
              <p className="text-2xl font-serif font-light text-foreground mt-2">
                {metrics.totalSessions.toLocaleString()}
              </p>
              <div className="flex items-center gap-1 mt-2">
                <TrendingUp
                  className={`h-3 w-3 ${metrics.sessionsChange >= 0 ? "text-blue-600" : "text-red-600"}`}
                />
                <span
                  className={`text-xs font-medium ${metrics.sessionsChange >= 0 ? "text-blue-600" : "text-red-600"}`}
                >
                  {metrics.sessionsChange >= 0 ? "+" : ""}
                  {metrics.sessionsChange}%
                </span>
                <span className="text-xs text-muted-foreground">
                  {t("vsLastPeriod")}
                </span>
              </div>
            </div>
            <div className="rounded-full bg-blue-100 p-3">
              <BarChart3 className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-card p-6 border border-border/40">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-light text-muted-foreground">
                {t("activeProfessionals")}
              </p>
              <p className="text-2xl font-serif font-light text-foreground mt-2">
                {metrics.activeProfessionals}
              </p>
              <div className="flex items-center gap-1 mt-2">
                <TrendingUp
                  className={`h-3 w-3 ${metrics.professionalsChange >= 0 ? "text-purple-600" : "text-red-600"}`}
                />
                <span
                  className={`text-xs font-medium ${metrics.professionalsChange >= 0 ? "text-purple-600" : "text-red-600"}`}
                >
                  {metrics.professionalsChange >= 0 ? "+" : ""}
                  {metrics.professionalsChange}%
                </span>
                <span className="text-xs text-muted-foreground">
                  {t("vsLastPeriod")}
                </span>
              </div>
            </div>
            <div className="rounded-full bg-purple-100 p-3">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-card p-6 border border-border/40">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-light text-muted-foreground">
                {t("activePatients")}
              </p>
              <p className="text-2xl font-serif font-light text-foreground mt-2">
                {metrics.activePatients}
              </p>
              <div className="flex items-center gap-1 mt-2">
                <TrendingUp
                  className={`h-3 w-3 ${metrics.patientsChange >= 0 ? "text-orange-600" : "text-red-600"}`}
                />
                <span
                  className={`text-xs font-medium ${metrics.patientsChange >= 0 ? "text-orange-600" : "text-red-600"}`}
                >
                  {metrics.patientsChange >= 0 ? "+" : ""}
                  {metrics.patientsChange}%
                </span>
                <span className="text-xs text-muted-foreground">
                  {t("vsLastPeriod")}
                </span>
              </div>
            </div>
            <div className="rounded-full bg-orange-100 p-3">
              <Users className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl bg-card p-6 border border-border/40">
          <h2 className="text-xl font-serif font-light text-foreground mb-4">
            {t("revenueBreakdown")}
          </h2>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-light text-muted-foreground">
                  {t("sessionFees")}
                </span>
                <span className="text-sm font-medium text-foreground">
                  ${revenueBreakdown.sessionFees.toLocaleString()}
                </span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary"
                  style={{
                    width:
                      revenueBreakdown.total > 0
                        ? `${(revenueBreakdown.sessionFees / revenueBreakdown.total) * 100}%`
                        : "0%",
                  }}
                />
              </div>
            </div>
            {revenueBreakdown.resourceSales > 0 && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-light text-muted-foreground">
                    {t("resourceSales")}
                  </span>
                  <span className="text-sm font-medium text-foreground">
                    ${revenueBreakdown.resourceSales.toLocaleString()}
                  </span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500"
                    style={{
                      width:
                        revenueBreakdown.total > 0
                          ? `${(revenueBreakdown.resourceSales / revenueBreakdown.total) * 100}%`
                          : "0%",
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="rounded-xl bg-card p-6 border border-border/40">
          <h2 className="text-xl font-serif font-light text-foreground mb-4">
            {t("topIssueTypes")}
          </h2>
          <div className="space-y-3">
            {topIssueTypes.length > 0 ? (
              topIssueTypes.slice(0, 5).map((issue) => (
                <div
                  key={issue.type}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/30"
                >
                  <span className="text-sm font-light text-foreground">
                    {issue.type}
                  </span>
                  <span className="text-sm font-medium text-foreground">
                    {issue.sessions} {t("sessions")}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>{t("noIssueData")}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-xl bg-card p-6 border border-border/40">
        <h2 className="text-xl font-serif font-light text-foreground mb-4">
          {t("profPerformance")}
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/30">
              <tr>
                <th className="text-left p-4 text-sm font-light text-muted-foreground">
                  {t("profColumn")}
                </th>
                <th className="text-left p-4 text-sm font-light text-muted-foreground">
                  {t("totalSessions")}
                </th>
                <th className="text-left p-4 text-sm font-light text-muted-foreground">
                  {t("activeClientsColumn")}
                </th>
                <th className="text-left p-4 text-sm font-light text-muted-foreground">
                  {t("revenueGeneratedColumn")}
                </th>
                <th className="text-left p-4 text-sm font-light text-muted-foreground">
                  {t("avgRatingColumn")}
                </th>
              </tr>
            </thead>
            <tbody>
              {professionalPerformance.length > 0 ? (
                professionalPerformance.map((prof) => (
                  <tr
                    key={prof.name}
                    className="border-t border-border/40 hover:bg-muted/20 transition-colors"
                  >
                    <td className="p-4 text-sm font-light text-foreground">
                      {prof.name}
                    </td>
                    <td className="p-4 text-sm font-light text-foreground">
                      {prof.totalSessions}
                    </td>
                    <td className="p-4 text-sm font-light text-foreground">
                      {prof.activeClients}
                    </td>
                    <td className="p-4 text-sm font-light text-foreground">
                      ${prof.revenueGenerated.toLocaleString()}
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center gap-1 text-sm font-medium text-foreground">
                        ⭐ {prof.avgRating.toFixed(1)}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="p-12 text-center">
                    <Users className="h-12 w-12 mx-auto mb-4 opacity-50 text-muted-foreground" />
                    <p className="text-muted-foreground">
                      {t("noProfData")}
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
