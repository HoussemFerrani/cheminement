import PlatformSettings from "@/models/PlatformSettings";
import Profile from "@/models/Profile";

export interface PricingResult {
  sessionPrice: number;
  platformFee: number;
  professionalPayout: number;
  currency: string;
  source: "professional" | "platform";
}

/**
 * Calculate pricing for an appointment based on therapy type
 * Uses professional's pricing if available, otherwise falls back to platform defaults
 */
export async function calculateAppointmentPricing(
  profileId: string | null,
  therapyType: "solo" | "couple" | "group",
): Promise<PricingResult> {
  // Get professional's profile (if profileId is provided)
  const profile = profileId
    ? await Profile.findOne({ userId: profileId })
    : null;

  let sessionPrice = 0;
  let source: "professional" | "platform" = "platform";

  // Check if professional has custom pricing for this therapy type
  if (profile?.pricing) {
    switch (therapyType) {
      case "solo":
        sessionPrice = profile.pricing.individualSession || 0;
        break;
      case "couple":
        sessionPrice = profile.pricing.coupleSession || 0;
        break;
      case "group":
        sessionPrice = profile.pricing.groupSession || 0;
        break;
    }

    if (sessionPrice > 0) {
      source = "professional";
    }
  }

  // If professional doesn't have pricing set, use platform defaults
  if (!sessionPrice) {
    let platformSettings = await PlatformSettings.findOne();

    // If no settings exist, create default settings
    if (!platformSettings) {
      platformSettings = new PlatformSettings({
        defaultPricing: {
          solo: 120,
          couple: 150,
          group: 80,
        },
        platformFeePercentage: 10,
        currency: "CAD",
      });
      await platformSettings.save();
    }

    switch (therapyType) {
      case "solo":
        sessionPrice = platformSettings.defaultPricing.solo;
        break;
      case "couple":
        sessionPrice = platformSettings.defaultPricing.couple;
        break;
      case "group":
        sessionPrice = platformSettings.defaultPricing.group;
        break;
      default:
        sessionPrice = 120; // Fallback
    }
  }

  // Get platform fee percentage
  const platformSettings = await PlatformSettings.findOne();
  const platformFeePercentage = platformSettings?.platformFeePercentage || 10;
  const currency = platformSettings?.currency || "CAD";

  // Calculate platform fee and professional payout
  const platformFee = Math.round((sessionPrice * platformFeePercentage) / 100);
  const professionalPayout = sessionPrice - platformFee;

  return {
    sessionPrice,
    platformFee,
    professionalPayout,
    currency,
    source,
  };
}

/**
 * Get all pricing for a professional (all therapy types)
 */
export async function getProfessionalPricing(profileId: string) {
  const profile = await Profile.findOne({ userId: profileId });
  const platformSettings = await PlatformSettings.findOne();

  const defaultPricing = {
    solo: 120,
    couple: 150,
    group: 80,
  };

  const pricing = {
    solo:
      profile?.pricing?.individualSession ||
      platformSettings?.defaultPricing?.solo ||
      defaultPricing.solo,
    couple:
      profile?.pricing?.coupleSession ||
      platformSettings?.defaultPricing?.couple ||
      defaultPricing.couple,
    group:
      profile?.pricing?.groupSession ||
      platformSettings?.defaultPricing?.group ||
      defaultPricing.group,
  };

  return {
    pricing,
    hasProfessionalPricing: !!(
      profile?.pricing?.individualSession ||
      profile?.pricing?.coupleSession ||
      profile?.pricing?.groupSession
    ),
    currency: platformSettings?.currency || "CAD",
  };
}

/**
 * Format price for display
 */
export function formatPrice(amount: number, currency: string = "CAD"): string {
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Get therapy type display name
 */
export function getTherapyTypeLabel(
  therapyType: "solo" | "couple" | "group",
): string {
  const labels = {
    solo: "Individual Therapy",
    couple: "Couple Therapy",
    group: "Group Therapy",
  };
  return labels[therapyType];
}
