import jsPDF from "jspdf";
import type { SessionActNature } from "@/lib/session-closure";

const ACT_LABELS_FR: Record<SessionActNature, string> = {
  treatment: "Traitement / Psychothérapie",
  evaluation: "Évaluation / Diagnostic",
  consultation: "Conseil / Consultation ponctuelle",
  administrative: "Tâches administratives liées au client",
};

export function getSessionActNatureLabelFr(
  key: string | undefined,
): string {
  if (!key || !(key in ACT_LABELS_FR)) {
    return key || "—";
  }
  return ACT_LABELS_FR[key as SessionActNature];
}

export type ReceiptAudience = "client" | "professional" | "admin";

export type FiscalReceiptPdfInput = {
  appointmentId: string;
  issuedAt: Date;
  clientName: string;
  clientEmail: string;
  professionalName: string;
  professionalEmail: string;
  professionalLicense?: string;
  appointmentDateLabel: string;
  sessionTime: string;
  durationMinutes: number;
  sessionType: string;
  therapyTypeLabel: string;
  actNatureKey?: string;
  amountCad: number;
  platformFeeCad: number;
  professionalPayoutCad: number;
  paymentStatus: "paid" | "pending_transfer";
  paymentMethodLabel: string;
  stripePaymentIntentId?: string;
  /** Hides client gross + platform fee; shows only the professional's net earnings. */
  audience?: ReceiptAudience;
};

/** Données appointment peuplées (clientId, professionalId) + champs payment. */
export function buildFiscalReceiptInputFromPopulatedAppointment(
  appointment: {
    _id: string | { toString: () => string };
    date?: Date;
    time?: string;
    duration: number;
    type?: string;
    therapyType?: string;
    sessionActNature?: string;
    payment: {
      price: number;
      platformFee: number;
      professionalPayout: number;
      status: string;
      method?: string;
      stripePaymentIntentId?: string;
      paidAt?: Date;
    };
    clientId: unknown;
    professionalId: unknown;
  },
  professionalLicense?: string,
): FiscalReceiptPdfInput {
  const id =
    typeof appointment._id === "string"
      ? appointment._id
      : String(appointment._id);

  const client = appointment.clientId as {
    firstName: string;
    lastName: string;
    email: string;
  };
  const professional = appointment.professionalId as {
    firstName?: string;
    lastName?: string;
    email?: string;
  };

  const aptDate = appointment.date ? new Date(appointment.date) : null;
  const dateLabel =
    aptDate && !isNaN(aptDate.getTime())
      ? `${aptDate.toLocaleDateString("fr-CA", {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
        })}${appointment.time ? ` — ${appointment.time}` : ""}`
      : "—";

  const paymentPendingTransfer =
    appointment.payment.method === "transfer" &&
    appointment.payment.status !== "paid";

  return {
    appointmentId: id,
    issuedAt: appointment.payment.paidAt
      ? new Date(appointment.payment.paidAt)
      : new Date(),
    clientName: `${client.firstName} ${client.lastName}`,
    clientEmail: client.email,
    professionalName: `${professional.firstName ?? ""} ${professional.lastName ?? ""}`.trim(),
    professionalEmail: professional.email ?? "",
    professionalLicense,
    appointmentDateLabel: dateLabel,
    sessionTime: appointment.time || "—",
    durationMinutes: appointment.duration,
    sessionType:
      appointment.type === "in-person"
        ? "En personne"
        : appointment.type === "video"
          ? "Vidéo"
          : appointment.type === "phone"
            ? "Téléphone"
            : appointment.type === "both"
              ? "Vidéo ou en personne"
              : appointment.type || "—",
    therapyTypeLabel:
      appointment.therapyType === "solo"
        ? "Individuel"
        : appointment.therapyType === "couple"
          ? "Couple"
          : appointment.therapyType === "group"
            ? "Groupe"
            : appointment.therapyType || "—",
    actNatureKey: appointment.sessionActNature,
    amountCad: appointment.payment.price,
    platformFeeCad: appointment.payment.platformFee,
    professionalPayoutCad: appointment.payment.professionalPayout,
    paymentStatus: paymentPendingTransfer ? "pending_transfer" : "paid",
    paymentMethodLabel:
      appointment.payment.method === "transfer"
        ? "Virement Interac"
        : appointment.payment.method === "direct_debit"
          ? "Prélèvement bancaire (PAD)"
          : "Carte (Stripe)",
    stripePaymentIntentId: appointment.payment.stripePaymentIntentId,
  };
}

