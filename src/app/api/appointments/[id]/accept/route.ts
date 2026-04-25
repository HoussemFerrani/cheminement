import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import connectToDatabase from "@/lib/mongodb";
import Appointment from "@/models/Appointment";
import { authOptions } from "@/lib/auth";
import { sendPaymentGuaranteeDay1Reminder } from "@/lib/notifications";

function getBaseUrl(): string {
  return (
    process.env.NEXTAUTH_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    "http://localhost:3000"
  );
}

/**
 * POST /api/appointments/[id]/accept
 * Professional accepts a proposed or general appointment
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "professional") {
      return NextResponse.json(
        { error: "Only professionals can accept appointments" },
        { status: 403 },
      );
    }

    await connectToDatabase();

    const { id } = await params;
    const appointment = await Appointment.findById(id);

    if (!appointment) {
      return NextResponse.json(
        { error: "Appointment not found" },
        { status: 404 },
      );
    }

    // Check if appointment can be accepted
    if (appointment.status !== "pending") {
      return NextResponse.json(
        { error: "Appointment is no longer pending" },
        { status: 400 },
      );
    }

    if (appointment.professionalId) {
      return NextResponse.json(
        { error: "Appointment already assigned to a professional" },
        { status: 400 },
      );
    }

    // Check if this professional is allowed to accept
    // (either proposed to them, or in general list)
    const isProposed = appointment.proposedTo?.some(
      (pId: { toString: () => string }) => pId.toString() === session.user.id,
    );
    const isGeneral =
      appointment.routingStatus === "general" ||
      appointment.routingStatus === "refused";

    if (!isProposed && !isGeneral) {
      return NextResponse.json(
        { error: "You are not authorized to accept this appointment" },
        { status: 403 },
      );
    }

    // Accept the appointment and set it as scheduled
    const updatedAppointment = await Appointment.findByIdAndUpdate(
      id,
      {
        professionalId: session.user.id,
        routingStatus: "accepted",
        status: "scheduled",
      },
      { new: true },
    )
      .populate("clientId", "firstName lastName email phone location")
      .populate("professionalId", "firstName lastName email phone");

    if (updatedAppointment && updatedAppointment.clientId) {
      const client = updatedAppointment.clientId as any;
      const billingUrl = `${getBaseUrl()}/client/dashboard/billing`;

      // Trigger Day 1 payment guarantee reminder
      await sendPaymentGuaranteeDay1Reminder({
        clientName: `${client.firstName} ${client.lastName}`.trim(),
        clientEmail: client.email,
        billingUrl,
      }).catch((err) => 
        console.error("Error sending payment guarantee reminder:", err)
      );
    }

    // TODO: Send notification to other proposed professionals that appointment is taken

    return NextResponse.json({
      message: "Appointment accepted successfully",
      appointment: updatedAppointment,
    });
  } catch (error) {
    console.error("Accept appointment error:", error);
    return NextResponse.json(
      { error: "Failed to accept appointment" },
      { status: 500 },
    );
  }
}
