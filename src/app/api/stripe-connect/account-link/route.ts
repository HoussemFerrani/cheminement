import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { stripe } from "@/lib/stripe";
import connectToDatabase from "@/lib/mongodb";
import User, { IUser } from "@/models/User";

function billingBaseUrl(): string {
  return (
    process.env.NEXTAUTH_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    "http://localhost:3000"
  );
}

/**
 * Creates a Stripe Connect Express Account Link so the professional can
 * complete onboarding or update payout/bank details (account_update).
 */
export async function POST() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== "professional") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await connectToDatabase();

    const user: IUser | null = await User.findById(session.user.id);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    let accountId = user.stripeConnectAccountId;

    if (!accountId) {
      const account = await stripe.accounts.create({
        type: "express",
        country: "CA",
        email: user.email ?? undefined,
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

      accountId = account.id;
      user.stripeConnectAccountId = accountId;
      await user.save();
    }

    const account = await stripe.accounts.retrieve(accountId);

    const onboardingComplete =
      account.details_submitted === true &&
      account.charges_enabled === true &&
      account.payouts_enabled === true;

    const linkType = onboardingComplete
      ? "account_update"
      : "account_onboarding";

    const base = billingBaseUrl();
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${base}/professional/dashboard/billing?setup=refresh`,
      return_url: `${base}/professional/dashboard/billing?setup=success`,
      type: linkType,
    });

    return NextResponse.json({ url: accountLink.url });
  } catch (error: unknown) {
    console.error(
      "Stripe Connect account link error:",
      error instanceof Error ? error.message : error,
    );
    return NextResponse.json(
      {
        error: "Failed to open Stripe Connect",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
