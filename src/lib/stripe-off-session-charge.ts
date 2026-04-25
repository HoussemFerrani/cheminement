import { stripe, toCents } from "@/lib/stripe";
import { decryptPaymentMethodReference } from "@/lib/field-encryption";

/**
 * Prélève la carte ou le PAD enregistré après clôture de séance (hors session navigateur).
 */
export async function chargeSavedPaymentMethodAfterSession(params: {
  appointmentId: string;
  customerId: string;
  encryptedPaymentMethodId: string | undefined;
  amountCad: number;
  method: "card" | "direct_debit";
}): Promise<{ paymentIntentId: string }> {
  const pm = decryptPaymentMethodReference(params.encryptedPaymentMethodId);
  if (!pm) {
    throw new Error("MISSING_PAYMENT_METHOD");
  }

  if (
    typeof params.amountCad !== "number" ||
    params.amountCad <= 0 ||
    !Number.isFinite(params.amountCad)
  ) {
    throw new Error("INVALID_AMOUNT");
  }

  const payment_method_types: ("card" | "acss_debit")[] =
    params.method === "direct_debit" ? ["acss_debit"] : ["card"];

  const intentParams: Parameters<typeof stripe.paymentIntents.create>[0] = {
    amount: toCents(params.amountCad),
    currency: "cad",
    customer: params.customerId,
    payment_method: pm,
    off_session: true,
    confirm: true,
    metadata: {
      appointmentId: params.appointmentId,
    },
    payment_method_types,
  };

  if (params.method === "direct_debit") {
    intentParams.payment_method_options = {
      acss_debit: {
        mandate_options: {
          payment_schedule: "sporadic",
          transaction_type: "personal",
        },
        verification_method: "automatic",
      },
    };
  }

  const pi = await stripe.paymentIntents.create(intentParams);

  if (
    pi.status === "requires_action" ||
    pi.status === "requires_confirmation"
  ) {
    throw new Error(
      "PAYMENT_REQUIRES_ACTION",
    );
  }

  if (pi.status !== "succeeded") {
    const msg = pi.last_payment_error?.message || `Statut: ${pi.status}`;
    throw new Error(msg);
  }

  return { paymentIntentId: pi.id };
}
