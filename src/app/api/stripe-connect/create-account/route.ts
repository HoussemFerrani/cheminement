import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { stripe } from "@/lib/stripe";
import connectToDatabase from "@/lib/mongodb";
import User, { IUser } from "@/models/User";

// Create Stripe Connect account for professionals
export async function POST() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== "professional") {
      return NextResponse.json(
        { error: "Only professionals can create Connect accounts" },
        { status: 403 },
      );
    }

    await connectToDatabase();

    const user: IUser | null = await User.findById(session.user.id);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if already has a Stripe Connect account
    if (user.stripeConnectAccountId) {
      return NextResponse.json({
        accountId: user.stripeConnectAccountId,
        message: "Connect account already exists",
      });
    }

    // Create Stripe Connect account
    const account = await stripe.accounts.create({
      type: "express",
      country: "CA", // Canada
      email: user.email,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
      business_type: "individual",
      metadata: {
        userId: String(user._id),
        role: "professional",
      },
    });

    // Save account ID to user
    user.stripeConnectAccountId = account.id;
    await user.save();

    // Create account link for onboarding
    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `${process.env.NEXT_PUBLIC_APP_URL}/professional/dashboard/billing?setup=refresh`,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/professional/dashboard/billing?setup=success`,
      type: "account_onboarding",
    });

    return NextResponse.json({
      accountId: account.id,
      onboardingUrl: accountLink.url,
    });
  } catch (error: unknown) {
    console.error(
      "Create Connect account error:",
      error instanceof Error ? error.message : error,
    );
    return NextResponse.json(
      {
        error: "Failed to create Connect account",
        details: error instanceof Error ? error.message : error,
      },
      { status: 500 },
    );
  }
}
