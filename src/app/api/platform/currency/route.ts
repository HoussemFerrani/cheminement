import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import PlatformSettings from "@/models/PlatformSettings";

/**
 * Public read-only currency for checkout UI (clients are not admins).
 */
export async function GET() {
  try {
    await connectToDatabase();
    const settings = await PlatformSettings.findOne().select("currency").lean();
    const currency =
      settings && typeof settings.currency === "string"
        ? settings.currency
        : "CAD";
    return NextResponse.json({ currency });
  } catch (error: unknown) {
    console.error("Get platform currency error:", error);
    return NextResponse.json({ currency: "CAD" });
  }
}
