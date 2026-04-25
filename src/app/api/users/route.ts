import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";
import Profile from "@/models/Profile";
import { authOptions } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const role = searchParams.get("role");

    // Allow unauthenticated access for fetching professionals (for guest booking)
    // Require authentication for other roles
    if (role !== "professional") {
      const session = await getServerSession(authOptions);

      if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    const query: { role?: string; status?: string } = {};

    if (role) {
      query.role = role;

      // For professionals, only show active ones with availability schedule
      if (role === "professional") {
        query.status = "active";
      }
    }

    // If professional, only show clients they have appointments with
    // For now, return all users based on role filter
    const users = await User.find(query)
      .select("-password")
      .sort({ createdAt: -1 });

    // If fetching professionals, filter those with availability schedule
    if (role === "professional") {
      const usersWithSchedule = await Promise.all(
        users.map(async (user) => {
          const profile = await Profile.findOne({ userId: user._id });

          // Only include professionals with availability schedule configured
          if (
            profile?.availability?.days &&
            profile.availability.days.length > 0 &&
            profile.availability.days.some((day) => day.isWorkDay)
          ) {
            return {
              ...user.toObject(),
              hasSchedule: true,
            };
          }
          return null;
        }),
      );

      // Filter out null values (professionals without schedule)
      const activeProfessionals = usersWithSchedule.filter(
        (user) => user !== null,
      );

      return NextResponse.json(activeProfessionals);
    }

    return NextResponse.json(users);
  } catch (error: unknown) {
    console.error(
      "Get users error:",
      error instanceof Error ? error.message : error,
    );
    return NextResponse.json(
      {
        error: "Failed to fetch users",
        details: error instanceof Error ? error.message : error,
      },
      { status: 500 },
    );
  }
}
