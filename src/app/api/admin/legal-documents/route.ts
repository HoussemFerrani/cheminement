import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectToDatabase from "@/lib/mongodb";
import Admin from "@/models/Admin";
import { listLegalDocuments } from "@/lib/legal-content";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || !session.user.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    const admin = await Admin.findOne({
      userId: session.user.id,
      isActive: true,
    });

    if (!admin) {
      return NextResponse.json(
        { error: "No admin record found for this user" },
        { status: 403 },
      );
    }

    if (!admin.permissions?.manageContent) {
      return NextResponse.json(
        {
          error: `Missing permission: manageContent (current role: ${admin.role})`,
        },
        { status: 403 },
      );
    }

    const docs = await listLegalDocuments();
    return NextResponse.json(docs);
  } catch (error) {
    console.error("List legal documents error:", error);
    return NextResponse.json(
      {
        error: "Failed to load documents",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
