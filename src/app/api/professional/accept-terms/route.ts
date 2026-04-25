import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import connectToDatabase from "@/lib/mongodb";
import Profile from "@/models/Profile";
import { authOptions } from "@/lib/auth";
import { LEGAL_VERSIONS } from "@/lib/legal";

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== "professional") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    const profile = await Profile.findOneAndUpdate(
      { userId: session.user.id },
      {
        professionalTermsAcceptedAt: new Date(),
        professionalTermsVersion: LEGAL_VERSIONS.professionalTerms,
      },
      { new: true },
    );

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    return NextResponse.json({
      acceptedAt: profile.professionalTermsAcceptedAt,
      version: profile.professionalTermsVersion,
    });
  } catch (error) {
    console.error("Accept professional terms error:", error);
    return NextResponse.json(
      { error: "Failed to accept terms" },
      { status: 500 },
    );
  }
}
