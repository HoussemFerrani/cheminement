import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import connectToDatabase from "@/lib/mongodb";
import Appointment from "@/models/Appointment";
import User from "@/models/User";
import { stripe, toCents } from "@/lib/stripe";

// GET - Get appointment details by payment token
export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json(
        { error: "Payment token is required" },
        { status: 400 },
      );
    }

    const appointment = await Appointment.findOne({
      "payment.paymentToken": token,
      "payment.paymentTokenExpiry": { $gt: new Date() },
    })
      .populate(
        "clientId",
        "firstName lastName email paymentGuaranteeStatus paymentGuaranteeSource",
      )
      .populate("professionalId", "firstName lastName");

    if (!appointment) {
      return NextResponse.json(
        { error: "Invalid or expired payment link" },
        { status: 404 },
      );
    }

    // Check if appointment is still valid
    if (appointment.status === "cancelled") {
      return NextResponse.json(
        { error: "This appointment has been cancelled" },
        { status: 400 },
      );
    }

    const client = appointment.clientId as unknown as {
      firstName: string;
      lastName: string;
      email: string;
      paymentGuaranteeStatus?: string;
      paymentGuaranteeSource?: string;
    };

    const interacTrustGreen =
      client.paymentGuaranteeStatus === "green" &&
      client.paymentGuaranteeSource === "interac_trust";
    const interacTrustPending =
      client.paymentGuaranteeStatus === "pending_admin" &&
      appointment.payment?.method === "transfer";

    const professional = appointment.professionalId as unknown as {
      firstName?: string;
      lastName?: string;
    } | null;

    return NextResponse.json({
      appointmentId: appointment._id,
      date: appointment.date,
      time: appointment.time,
      duration: appointment.duration,
      type: appointment.type,
      therapyType: appointment.therapyType,
      price: appointment.payment.price,
      guestName: `${client.firstName} ${client.lastName}`,
      guestEmail: client.email,
      professionalName: professional
        ? `${professional.firstName ?? ""} ${professional.lastName ?? ""}`.trim() ||
          "Professional"
        : "Professional",
      alreadyPaid: appointment.payment.status === "paid",
      paidAt: appointment.payment.paidAt,
      appointmentStatus: appointment.status,
      hasPaymentMethodOnFile:
        Boolean(appointment.payment.stripePaymentMethodId) || interacTrustGreen,
      interacTrustPending,
    });
  } catch (error) {
    console.error("Error fetching guest appointment:", error);
    return NextResponse.json(
      { error: "Failed to fetch appointment details" },
      { status: 500 },
    );
  }
}

