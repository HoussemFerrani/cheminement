import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectToDatabase from "@/lib/mongodb";
import ClientReceipt from "@/models/ClientReceipt";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    const list = await ClientReceipt.find({ clientId: session.user.id })
      .sort({ issuedAt: -1 })
      .limit(200)
      .lean();

    return NextResponse.json(list);
  } catch (e: unknown) {
    console.error("GET /api/client/receipts:", e);
    return NextResponse.json(
      { error: "Failed to list receipts" },
      { status: 500 },
    );
  }
}
