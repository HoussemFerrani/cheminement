import "@testing-library/jest-dom";
import { vi } from "vitest";

// Mock next-intl
vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
  useLocale: () => "fr",
}));

// Mock process.env
process.env.FIELD_ENCRYPTION_KEY = "aG9sYW11bmRvcGxhdGZvcm1rZXkyMDI0MDEyMzQ1Njc=";
