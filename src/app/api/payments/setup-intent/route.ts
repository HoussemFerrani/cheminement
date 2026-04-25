import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { stripe } from "@/lib/stripe";
import User from "@/models/User";
import connectToDatabase from "@/lib/mongodb";
import Stripe from "stripe";

type PaymentMethodType = "card" | "acss_debit";

// POST - Create a setup intent for adding payment methods
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    // Get or create Stripe customer
    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    let customerId = user.stripeCustomerId;

    // Create customer if doesn't exist
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

    // Get payment method type from request body
    let paymentMethodType: PaymentMethodType = "card";
    try {
      const body = await req.json();
      if (
        body.paymentMethodType &&
        ["card", "acss_debit"].includes(body.paymentMethodType)
      ) {
        paymentMethodType = body.paymentMethodType;
      }
    } catch {
      // Default to card if no body provided
    }

    // Configure setup intent based on payment method type
    let setupIntentConfig: Stripe.SetupIntentCreateParams;

    if (paymentMethodType === "acss_debit") {
      setupIntentConfig = {
        customer: customerId,
        usage: "off_session",
        payment_method_types: ["acss_debit"],
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
      };
    }

    // Create setup intent
    const setupIntent = await stripe.setupIntents.create(setupIntentConfig);

    return NextResponse.json({
      clientSecret: setupIntent.client_secret,
      setupIntentId: setupIntent.id,
      paymentMethodType,
    });
  } catch (error: unknown) {
    console.error("Setup intent creation error:", error);
    return NextResponse.json(
      {
        error: "Failed to create setup intent",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
