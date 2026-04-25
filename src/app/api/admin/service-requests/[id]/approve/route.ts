import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import connectToDatabase from "@/lib/mongodb";
import Appointment from "@/models/Appointment";
import { authOptions } from "@/lib/auth";
import { sendServiceRequestOnboardingEmail } from "@/lib/notifications";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    const appointmentId = (await params).id;
    if (!appointmentId) {
      return NextResponse.json({ error: "Missing appointment id" }, { status: 400 });
    }

    const { target } = await req.json(); // "requester" | "loved-one"
    if (!["requester", "loved-one"].includes(String(target))) {
      return NextResponse.json({ error: "Invalid target" }, { status: 400 });
    }

    const appointment = await Appointment.findById(appointmentId).populate(
      "clientId",
      "firstName lastName email language",
    );

    if (!appointment) {
      return NextResponse.json({ error: "Appointment not found" }, { status: 404 });
    }

    if (appointment.bookingFor !== "loved-one") {
      return NextResponse.json({ error: "Not a loved-one request" }, { status: 400 });
    }

    if (appointment.accountActivationStatus !== "pending_admin") {
      return NextResponse.json(
        { error: "This request is not pending admin activation" },
        { status: 400 },
      );
    }

    const client = appointment.clientId as unknown as {
      firstName?: string;
      lastName?: string;
      email?: string;
      language?: string;
      _id?: string;
    } | null;

    if (!client?.email) {
      return NextResponse.json({ error: "Requester email missing" }, { status: 400 });
    }

    const lang: "fr" | "en" = client.language === "fr" ? "fr" : "en";

    const lovedOne = appointment.lovedOneInfo;
    if (!lovedOne) {
      return NextResponse.json({ error: "Missing loved one info" }, { status: 400 });
    }

    let toEmail = client.email;
    let toName = `${client.firstName ?? ""} ${client.lastName ?? ""}`.trim() || "Client";

    if (String(target) === "loved-one") {
      const emailFallback = `${String(lovedOne.firstName ?? "")
        .toLowerCase()
        .replace(/\s+/g, "")}.${String(lovedOne.lastName ?? "")
        .toLowerCase()
        .replace(/\s+/g, "")}@client.cheminement.ca`;

      toEmail = lovedOne.email || emailFallback;
      toName = `${lovedOne.firstName ?? ""} ${lovedOne.lastName ?? ""}`.trim() || "Loved one";
    }

    await sendServiceRequestOnboardingEmail({
      toName,
      toEmail,
      locale: lang,
    });

    appointment.accountActivationStatus =
      String(target) === "requester" ? "sent_to_requester" : "sent_to_loved_one";
    appointment.accountActivationSentAt = new Date();
    await appointment.save();

    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    console.error("admin service-requests approve error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to approve" },
      { status: 500 },
    );
  }
}

