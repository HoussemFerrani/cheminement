import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import connectToDatabase from "@/lib/mongodb";
import Profile from "@/models/Profile";
import { authOptions } from "@/lib/auth";

export async function GET(
  _req: NextRequest,
  ctx: RouteContext<"/api/profile/[id]">,
) {
  try {
    const session = await getServerSession(authOptions);
    const params = await ctx.params;

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    const userId = params.id;

    // Only allow admins to fetch other users' profiles, or users to fetch their own
    if (session.user.role !== "admin" && session.user.id !== userId) {
      return NextResponse.json(
        { error: "Forbidden: You can only access your own profile" },
        { status: 403 },
      );
    }

    const profile = await Profile.findOne({ userId });

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    return NextResponse.json(profile);
  } catch (error: unknown) {
    console.error(
      "Get profile by ID error:",
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
