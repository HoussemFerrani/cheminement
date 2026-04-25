import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";
import { authOptions } from "@/lib/auth";
import {
  linkGuardian,
  unlinkGuardian,
  getGuardian,
  getManagedAccounts,
  isMinor,
} from "@/lib/guardian-utils";

/**
 * GET /api/users/guardian
 * Get guardian information for current user or get managed accounts
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const action = searchParams.get("action"); // "guardian" or "managed"

    if (action === "guardian") {
      // Get guardian for current user
      const guardian = await getGuardian(session.user.id);
      return NextResponse.json({ guardian });
    } else if (action === "managed") {
      // Get accounts managed by current user
      console.log("Fetching managed accounts for user:", session.user.id);
      const managedAccounts = await getManagedAccounts(session.user.id);
      console.log("Found managed accounts:", managedAccounts.length);
      
      // Convert to plain objects for JSON serialization
      const serializedAccounts = managedAccounts.map((account) => ({
        _id: account._id.toString(),
        firstName: account.firstName,
        lastName: account.lastName,
        email: account.email,
        dateOfBirth: account.dateOfBirth ? account.dateOfBirth.toISOString() : undefined,
        phone: account.phone,
        status: account.status,
      }));
      console.log("Serialized accounts:", serializedAccounts);
      return NextResponse.json({ managedAccounts: serializedAccounts });
    } else {
      // Return both
      const guardian = await getGuardian(session.user.id);
      const managedAccounts = await getManagedAccounts(session.user.id);
      return NextResponse.json({ guardian, managedAccounts });
    }
  } catch (error) {
    console.error("Error getting guardian info:", error);
    return NextResponse.json(
      { error: "Failed to get guardian information" },
      { status: 500 },
    );
  }
}

/**
 * POST /api/users/guardian
 * Link a guardian to a minor account
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    const body = await req.json();
    const { minorUserId, guardianUserId } = body;

    // Validate that the requesting user is either the minor or the guardian
    if (
      minorUserId !== session.user.id &&
      guardianUserId !== session.user.id
    ) {
      return NextResponse.json(
        { error: "You can only link guardians for your own account or as a guardian" },
        { status: 403 },
      );
    }

    const result = await linkGuardian(minorUserId, guardianUserId || session.user.id);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: "Guardian linked successfully" });
  } catch (error) {
    console.error("Error linking guardian:", error);
    return NextResponse.json(
      { error: "Failed to link guardian" },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/users/guardian
 * Unlink a guardian from a minor account
 */
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const minorUserId = searchParams.get("minorUserId");

    if (!minorUserId) {
      return NextResponse.json(
        { error: "minorUserId is required" },
        { status: 400 },
      );
    }

    // Verify the requesting user is the guardian or the minor
    const user = await User.findById(minorUserId);
    if (
      minorUserId !== session.user.id &&
      user?.guardianId?.toString() !== session.user.id
    ) {
      return NextResponse.json(
        { error: "You can only unlink guardians for your own account or as a guardian" },
        { status: 403 },
      );
    }

    const result = await unlinkGuardian(minorUserId);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: "Guardian unlinked successfully" });
  } catch (error) {
    console.error("Error unlinking guardian:", error);
    return NextResponse.json(
      { error: "Failed to unlink guardian" },
      { status: 500 },
    );
  }
}
