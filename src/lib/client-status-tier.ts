export type ClientStatusTier = "gray" | "yellow" | "green" | "red";

type Guarantee = "none" | "pending_admin" | "green" | undefined;

type AptLike = {
  status: string;
  payment?: {
    status?: string;
    method?: string;
  };
  awaitingPaymentGuarantee?: boolean;
  sessionCompletedAt?: Date | string | null;
};

const H48_MS = 48 * 60 * 60 * 1000;

/**
 * Priorité : rouge (incident) > jaune (carte / relances) > gris (prospect) > vert (OK).
 */
export function computeClientStatusTier(
  paymentGuaranteeStatus: Guarantee,
  appointments: AptLike[],
): ClientStatusTier {
  const now = Date.now();

  for (const a of appointments) {
    const ps = a.payment?.status;
    if (ps === "failed") {
      return "red";
    }
    if (
      a.payment?.method === "transfer" &&
      ps === "pending" &&
      a.sessionCompletedAt &&
      (a.status === "completed" || a.status === "no-show")
    ) {
      const t = new Date(a.sessionCompletedAt).getTime();
      if (!isNaN(t) && now - t > H48_MS) {
        return "red";
      }
    }
  }

  const onlyPending =
    appointments.length > 0 &&
    appointments.every((x) => x.status === "pending");

  if (onlyPending) {
    return "gray";
  }

  if (paymentGuaranteeStatus === "green") {
    return "green";
  }

  const hasScheduledLike = appointments.some((x) =>
    ["scheduled", "ongoing"].includes(x.status),
  );

  if (hasScheduledLike) {
    return "yellow";
  }

  if (paymentGuaranteeStatus === "pending_admin") {
    return "yellow";
  }

  const hasCompletedNoShow = appointments.some((x) =>
    ["completed", "no-show"].includes(x.status),
  );
  if (hasCompletedNoShow) {
    return "yellow";
  }

  return "yellow";
}
