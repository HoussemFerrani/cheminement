"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Loader2, Mail, ShieldCheck, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AuthCard,
  AuthContainer,
  AuthFooter,
  AuthHeader,
} from "@/components/auth";

type VerifyEmailJson = {
  ok?: boolean;
  error?: string;
  phoneStepToken?: string;
  phoneMasked?: string;
};

function VerifyAccountInner() {
  const t = useTranslations("Auth.verifyAccount");
  const searchParams = useSearchParams();
  const uid = searchParams.get("uid")?.trim() || "";
  const token = searchParams.get("token")?.trim() || "";
  const emailPreset = searchParams.get("email")?.trim() || "";

  const [userId, setUserId] = useState<string>(uid);
  const [phoneStepToken, setPhoneStepToken] = useState<string | null>(null);
  const [phoneMasked, setPhoneMasked] = useState<string>("");
  const [smsCode, setSmsCode] = useState("");
  const [resendEmail, setResendEmail] = useState(emailPreset);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [emailStepDone, setEmailStepDone] = useState(false);
  const [phoneDone, setPhoneDone] = useState(false);

  const runVerifyEmail = useCallback(async () => {
    if (!uid || !token) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/account/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: uid, token }),
      });
      const data = (await res.json()) as VerifyEmailJson;
      if (!res.ok) {
        setError(
          typeof data.error === "string"
            ? data.error
            : t("errors.verifyEmailFailed"),
        );
        return;
      }
      setUserId(uid);
      setPhoneStepToken(data.phoneStepToken ?? null);
      setPhoneMasked(data.phoneMasked ?? "");
      setEmailStepDone(true);
    } catch {
      setError(t("errors.network"));
    } finally {
      setBusy(false);
    }
  }, [uid, token, t]);

  useEffect(() => {
    if (uid && token) {
      void runVerifyEmail();
    }
  }, [uid, token, runVerifyEmail]);

  const sendSms = async () => {
    if (!userId || !phoneStepToken) return;
    setBusy(true);
    setError(null);
    setInfo(null);
    try {
      const res = await fetch("/api/auth/account/send-sms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, phoneStepToken }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(
          typeof data.error === "string"
            ? data.error
            : t("errors.sendSmsFailed"),
        );
        return;
      }
      setInfo(t("smsSent"));
    } catch {
      setError(t("errors.network"));
    } finally {
      setBusy(false);
    }
  };

  const verifyPhone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !phoneStepToken) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/account/verify-phone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          phoneStepToken,
          code: smsCode,
        }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(
          typeof data.error === "string"
            ? data.error
            : t("errors.verifyPhoneFailed"),
        );
        return;
      }
      setPhoneDone(true);
    } catch {
      setError(t("errors.network"));
    } finally {
      setBusy(false);
    }
  };

  const resendVerificationEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    const em = resendEmail.trim().toLowerCase();
    if (!em) {
      setError(t("errors.emailRequired"));
      return;
    }
    setBusy(true);
    setError(null);
    setInfo(null);
    try {
      const res = await fetch("/api/auth/account/resend-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: em }),
      });
      if (!res.ok) {
        setError(t("errors.resendFailed"));
        return;
      }
      setInfo(t("resendSuccess"));
    } catch {
      setError(t("errors.network"));
    } finally {
      setBusy(false);
    }
  };

  const verifyLinkFailed =
    Boolean(uid && token && !emailStepDone && !busy && error);
  const showResendPanel =
    !phoneDone && (!uid || !token || verifyLinkFailed);
  const showSmsFlow = emailStepDone && phoneStepToken && !phoneDone;

  return (
    <AuthContainer maxWidth="lg">
      <AuthHeader
        icon={<ShieldCheck className="w-8 h-8 text-primary" />}
        title={t("title")}
        description={t("description")}
      />
      <AuthCard>
        {busy && !emailStepDone && uid && token ? (
          <div className="flex items-center justify-center gap-2 py-8 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>{t("verifyingEmail")}</span>
          </div>
        ) : null}

        {error ? (
          <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
            {error}
          </div>
        ) : null}

        {info ? (
          <div className="mb-4 rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-100">
            {info}
          </div>
        ) : null}

        {phoneDone ? (
          <div className="space-y-4 text-center">
            <p className="text-muted-foreground font-light">{t("allDone")}</p>
            <Button asChild className="w-full">
              <Link href="/login">{t("goToLogin")}</Link>
            </Button>
          </div>
        ) : null}

        {showResendPanel ? (
          <div className="space-y-6">
            <div className="flex gap-3 rounded-lg border border-border/40 bg-muted/30 p-4">
              <Mail className="h-5 w-5 shrink-0 text-primary mt-0.5" />
              <p className="text-sm text-muted-foreground font-light leading-relaxed">
                {t("checkInboxHint")}
              </p>
            </div>
            <form onSubmit={resendVerificationEmail} className="space-y-4">
              <div>
                <Label htmlFor="resend-email">{t("emailLabel")}</Label>
                <Input
                  id="resend-email"
                  type="email"
                  autoComplete="email"
                  value={resendEmail}
                  onChange={(e) => setResendEmail(e.target.value)}
                  placeholder={t("emailPlaceholder")}
                  className="mt-1.5"
                />
              </div>
              <Button type="submit" disabled={busy} className="w-full">
                {busy ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t("sending")}
                  </>
                ) : (
                  t("resendEmail")
                )}
              </Button>
            </form>
          </div>
        ) : null}

        {showSmsFlow ? (
          <div className="space-y-6">
            <div className="flex gap-3 rounded-lg border border-border/40 bg-muted/30 p-4">
              <Smartphone className="h-5 w-5 shrink-0 text-primary mt-0.5" />
              <div className="text-sm text-muted-foreground font-light leading-relaxed space-y-1">
                <p>{t("smsIntro", { phone: phoneMasked })}</p>
              </div>
            </div>
            <Button
              type="button"
              variant="secondary"
              className="w-full"
              disabled={busy}
              onClick={() => void sendSms()}
            >
              {busy ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                t("sendSms")
              )}
            </Button>
            <form onSubmit={verifyPhone} className="space-y-4">
              <div>
                <Label htmlFor="sms-code">{t("codeLabel")}</Label>
                <Input
                  id="sms-code"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  value={smsCode}
                  onChange={(e) =>
                    setSmsCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                  placeholder="000000"
                  className="mt-1.5 tracking-widest text-center text-lg"
                />
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={busy || smsCode.replace(/\D/g, "").length !== 6}
              >
                {t("confirmSms")}
              </Button>
            </form>
          </div>
        ) : null}
      </AuthCard>
      <AuthFooter>
        <Link
          href="/login"
          className="text-sm font-light text-primary hover:text-primary/80"
        >
          {t("backToLogin")}
        </Link>
      </AuthFooter>
    </AuthContainer>
  );
}

export default function VerifyAccountPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center py-16 text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      }
    >
      <VerifyAccountInner />
    </Suspense>
  );
}
