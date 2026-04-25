"use client";

import { useTransition } from "react";

const locales = [
  { code: "en", name: "EN" },
  { code: "fr", name: "FR" },
];

export function LocaleSwitcher({ currentLocale }: { currentLocale: string }) {
  const [isPending, startTransition] = useTransition();

  const handleLocaleChange = () => {
    const newLocale = currentLocale === "en" ? "fr" : "en";
    startTransition(() => {
      // Set cookie
      document.cookie = `NEXT_LOCALE=${newLocale};path=/;max-age=31536000`;
      // Reload page to apply new locale
      window.location.reload();
    });
  };

  const currentLocaleData = locales.find((l) => l.code === currentLocale);

  return (
    <button
      onClick={handleLocaleChange}
      disabled={isPending}
      className="inline-flex items-center justify-center rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
    >
      {currentLocaleData?.name}
    </button>
  );
}
