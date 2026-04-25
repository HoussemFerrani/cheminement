import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import connectToDatabase from "@/lib/mongodb";
import Profile from "@/models/Profile";
import { authOptions } from "@/lib/auth";
import { LEGAL_VERSIONS } from "@/lib/legal";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    const profile = await Profile.findOne({ userId: session.user.id });

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    return NextResponse.json(profile);
  } catch (error: unknown) {
    console.error(
      "Get profile error:",
      error instanceof Error ? error.message : error,
    );
    return NextResponse.json(
      {
        error: "Failed to fetch profile",
        details: error instanceof Error ? error.message : error,
      },
      { status: 500 },
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    const { acceptProfessionalTerms, ...data } = await req.json();

    const existing = await Profile.findOne({ userId: session.user.id });
    const now = new Date();

    const update: Record<string, unknown> = { ...data };
    if (acceptProfessionalTerms === true) {
      update.professionalTermsAcceptedAt = now;
      update.professionalTermsVersion = LEGAL_VERSIONS.professionalTerms;
    }

    const termsAccepted =
      Boolean(existing?.professionalTermsAcceptedAt) ||
      acceptProfessionalTerms === true;

    if (termsAccepted) {
      update.profileCompleted = true;
    }

    const profile = await Profile.findOneAndUpdate(
      { userId: session.user.id },
      update,
      { new: true, upsert: true },
    );

    return NextResponse.json(profile);
  } catch (error: unknown) {
    console.error(
      "Update profile error:",
      error instanceof Error ? error.message : error,
    );
    return NextResponse.json(
      {
        error: "Failed to update profile",
        details: error instanceof Error ? error.message : error,
      },
      { status: 500 },
    );
  }
}
