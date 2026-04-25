import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import connectToDatabase from "@/lib/mongodb";
import MedicalProfile from "@/models/MedicalProfile";
import { authOptions } from "@/lib/auth";
import {
  getActiveAdminPermissions,
  mustMaskClientContactPII,
  applyMedicalProfileContactMask,
} from "@/lib/admin-rbac";
import { logAdminClientAccess } from "@/lib/admin-access-log";
import { PROFESSIONAL_CLIENT_APPOINTMENT_STATUSES } from "@/lib/professional-client-access";

export async function GET(
  req: NextRequest,
  ctx: RouteContext<"/api/medical-profile/[id]">,
) {
  try {
    const session = await getServerSession(authOptions);
    const params = await ctx.params;

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    const userId = params.id;

    // Only allow admins to fetch other users' medical profiles, or users to fetch their own, or professionals to fetch clients they have appointments with
    if (session.user.role !== "admin" && session.user.id !== userId) {
      if (session.user.role === "professional") {
        // Check if professional has appointments with this client
        const Appointment = (await import("@/models/Appointment")).default;
        const hasAppointment = await Appointment.findOne({
          professionalId: session.user.id,
          clientId: userId,
          status: { $in: Array.from(PROFESSIONAL_CLIENT_APPOINTMENT_STATUSES) },
        });
        if (!hasAppointment) {
          return NextResponse.json(
            {
              error:
                "Forbidden: You can only access medical profiles of clients you have appointments with",
            },
            { status: 403 },
          );
        }
      } else {
        return NextResponse.json(
          { error: "Forbidden: You can only access your own medical profile" },
          { status: 403 },
        );
      }
    }

    const medicalProfile = await MedicalProfile.findOne({ userId });

    if (!medicalProfile) {
      return NextResponse.json(
        { error: "Medical profile not found" },
        { status: 404 },
      );
    }

    if (session.user.role === "admin" && session.user.id !== userId) {
      void logAdminClientAccess({
        actorUserId: session.user.id,
        resourceUserId: userId,
        action: "view_client_medical_profile",
        req,
      });
      const perms = await getActiveAdminPermissions(session.user.id);
      const mask = mustMaskClientContactPII(perms);
      const plain = medicalProfile.toObject() as unknown as Record<
        string,
        unknown
      >;
      return NextResponse.json(applyMedicalProfileContactMask(plain, mask));
    }

    return NextResponse.json(medicalProfile);
  } catch (error: unknown) {
    console.error("Get medical profile by ID error:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch medical profile",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
