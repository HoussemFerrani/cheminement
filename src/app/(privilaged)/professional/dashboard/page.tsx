"use client";

import { useTranslations } from "next-intl";
import { useSession } from "next-auth/react";

export default function DashboardPage() {
  const { data: session } = useSession();
  const t = useTranslations("Dashboard.overview");

  const isVerified = session?.user?.professionalLicenseStatus === "verified";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-serif font-light text-foreground">
          {t("title")}
        </h1>
        <p className="text-muted-foreground font-light mt-2">{t("subtitle")}</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl bg-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-light text-muted-foreground">
                {t("totalClients")}
              </p>
              <p className="text-2xl font-serif font-light text-foreground mt-2">
                0
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-light text-muted-foreground">
                {t("weekSessions")}
              </p>
              <p className="text-2xl font-serif font-light text-foreground mt-2">
                0
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-light text-muted-foreground">
                {t("pendingBookings")}
              </p>
              <p className="text-2xl font-serif font-light text-foreground mt-2">
                0
              </p>
            </div>
          </div>
        </div>

        {!isVerified && (
          <div className="rounded-xl bg-card p-6 border-l-4 border-amber-500/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-light text-muted-foreground">
                  {t("profileStatus")}
                </p>
                <p className="text-2xl font-serif font-light text-foreground mt-2">
                  {t("pendingReview")}
                </p>
              </div>
            </div>
          </div>
        )}

        {isVerified && (
          <div className="rounded-xl bg-card p-6 border-l-4 border-emerald-500/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-light text-muted-foreground">
                  {t("profileStatus")}
                </p>
                <p className="text-2xl font-serif font-light text-emerald-600 dark:text-emerald-400 mt-2">
                  {t("verifiedStatus")}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="rounded-xl bg-card p-6">
        <h2 className="text-xl font-serif font-light text-foreground mb-4">
          {t("quickActions")}
        </h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <a
            href="/professional/dashboard/profile"
            className="rounded-lg bg-muted/50 p-4 transition-colors hover:bg-muted group"
          >
            <h3 className="font-light text-foreground mb-2 group-hover:text-primary transition-colors">
              {isVerified ? t("editProfile") : t("completeProfile")}
            </h3>
            <p className="text-sm text-muted-foreground font-light">
              {isVerified ? t("editProfileDesc") : t("completeProfileDesc")}
            </p>
          </a>
          <a
            href="/professional/dashboard/schedule"
            className="rounded-lg bg-muted/50 p-4 transition-colors hover:bg-muted group"
          >
            <h3 className="font-light text-foreground mb-2 group-hover:text-primary transition-colors">
              {t("setSchedule")}
            </h3>
            <p className="text-sm text-muted-foreground font-light">
              {t("setScheduleDesc")}
            </p>
          </a>

          {isVerified && (
            <a
              href="/professional/dashboard/clients"
              className="rounded-lg bg-muted/50 p-4 transition-colors hover:bg-muted group"
            >
              <h3 className="font-light text-foreground mb-2 group-hover:text-primary transition-colors">
                {useTranslations("Dashboard.sidebar")("clientManagement")}
              </h3>
              <p className="text-sm text-muted-foreground font-light">
                {useTranslations("Dashboard.sidebar")("myClients")}
              </p>
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
