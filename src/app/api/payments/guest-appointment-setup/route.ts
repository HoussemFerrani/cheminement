import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Appointment from "@/models/Appointment";
import User from "@/models/User";
import { stripe } from "@/lib/stripe";
import Stripe from "stripe";

type PaymentMethodType = "card" | "acss_debit";

/**
 * Guest: SetupIntent to register payment method after professional confirmed (scheduled).
 * Validated with the same payment token as the /pay page.
 */
export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();

    const body = await req.json();
    const token = body.token as string | undefined;
    let paymentMethodType: PaymentMethodType = "card";
    if (
      body.paymentMethodType &&
      ["card", "acss_debit"].includes(body.paymentMethodType)
    ) {
      paymentMethodType = body.paymentMethodType;
    }

    if (!token) {
      return NextResponse.json(
        { error: "Payment token is required" },
        { status: 400 },
      );
    }

    const appointment = await Appointment.findOne({
      "payment.paymentToken": token,
      "payment.paymentTokenExpiry": { $gt: new Date() },
    }).populate("clientId", "email firstName lastName stripeCustomerId");

    if (!appointment) {
      return NextResponse.json(
        { error: "Invalid or expired payment link" },
        { status: 404 },
      );
    }

    if (appointment.status === "cancelled") {
      return NextResponse.json(
        { error: "This appointment has been cancelled" },
        { status: 400 },
      );
    }

    if (appointment.status !== "scheduled") {
      return NextResponse.json(
        {
          error:
            "You can only confirm with a payment method after your appointment has been confirmed by your professional.",
        },
        { status: 400 },
      );
    }

    if (appointment.payment.status === "paid") {
      return NextResponse.json(
        { error: "This appointment is already paid" },
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

      await User.findByIdAndUpdate(client._id, {
        stripeCustomerId: customerId,
      });
    }

    let setupIntentConfig: Stripe.SetupIntentCreateParams;

    if (paymentMethodType === "acss_debit") {
      setupIntentConfig = {
        customer: customerId,
        usage: "off_session",
        payment_method_types: ["acss_debit"],
        metadata: {
          appointmentId: String(appointment._id),
          purpose: "guest_appointment_confirmation",
          paymentToken: token,
        },
        payment_method_options: {
          acss_debit: {
            currency: "cad",
            mandate_options: {
              payment_schedule: "sporadic",
              transaction_type: "personal",
            },
            verification_method: "automatic",
          },
        },
      };
    } else {
      setupIntentConfig = {
        customer: customerId,
        usage: "off_session",
        payment_method_types: ["card"],
        metadata: {
          appointmentId: String(appointment._id),
          purpose: "guest_appointment_confirmation",
          paymentToken: token,
        },
      };
    }

    const setupIntent = await stripe.setupIntents.create(setupIntentConfig);

    return NextResponse.json({
      clientSecret: setupIntent.client_secret,
      setupIntentId: setupIntent.id,
      paymentMethodType,
    });
  } catch (error: unknown) {
    console.error("Guest appointment setup intent error:", error);
    return NextResponse.json(
      {
        error: "Failed to create setup intent",
        details: error instanceof Error ? error.message : error,
      },
      { status: 500 },
    );
  }
}