// POST - Create payment intent for guest payment
export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();

    const { token, paymentMethod = "card" } = await req.json();

    if (!token) {
      return NextResponse.json(
        { error: "Payment token is required" },
        { status: 400 },
      );
    }

    const validPaymentMethods = ["card", "direct_debit"];
    if (!validPaymentMethods.includes(paymentMethod)) {
      return NextResponse.json(
        { error: "Invalid payment method" },
        { status: 400 },
      );
    }

    const appointment = await Appointment.findOne({
      "payment.paymentToken": token,
      "payment.paymentTokenExpiry": { $gt: new Date() },
    })
      .populate("clientId", "firstName lastName email stripeCustomerId")
      .populate("professionalId", "firstName lastName");

    if (!appointment) {
      return NextResponse.json(
        { error: "Invalid or expired payment link" },
        { status: 404 },
      );
    }

    // Check if already paid
    if (appointment.payment.status === "paid") {
      return NextResponse.json(
        { error: "This appointment has already been paid" },
        { status: 400 },
      );
    }

    if (appointment.status === "pending") {
      return NextResponse.json(
        {
          error:
            "This appointment is not yet confirmed by your professional.",
        },
        { status: 400 },
      );
    }

    if (
      appointment.status === "cancelled" ||
      appointment.status === "no-show"
    ) {
      return NextResponse.json(
        { error: "This appointment is not available for payment" },
        { status: 400 },
      );
    }

    // Guest pays the session fee only after it is marked completed
    if (appointment.status !== "completed") {
      return NextResponse.json(
        {
          error:
            "Payment opens after your session is completed. Use the same link to register a payment method first, then pay once your professional has marked the meeting as done.",
        },
        { status: 400 },
      );
    }

    const client = appointment.clientId as unknown as {
      _id: { toString: () => string };
      email: string;
      firstName: string;
      lastName: string;
      stripeCustomerId?: string;
    };

    const professional = appointment.professionalId as unknown as {
      _id: { toString: () => string };
      firstName?: string;
      lastName?: string;
    } | null;

    if (!professional?._id) {
      return NextResponse.json(
        {
          error:
            "This appointment has no professional assigned. Please contact support.",
        },
        { status: 400 },
      );
    }

    const amount = appointment.payment.price;

    if (typeof amount !== "number" || amount <= 0 || !Number.isFinite(amount)) {
      return NextResponse.json(
        { error: "Invalid session amount for payment." },
        { status: 400 },
      );
    }

    const platformFee = appointment.payment.platformFee;
    const professionalPayout = appointment.payment.professionalPayout;

    // Get or create Stripe customer for guest
    let customerId = client.stripeCustomerId;

    if (!customerId) {
      const existingCustomers = await stripe.customers.list({
        email: client.email.toLowerCase(),
        limit: 1,
      });

      if (existingCustomers.data.length > 0) {
        customerId = existingCustomers.data[0].id;
      } else {
        const customer = await stripe.customers.create({
          email: client.email.toLowerCase(),
          name: `${client.firstName} ${client.lastName}`,
          metadata: {
            visitorId: client._id.toString(),
            type: "guest",
          },
        });
        customerId = customer.id;
      }

      // Update guest user with Stripe customer ID
      await User.findByIdAndUpdate(client._id, {
        stripeCustomerId: customerId,
      });
    }

    // Configure payment method types based on selected method
    let paymentMethodTypes: string[] = ["card"];

    if (paymentMethod === "direct_debit") {
      paymentMethodTypes = ["acss_debit"];
    } else {
      paymentMethodTypes = ["card"];
    }

    // Create Payment Intent config
    const paymentIntentConfig: Parameters<
      typeof stripe.paymentIntents.create
    >[0] = {
      amount: toCents(amount),
      currency: "cad",
      customer: customerId,
      metadata: {
        appointmentId: String(appointment._id),
        visitorId: client._id.toString(),
        visitorEmail: client.email,
        professionalId: professional._id.toString(),
        sessionDate: appointment.date ? appointment.date.toISOString() : "N/A",
        sessionTime: appointment.time || "N/A",
        platformFee: platformFee.toString(),
        professionalPayout: professionalPayout.toString(),
        type: "guest_payment",
        paymentMethod: paymentMethod,
      },
      description: `Therapy session with ${professional.firstName ?? ""} ${professional.lastName ?? ""} on ${appointment.date ? appointment.date.toLocaleDateString() : "TBD"}`,
      payment_method_types: paymentMethodTypes,
    };

    // Add payment method options for direct debit (ACSS)
    if (paymentMethod === "direct_debit") {
      paymentIntentConfig.payment_method_options = {
        acss_debit: {
          mandate_options: {
            payment_schedule: "sporadic",
            transaction_type: "personal",
          },
          verification_method: "automatic",
        },
      };
    }

    const paymentIntent =
      await stripe.paymentIntents.create(paymentIntentConfig);

    // Update appointment payment information
    appointment.payment.stripePaymentIntentId = paymentIntent.id;
    appointment.payment.status = "processing";
    appointment.payment.method = paymentMethod;
    await appointment.save();

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: amount,
      currency: "CAD",
    });
  } catch (error: unknown) {
    if (error instanceof Stripe.errors.StripeError) {
      console.error("Guest payment intent (Stripe):", error.message, error.code);
      const status =
        typeof error.statusCode === "number" &&
        error.statusCode >= 400 &&
        error.statusCode < 500
          ? error.statusCode
          : 400;
      return NextResponse.json(
        {
          error: error.message,
          code: error.code,
          type: error.type,
        },
        { status },
      );
    }
    console.error("Error creating guest payment intent:", error);
    return NextResponse.json(
      {
        error: "Failed to create payment intent",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
