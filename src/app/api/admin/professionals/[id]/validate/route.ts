import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";
import Admin from "@/models/Admin";
import { authOptions } from "@/lib/auth";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    await connectToDatabase();

    const adminRecord = await Admin.findOne({
      userId: session.user.id,
      isActive: true,
    })
      .select("permissions")
      .lean();

    if (adminRecord?.permissions && !adminRecord.permissions.managePatients) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    if (!id || id === "undefined" || id.length !== 24) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    const user = await User.findById(id);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    if (user.role !== "professional") {
      return NextResponse.json(
        { error: "User is not a professional" },
        { status: 400 },
      );
    }

    user.status = "active";
    user.professionalLicenseStatus = "verified";
    await user.save();

    return NextResponse.json({
      success: true,
      status: user.status,
      professionalLicenseStatus: user.professionalLicenseStatus,
    });
  } catch (error) {
    console.error("Admin force-validate professional error:", error);
    return NextResponse.json(
      {
        error: "Failed to validate professional",
        details: error instanceof Error ? error.message : error,
      },
      { status: 500 },
    );
  }
}
