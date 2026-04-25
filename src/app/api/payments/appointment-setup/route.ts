import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { stripe } from "@/lib/stripe";
import connectToDatabase from "@/lib/mongodb";
import Appointment from "@/models/Appointment";
import User from "@/models/User";
import Stripe from "stripe";

type PaymentMethodType = "card" | "acss_debit";

/**
 * Create a SetupIntent so the client can register a payment method (card or Canadian PAD)
 * after the professional has confirmed the appointment (status scheduled).
 * No charge is made — billing happens after the session is marked completed.
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const appointmentId = body.appointmentId as string | undefined;
    let paymentMethodType: PaymentMethodType = "card";
    if (
      body.paymentMethodType &&
      ["card", "acss_debit"].includes(body.paymentMethodType)
    ) {
      paymentMethodType = body.paymentMethodType;
    }

    if (!appointmentId) {
      return NextResponse.json(
        { error: "Appointment ID is required" },
        { status: 400 },
      );
    }

    await connectToDatabase();

    const appointment = await Appointment.findById(appointmentId).populate(
      "clientId",
      "email firstName lastName",
    );

    if (!appointment) {
      return NextResponse.json(
        { error: "Appointment not found" },
        { status: 404 },
      );
    }

    const clientDoc = appointment.clientId;
    const clientId =
      typeof clientDoc === "object" && clientDoc !== null && "_id" in clientDoc
        ? (clientDoc as { _id: { toString: () => string } })._id.toString()
        : String(clientDoc);

    if (clientId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (appointment.status !== "scheduled") {
      return NextResponse.json(
        {
          error:
            "You can only add a payment method once your professional has confirmed the appointment.",
        },
        { status: 400 },
      );
    }

    if (appointment.payment.status === "paid") {
      return NextResponse.json(
        { error: "This appointment is already paid." },
        { status: 400 },
      );
    }

    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    let customerId = user.stripeCustomerId;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: `${user.firstName} ${user.lastName}`,
        metadata: {
          userId: String(user._id),
        },
      });
      customerId = customer.id;
      user.stripeCustomerId = customerId;
      await user.save();
    }

    let setupIntentConfig: Stripe.SetupIntentCreateParams;

    if (paymentMethodType === "acss_debit") {
      setupIntentConfig = {
        customer: customerId,
        usage: "off_session",
        payment_method_types: ["acss_debit"],
        metadata: {
          appointmentId: String(appointment._id),
          purpose: "appointment_confirmation",
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
          purpose: "appointment_confirmation",
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
    console.error("Appointment setup intent error:", error);
    return NextResponse.json(
      {
        error: "Failed to create setup intent",
        details: error instanceof Error ? error.message : error,
      },
      { status: 500 },
    );
  }
}
