"use client";

import { useState, useEffect } from "react";
import {
  ArrowRight,
  Calendar,
  HelpCircle,
  Mail,
  User,
  Video,
  Phone,
  MapPin,
  Clock,
  Wallet,
  Users,
  Shield,
} from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import { appointmentsAPI, apiClient } from "@/lib/api-client";
import { AppointmentResponse } from "@/types/api";

export default function ClientDashboardPage() {
  const [upcomingAppointments, setUpcomingAppointments] = useState<
    AppointmentResponse[]
  >([]);
  const [hasManagedAccounts, setHasManagedAccounts] = useState(false);
  const { data: session, status } = useSession();
  const t = useTranslations("Client.overview");
  const tApptStatus = useTranslations("Client.appointments.status");

  useEffect(() => {
    const fetchUpcomingAppointments = async () => {
      try {
        const data = await appointmentsAPI.list();
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const upcoming = data.filter((apt) => {
          const aptDate = apt.date ? new Date(apt.date) : null;
          return (
            aptDate &&
            aptDate >= today &&
            ["scheduled", "pending", "ongoing"].includes(apt.status)
          );
        });
        setUpcomingAppointments(upcoming.slice(0, 3)); // Limit to next 3 upcoming
      } catch (err) {
        console.error("Error fetching upcoming appointments:", err);
      }
    };

    const checkManagedAccounts = async () => {
      try {
        const response = await apiClient.get<{ managedAccounts: Array<{ _id: string }> }>(
          "/users/guardian?action=managed",
        );
        setHasManagedAccounts((response.managedAccounts?.length || 0) > 0);
      } catch (err) {
        // Silently fail - user might not have managed accounts
        console.error("Error checking managed accounts:", err);
      }
    };

    fetchUpcomingAppointments();
    checkManagedAccounts();
  }, []);

  const getModalityIcon = (type: string) => {
    switch (type) {
      case "video":
        return <Video className="h-4 w-4" />;
      case "in-person":
        return <MapPin className="h-4 w-4" />;
      case "phone":
        return <Phone className="h-4 w-4" />;
      default:
        return <Calendar className="h-4 w-4" />;
    }
  };

  const canJoinSession = (appointment: AppointmentResponse): boolean => {
    const hasPaymentSecured =
      appointment.payment.status === "paid" ||
      Boolean(appointment.payment.stripePaymentMethodId);

    if (!appointment.meetingLink || !hasPaymentSecured) {
      return false;
    }

    if (appointment.status === "ongoing") {
      return true;
    }

    if (appointment.status === "scheduled" && appointment.date && appointment.time) {
      const [hours, minutes] = appointment.time.split(":").map(Number);
      const sessionStart = new Date(appointment.date);
      sessionStart.setHours(hours, minutes, 0, 0);
      
      const now = new Date();
      const minutesUntilSession = (sessionStart.getTime() - now.getTime()) / (1000 * 60);
      
      // Allow joining 15 minutes before session starts
      return minutesUntilSession <= 15 && minutesUntilSession >= -appointment.duration;
    }

    return false;
  };

  const handleJoinSession = (appointment: AppointmentResponse) => {
    if (canJoinSession(appointment)) {
      window.open(appointment.meetingLink, "_blank");
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-10">
      {/* Welcome Section */}
      <section className="rounded-3xl border border-border/20 bg-linear-to-r from-primary/10 via-card to-card/80 p-8 shadow-lg">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-4">
            <p className="text-xs uppercase tracking-[0.35em] text-muted-foreground/70">
              {t("tagline")}
            </p>
            <h1 className="font-serif text-3xl font-light text-foreground lg:text-4xl">
              {t("welcome")} {status !== "loading" && session?.user.name} !
            </h1>
            <p className="max-w-2xl text-base leading-relaxed text-muted-foreground">
              {t("welcomeMessage")}
            </p>
            <p className="text-sm font-medium text-primary">« {t("quote")} »</p>
          </div>
          <div className="rounded-3xl bg-card/70 p-6 text-sm leading-relaxed text-muted-foreground">
            <p className="font-medium text-foreground">{t("todayMission")}</p>
            <p className="mt-3">{t("todayMissionText")}</p>
          </div>
        </div>
      </section>

      <div className="grid gap-10 xl:grid-cols-2">
        {/* Sidebar */}
        <div className="space-y-10">
          {/* Quick Actions */}
          <section className="rounded-3xl border border-border/20 bg-card/80 p-7 shadow-lg">
            <h2 className="font-serif text-2xl font-light text-foreground">
              {t("quickActions.title")}
            </h2>
            <div className="mt-6 space-y-4">
              <Link
                href="/client/dashboard/profile"
                className="flex items-start gap-4 rounded-2xl border border-border/20 bg-card/70 p-5 transition hover:bg-muted/50"
              >
                <div className="rounded-full bg-primary/10 p-3">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-foreground">
                    {t("quickActions.viewProfile")}
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {t("quickActions.viewProfileDesc")}
                  </p>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground" />
              </Link>

              <Link
                href="/client/dashboard/appointments"
                className="flex items-start gap-4 rounded-2xl border border-border/20 bg-card/70 p-5 transition hover:bg-muted/50"
              >
                <div className="rounded-full bg-primary/10 p-3">
                  <Calendar className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-foreground">
                    {t("quickActions.manageAppointments")}
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {t("quickActions.manageAppointmentsDesc")}
                  </p>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground" />
              </Link>

              <Link
                href="/client/dashboard/library"
                className="flex items-start gap-4 rounded-2xl border border-border/20 bg-card/70 p-5 transition hover:bg-muted/50"
              >
                <div className="rounded-full bg-primary/10 p-3">
                  <HelpCircle className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-foreground">
                    {t("quickActions.browseResources")}
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {t("quickActions.browseResourcesDesc")}
                  </p>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground" />
              </Link>

              {hasManagedAccounts && (
                <Link
                  href="/client/dashboard/managed-accounts"
                  className="flex items-start gap-4 rounded-2xl border border-primary/20 bg-primary/5 p-5 transition hover:bg-primary/10"
                >
                  <div className="rounded-full bg-primary/20 p-3">
                    <Shield className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                  <h3 className="font-medium text-foreground">
                    {t("quickActions.manageChildAccounts")}
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {t("quickActions.manageChildAccountsDesc")}
                  </p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-primary" />
                </Link>
              )}
            </div>
          </section>

          {/* Support & Help */}
          <section className="rounded-3xl border border-border/20 bg-card/80 p-7 shadow-lg">
            <h2 className="font-serif text-2xl font-light text-foreground">
              {t("support.title")}
            </h2>
            <div className="mt-6 space-y-4">
              <div className="rounded-2xl border border-border/20 bg-card/70 p-5">
                <div className="flex items-start gap-4">
                  <Mail className="h-5 w-5 text-primary" />
                  <div className="flex-1">
                    <h3 className="font-medium text-foreground">
                      {t("support.email")}
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {t("support.emailDesc")}
                    </p>
                    <a
                      href="mailto:contact@monimpression.com"
                      className="mt-2 inline-block text-sm text-primary hover:underline"
                    >
                      contact@monimpression.com
                    </a>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-border/20 bg-card/70 p-5">
                <div className="flex items-start gap-4">
                  <HelpCircle className="h-5 w-5 text-primary" />
                  <div className="flex-1">
                    <h3 className="font-medium text-foreground">
                      {t("support.faq")}
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {t("support.faqDesc")}
                    </p>
                    <Button
                      variant="link"
                      className="mt-2 h-auto p-0 text-sm text-primary"
                    >
                      {t("support.openFaq")}
                    </Button>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-border/20 bg-card/70 p-5">
                <div className="flex items-start gap-4">
                  <Wallet className="h-5 w-5 text-primary" />
                  <div className="flex-1">
                    <h3 className="font-medium text-foreground">
                      {t("support.billing")}
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {t("support.billingDesc")}
                    </p>
                    <Button
                      variant="link"
                      className="mt-2 h-auto p-0 text-sm text-primary"
                    >
                      {t("support.billingCenter")}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
        <div className="space-y-10">
          {/* Upcoming Appointments */}
          <section className="rounded-3xl border border-border/20 bg-card/80 p-7 shadow-lg">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="font-serif text-2xl font-light text-foreground">
                  {t("upcomingAppointments.title")}
                </h2>
              </div>
              <Button
                asChild
                variant="outline"
                className="gap-2 rounded-full px-5 py-5 text-sm font-medium"
              >
                <Link href="/client/dashboard/appointments">
                  <Calendar className="h-4 w-4" />
                  {t("upcomingAppointments.viewAll")}
                </Link>
              </Button>
            </div>

            {upcomingAppointments.length === 0 ? (
              <div className="mt-6 rounded-3xl bg-muted/30 p-8 text-center">
                <Calendar className="mx-auto h-12 w-12 text-muted-foreground/50" />
                <p className="mt-4 text-sm text-muted-foreground">
                  {t("upcomingAppointments.noAppointments")}
                </p>
                <Button className="mt-4 gap-2 rounded-full">
                  <Link href="/appointment" className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {t("upcomingAppointments.requestAppointment")}
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="mt-6 space-y-4">
                {upcomingAppointments.map((appointment) => (
                  <div
                    key={appointment._id}
                    className={`rounded-2xl border p-5 ${
                      appointment.status === "ongoing"
                        ? "border-purple-500/50 bg-purple-500/10"
                        : "border-border/20 bg-card/70"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                            <User className="h-6 w-6" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-medium text-foreground">
                                {appointment.date
                                  ? formatDate(appointment.date)
                                  : "to be scheduled"}
                              </h3>
                              {appointment.status === "ongoing" && (
                                <span className="rounded-full bg-purple-500 px-2 py-0.5 text-xs font-medium text-white">
                                  {tApptStatus("ongoing")}
                                </span>
                              )}
                            </div>
                            <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                {appointment.time}
                              </span>
                              <span className="flex items-center gap-1">
                                {getModalityIcon(appointment.type)}
                                {appointment.type === "in-person"
                                  ? "In Person"
                                  : appointment.type.charAt(0).toUpperCase() +
                                    appointment.type.slice(1)}
                              </span>
                            </div>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {t("upcomingAppointments.with")}{" "}
                          {appointment.professionalId?.firstName}{" "}
                          {appointment.professionalId?.lastName}
                        </p>
                      </div>
                      {appointment.type === "video" &&
                        canJoinSession(appointment) && (
                          <Button
                            onClick={() => handleJoinSession(appointment)}
                            className="gap-2 rounded-full"
                          >
                            <Video className="h-4 w-4" />
                            Join Session
                          </Button>
                        )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
