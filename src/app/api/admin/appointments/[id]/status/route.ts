import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import connectToDatabase from "@/lib/mongodb";
import Appointment from "@/models/Appointment";
import Admin from "@/models/Admin";
import { authOptions } from "@/lib/auth";

const ALLOWED_STATUSES = ["scheduled", "completed", "cancelled", "no-show", "pending", "ongoing"];

// PUT /api/admin/appointments/[id]/status — Override appointment status
export async function PUT(
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
    const body = await req.json();
    const { status } = body;

    if (!status || !ALLOWED_STATUSES.includes(status)) {
      return NextResponse.json(
        { error: `Status must be one of: ${ALLOWED_STATUSES.join(", ")}` },
        { status: 400 },
      );
    }

    const updates: Record<string, unknown> = { status };
    if (status === "completed") {
      updates.sessionCompletedAt = new Date();
    }
    if (status === "cancelled") {
      updates.cancelledBy = "admin";
      updates.cancelledAt = new Date();
    }

    const appointment = await Appointment.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true },
    );
    if (!appointment) {
      return NextResponse.json({ error: "Appointment not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, status: appointment.status });
  } catch (error) {
    console.error("Admin appointment status update error:", error);
    return NextResponse.json(
      { error: "Failed to update status", details: error instanceof Error ? error.message : error },
      { status: 500 },
    );
  }
}
