import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";

// POST - Create a setup intent for guest users to collect payment method
export async function POST(req: NextRequest) {
  try {
    const { email, name } = await req.json();

    if (!email || !name) {
      return NextResponse.json(
        { error: "Email and name are required" },
        { status: 400 },
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 },
      );
    }

    // Check if customer already exists with this email
    const existingCustomers = await stripe.customers.list({
      email: email.toLowerCase(),
      limit: 1,
    });

    let customerId: string;

    if (existingCustomers.data.length > 0) {
      // Use existing customer
      customerId = existingCustomers.data[0].id;
    } else {
      // Create a new Stripe customer for the guest
      const customer = await stripe.customers.create({
        email: email.toLowerCase(),
        name: name,
        metadata: {
          type: "guest",
          createdAt: new Date().toISOString(),
        },
      });
      customerId = customer.id;
    }

    // Create setup intent for the guest customer
    const setupIntent = await stripe.setupIntents.create({
      customer: customerId,
      payment_method_types: ["card"],
      usage: "off_session",
      metadata: {
        guestEmail: email.toLowerCase(),
        guestName: name,
        type: "guest_booking",
      },
    });

    return NextResponse.json({
      clientSecret: setupIntent.client_secret,
      setupIntentId: setupIntent.id,
      customerId: customerId,
    });
  } catch (error: unknown) {
    console.error("Guest setup intent creation error:", error);
    return NextResponse.json(
      {
        error: "Failed to create setup intent",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
