import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { stripe, toCents } from "@/lib/stripe";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";
import Appointment from "@/models/Appointment";

// Create payout/transfer to professional
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // Only admins can trigger payouts
    if (!session?.user?.id || session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Only admins can process payouts" },
        { status: 403 },
      );
    }

    const { professionalId, appointmentIds } = await req.json();

    if (!professionalId || !appointmentIds || appointmentIds.length === 0) {
      return NextResponse.json(
        { error: "Professional ID and appointment IDs are required" },
        { status: 400 },
      );
    }

    await connectToDatabase();

    // Get professional
    const professional = await User.findById(professionalId);

    if (!professional || professional.role !== "professional") {
      return NextResponse.json(
        { error: "Professional not found" },
        { status: 404 },
      );
    }

    if (!professional.stripeConnectAccountId) {
      return NextResponse.json(
        { error: "Professional has not set up their payout account" },
        { status: 400 },
      );
    }

    // Get appointments
    const appointments = await Appointment.find({
      _id: { $in: appointmentIds },
      professionalId: professionalId,
      paymentStatus: "paid",
    });

    if (appointments.length === 0) {
      return NextResponse.json(
        { error: "No eligible appointments found for payout" },
        { status: 400 },
      );
    }

    // Calculate total payout amount
    const totalPayout = appointments.reduce(
      (sum, apt) => sum + apt.payment.professionalPayout,
      0,
    );

    // Create transfer to professional's Connect account
    const transfer = await stripe.transfers.create({
      amount: toCents(totalPayout),
      currency: "cad",
      destination: professional.stripeConnectAccountId,
      description: `Payout for ${appointments.length} completed session(s)`,
      metadata: {
        professionalId: professionalId,
        appointmentIds: appointmentIds.join(","),
        appointmentCount: appointments.length.toString(),
      },
    });

    // Update appointments with payout information
    await Appointment.updateMany(
      { _id: { $in: appointmentIds } },
      {
        $set: {
          payoutTransferId: transfer.id,
          payoutDate: new Date(),
        },
      },
    );

    return NextResponse.json({
      success: true,
      transferId: transfer.id,
      amount: totalPayout,
      appointmentCount: appointments.length,
    });
  } catch (error: unknown) {
    console.error(
      "Payout error:",
      error instanceof Error ? error.message : error,
    );
    return NextResponse.json(
      {
        error: "Failed to process payout",
        details: error instanceof Error ? error.message : error,
      },
      { status: 500 },
    );
  }
}

// GET - Check payout status
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== "professional") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    const user = await User.findById(session.user.id);

    if (!user?.stripeConnectAccountId) {
      return NextResponse.json({
        setupComplete: false,
        balance: { available: 0, pending: 0 },
      });
    }

    // Get Connect account details (external accounts for masked bank display)
    const account = await stripe.accounts.retrieve(user.stripeConnectAccountId, {
      expand: ["external_accounts"],
    });

    // Get balance
    const balance = await stripe.balance.retrieve({
      stripeAccount: user.stripeConnectAccountId,
    });

    const availableBalance = balance.available.reduce(
      (sum, b) => sum + b.amount,
      0,
    );
    const pendingBalance = balance.pending.reduce(
      (sum, b) => sum + b.amount,
      0,
    );

    let bankDetails: {
      institution?: string;
      last4?: string;
      routingNumber?: string;
      currency?: string;
    } | null = null;

    const ext = account.external_accounts?.data;
    if (ext?.length) {
      const first = ext[0];
      if (first.object === "bank_account") {
        bankDetails = {
          institution: first.bank_name ?? undefined,
          last4: first.last4 ?? undefined,
          routingNumber: first.routing_number ?? undefined,
          currency: first.currency ?? undefined,
        };
      }
    }

    let accountHolder: string | undefined;
    if (
      account.business_type === "individual" &&
      account.individual?.first_name &&
      account.individual?.last_name
    ) {
      accountHolder = `${account.individual.first_name} ${account.individual.last_name}`;
    }

    return NextResponse.json({
      setupComplete: account.charges_enabled && account.payouts_enabled,
      balance: {
        available: availableBalance / 100, // Convert from cents
        pending: pendingBalance / 100,
      },
      accountStatus: {
        chargesEnabled: account.charges_enabled,
        payoutsEnabled: account.payouts_enabled,
        detailsSubmitted: account.details_submitted,
      },
      bankDetails,
      accountHolder,
    });
  } catch (error: unknown) {
    console.error(
      "Get payout status error:",
      error instanceof Error ? error.message : error,
    );
    return NextResponse.json(
      {
        error: "Failed to get payout status",
        details: error instanceof Error ? error.message : error,
      },
      { status: 500 },
    );
  }
}
