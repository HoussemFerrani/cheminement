import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      firstName,
      lastName,
      email,
      phone,
      company,
      position,
      coordinates,
    } = body;

    // Validate required fields
    if (!firstName || !lastName || !email || !phone || !company || !position) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    await connectToDatabase();

    // TODO: Save to database if needed (create EnterpriseContact model)
    // TODO: Send email notification using notification system
    
    // Log the contact request for now
    console.log("Enterprise contact request received:", {
      firstName,
      lastName,
      email,
      phone,
      company,
      position,
      coordinates,
    });

    return NextResponse.json({
      success: true,
      message: "Contact request submitted successfully",
    });
  } catch (error) {
    console.error("Error processing enterprise contact:", error);
    return NextResponse.json(
      { error: "Failed to process contact request" },
      { status: 500 },
    );
  }
}
