import type { IUser } from "@/models/User";

/** True si le client doit encore « sécuriser » le paiement (carte/PAD ou entente validée). */
export function clientLacksPaymentGuaranteeForAppointment(
  appointment: {
    payment?: {
      stripePaymentMethodId?: string;
      method?: string;
    };
  },
  clientUser: Pick<IUser, "paymentGuaranteeStatus" | "paymentGuaranteeSource"> | null,
): boolean {
  if (appointment.payment?.stripePaymentMethodId) return false;
  if (clientUser?.paymentGuaranteeStatus === "green") return false;
  if (
    clientUser?.paymentGuaranteeStatus === "pending_admin" &&
    appointment.payment?.method === "transfer"
  ) {
    return false;
  }
  return true;
}
