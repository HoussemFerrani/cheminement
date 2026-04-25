import { getRequestConfig } from "next-intl/server";
import { cookies } from "next/headers";
import en from "../../messages/en.json";
import fr from "../../messages/fr.json";

const messagesByLocale = {
  en,
  fr,
} as const;

type AppLocale = keyof typeof messagesByLocale;

function resolveLocale(raw: string | undefined): AppLocale {
  if (raw === "fr") return "fr";
  return "en";
}

export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const locale = resolveLocale(cookieStore.get("NEXT_LOCALE")?.value);

  return {
    locale,
    messages: messagesByLocale[locale],
  };
});
