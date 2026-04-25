import { getTranslations } from "next-intl/server";
import { Scale } from "lucide-react";
import { SignOutButton } from "./SignOutButton";

export default async function ProfessionalAccountPendingPage() {
  const t = await getTranslations("Auth.professionalAccountPending");

  return (
    <div className="mx-auto max-w-xl space-y-8 py-4">
      <div className="flex justify-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 text-amber-900 dark:bg-amber-950/50 dark:text-amber-100">
          <Scale className="h-8 w-8" />
        </div>
      </div>
      <div className="text-center space-y-3">
        <h1 className="font-serif text-2xl font-light text-foreground md:text-3xl">
          {t("title")}
        </h1>
        <p className="text-muted-foreground font-light leading-relaxed">
          {t("description")}
        </p>
        <p className="text-sm text-muted-foreground font-light leading-relaxed">
          {t("opqNote")}
        </p>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
        <SignOutButton label={t("signOut")} />
      </div>
    </div>
  );
}
