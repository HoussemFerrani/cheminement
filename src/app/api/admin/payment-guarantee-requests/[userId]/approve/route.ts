import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";
import { authOptions } from "@/lib/auth";
import { approveInteracTrustGreen } from "@/lib/payment-guarantee";
import { getActiveAdminPermissions } from "@/lib/admin-rbac";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> },
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { userId } = await params;

    await connectToDatabase();

    const adminPerms = await getActiveAdminPermissions(session.user.id);
    if (adminPerms && !adminPerms.managePatients) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.paymentGuaranteeStatus !== "pending_admin") {
      return NextResponse.json(
        {
          error:
            "Ce client n’est pas en attente de validation pour une entente Interac.",
        },
        { status: 400 },
      );
    }

    await approveInteracTrustGreen(userId);

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("approve interac trust:", error);
    return NextResponse.json(
      { error: "Failed to approve" },
      { status: 500 },
    );
  }
}
