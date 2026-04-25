"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Users,
  User,
  Calendar,
  Wallet,
  FileText,
  ArrowRight,
  Loader2,
  AlertCircle,
  Shield,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { apiClient } from "@/lib/api-client";
import Link from "next/link";

interface ManagedAccount {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  dateOfBirth?: string;
  phone?: string;
  status: string;
}

export default function ManagedAccountsPage() {
  const [managedAccounts, setManagedAccounts] = useState<ManagedAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();
  const t = useTranslations("managedAccounts");

  useEffect(() => {
    fetchManagedAccounts();
  }, []);

  const fetchManagedAccounts = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await apiClient.get<{ managedAccounts: ManagedAccount[] }>(
        "/users/guardian?action=managed",
      );
      setManagedAccounts(response.managedAccounts || []);
    } catch (err) {
      console.error("Error fetching managed accounts:", err);
      setError(
        err instanceof Error ? err.message : t("failedToLoad"),
      );
    } finally {
      setLoading(false);
    }
  };

  const calculateAge = (dateOfBirth?: string): number | null => {
    if (!dateOfBirth) return null;
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-serif font-light text-foreground">
            {t("title")}
          </h1>
          <p className="text-sm text-muted-foreground mt-2">
            {t("subtitle")}
          </p>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-500/50 bg-red-500/10 p-4 flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-red-500" />
          <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
        </div>
      )}

      {managedAccounts.length === 0 ? (
        <div className="rounded-xl border border-border/40 bg-card p-12 text-center">
          <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">
            {t("noAccounts")}
          </h3>
          <p className="text-sm text-muted-foreground mb-6">
            {t("noAccountsDesc")}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {managedAccounts.map((account) => {
            const age = calculateAge(account.dateOfBirth);
            return (
              <div
                key={account._id}
                className="rounded-xl border border-border/40 bg-card p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium text-foreground">
                        {account.firstName} {account.lastName}
                      </h3>
                      {age !== null && (
                        <p className="text-xs text-muted-foreground">
                          {t("age", { age })}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  {account.email && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span className="truncate">{account.email}</span>
                    </div>
                  )}
                  {account.phone && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>{account.phone}</span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 pt-4 border-t border-border/40">
                  <Link
                    href={`/client/dashboard/appointments?accountId=${account._id}`}
                    className="flex-1"
                  >
                    <Button variant="outline" size="sm" className="w-full">
                      <Calendar className="h-4 w-4 mr-2" />
                      {t("appointments")}
                    </Button>
                  </Link>
                  <Link
                    href={`/client/dashboard/billing?accountId=${account._id}`}
                    className="flex-1"
                  >
                    <Button variant="outline" size="sm" className="w-full">
                      <Wallet className="h-4 w-4 mr-2" />
                      {t("billing")}
                    </Button>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
