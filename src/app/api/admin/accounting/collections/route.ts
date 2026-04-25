import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectToDatabase from "@/lib/mongodb";
import Appointment from "@/models/Appointment";

/** Encaissements : Stripe (payé) vs Interac (en attente). */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    const base = {
      status: { $in: ["completed", "no-show"] },
      "payment.price": { $gt: 0 },
    };

    const stripePaid = await Appointment.find({
      ...base,
      "payment.status": "paid",
      "payment.method": { $in: ["card", "direct_debit"] },
    })
      .populate("clientId", "firstName lastName email")
      .populate("professionalId", "firstName lastName email")
      .sort({ "payment.paidAt": -1, updatedAt: -1 })
      .limit(500)
      .lean();

    const interacPending = await Appointment.find({
      ...base,
      "payment.status": "pending",
      "payment.method": "transfer",
    })
      .populate("clientId", "firstName lastName email")
      .populate("professionalId", "firstName lastName email")
      .sort({ sessionCompletedAt: -1, updatedAt: -1 })
      .limit(500)
      .lean();

    return NextResponse.json({
      stripePaid,
      interacPending,
      counts: {
        stripePaid: stripePaid.length,
        interacPending: interacPending.length,
      },
    });
  } catch (e: unknown) {
    console.error("admin accounting collections:", e);
    return NextResponse.json(
      { error: "Failed to load collections" },
      { status: 500 },
    );
  }
}