export function buildFiscalReceiptPdfBuffer(
  input: FiscalReceiptPdfInput,
): Buffer {
  const doc = new jsPDF();
  const primaryColor: [number, number, number] = [79, 70, 229];
  const textColor: [number, number, number] = [31, 41, 55];
  const lightGray: [number, number, number] = [243, 244, 246];
  const { appointmentId } = input;
  const isProVariant = input.audience === "professional";

  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, 210, 40, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.text("Je Cheminement", 20, 25);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Plateforme de services en santé mentale", 20, 32);

  doc.setTextColor(...textColor);
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text(isProVariant ? "RELEVÉ DE REVENU" : "REÇU FISCAL", 20, 55);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(107, 114, 128);
  doc.text(
    `Reçu n° REC-${appointmentId.slice(-8).toUpperCase()}`,
    20,
    62,
  );
  doc.text(
    `Émis le : ${input.issuedAt.toLocaleDateString("fr-CA", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })}`,
    20,
    68,
  );

  doc.setDrawColor(229, 231, 235);
  doc.line(20, 75, 190, 75);

  doc.setTextColor(...textColor);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Client", 20, 85);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(107, 114, 128);
  doc.text(input.clientName, 20, 92);
  doc.text(input.clientEmail, 20, 98);

  doc.setTextColor(...textColor);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Professionnel", 120, 85);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(107, 114, 128);
  doc.text(input.professionalName, 120, 92);
  doc.text(input.professionalEmail, 120, 98);
  if (input.professionalLicense) {
    doc.text(`N° permis : ${input.professionalLicense}`, 120, 104);
  }

  doc.line(20, 112, 190, 112);

  doc.setTextColor(...textColor);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Séance", 20, 122);

  doc.setFillColor(...lightGray);
  doc.roundedRect(20, 127, 170, 48, 3, 3, "F");

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...textColor);
  const actLabel = getSessionActNatureLabelFr(input.actNatureKey);
  doc.text(`Date / heure : ${input.appointmentDateLabel}`, 25, 135);
  doc.text(`Heure (créneau) : ${input.sessionTime}`, 25, 142);
  doc.text(`Durée : ${input.durationMinutes} minutes`, 25, 149);
  doc.text(`Type : ${input.sessionType}`, 25, 156);
  doc.text(`Modalité thérapie : ${input.therapyTypeLabel}`, 25, 163);
  doc.setFont("helvetica", "bold");
  doc.text(`Nature de l'acte : ${actLabel}`, 25, 172);

  doc.setTextColor(...textColor);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Paiement", 20, 188);

  doc.setFillColor(...lightGray);
  doc.roundedRect(20, 193, 170, 10, 2, 2, "F");

  doc.setFontSize(10);
  doc.text("Description", 25, 200);
  doc.text("Montant", 160, 200, { align: "right" });

  let yPos = 210;
  doc.setFont("helvetica", "normal");

  if (isProVariant) {
    // Professional sees only their net earnings — no gross, no platform fee.
    doc.text("Revenu professionnel (séance)", 25, yPos);
    doc.text(`$${input.professionalPayoutCad.toFixed(2)}`, 160, yPos, {
      align: "right",
    });
    yPos += 10;
  } else {
    doc.text(`Prestation (séance)`, 25, yPos);
    doc.text(`$${input.amountCad.toFixed(2)}`, 160, yPos, { align: "right" });
    yPos += 10;

    if (input.platformFeeCad > 0) {
      doc.setTextColor(107, 114, 128);
      doc.setFontSize(9);
      doc.text("Frais plateforme", 30, yPos);
      doc.text(`$${input.platformFeeCad.toFixed(2)}`, 160, yPos, {
        align: "right",
      });
      yPos += 8;
      doc.text("Montant net professionnel", 30, yPos);
      doc.text(`$${input.professionalPayoutCad.toFixed(2)}`, 160, yPos, {
        align: "right",
      });
      yPos += 10;
    }
  }

  doc.setDrawColor(229, 231, 235);
  doc.line(25, yPos, 185, yPos);
  yPos += 8;

  doc.setTextColor(...textColor);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Total", 25, yPos);
  const totalCad = isProVariant ? input.professionalPayoutCad : input.amountCad;
  doc.text(`$${totalCad.toFixed(2)} CAD`, 160, yPos, {
    align: "right",
  });
  yPos += 14;

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(107, 114, 128);
  doc.text(`Mode : ${input.paymentMethodLabel}`, 25, yPos);
  yPos += 5;
  if (input.paymentStatus === "pending_transfer") {
    doc.setTextColor(180, 83, 9);
    doc.text(
      "Paiement en attente — virement Interac selon les instructions envoyées par courriel.",
      25,
      yPos,
    );
    yPos += 10;
  } else if (input.stripePaymentIntentId) {
    doc.setTextColor(107, 114, 128);
    doc.text(
      `Réf. transaction : ${input.stripePaymentIntentId.slice(-18)}`,
      25,
      yPos,
    );
    yPos += 5;
  }

  doc.setDrawColor(229, 231, 235);
  doc.line(20, 260, 190, 260);

  doc.setFontSize(8);
  doc.setTextColor(107, 114, 128);
  doc.text(
    "Merci d'avoir choisi Je Cheminement.",
    105,
    270,
    { align: "center" },
  );
  doc.text(
    "Questions : support@jecheminement.com",
    105,
    276,
    { align: "center" },
  );
  doc.setFontSize(7);
  doc.text(
    "Document généré automatiquement.",
    105,
    285,
    { align: "center" },
  );

  return Buffer.from(doc.output("arraybuffer"));
}
