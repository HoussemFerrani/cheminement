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
    
    const admin = await Admin.findOne({ userId: session.user.id, isActive: true })
      .select("permissions")
      .lean();
    if (!admin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const user = await User.findById(id);
    
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Set to green and explicitly mark as interac_trust for the blue badge
    user.paymentGuaranteeStatus = "green";
    user.paymentGuaranteeSource = "interac_trust";
    await user.save();

    return NextResponse.json({ success: true, status: "green", source: "interac_trust" });
  } catch (error) {
    console.error("Admin approve guarantee error:", error);
    return NextResponse.json(
      { error: "Failed to approve guarantee", details: error instanceof Error ? error.message : error },
      { status: 500 },
    );
  }
}
