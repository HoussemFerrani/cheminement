import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";
import Appointment from "@/models/Appointment";
import Admin from "@/models/Admin";
import { authOptions } from "@/lib/auth";
import { isFieldEncryptionEnabled } from "@/lib/field-encryption";
import { mustMaskClientContactPII } from "@/lib/admin-rbac";
import { maskPhoneForDisplay } from "@/lib/contact-mask";

export async function GET(req: NextRequest) {
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
    const perms = adminRecord?.permissions;
    if (
      perms &&
      !perms.managePatients &&
      !perms.manageBilling
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const mask = perms ? mustMaskClientContactPII(perms) : false;

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "all";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    // Build query for patients (include both clients and guests)
    const query: {
      role: { $in: string[] };
      status?: string;
      $or?: Record<string, unknown>[];
    } = { role: { $in: ["client", "guest"] } };

    if (status !== "all") {
      query.status = status;
    }

    // Add search functionality
    if (search.trim()) {
      const or: Array<Record<string, unknown>> = [
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
      /* Phone is AES-GCM at rest when FIELD_ENCRYPTION_KEY is set — no substring search on ciphertext. */
      if (!isFieldEncryptionEnabled()) {
        or.push({ phone: { $regex: search, $options: "i" } });
      }
      query.$or = or;
    }

    // Get patients with pagination
    const skip = (page - 1) * limit;
    const patients = await User.find(query)
      .select("-password")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Get total count for pagination
    const total = await User.countDocuments(query);

    // Get session counts and matched professionals for each patient
    const patientsWithStats = await Promise.all(
      patients.map(async (patient) => {
        const totalSessions = await Appointment.countDocuments({
          clientId: patient._id,
          status: "completed",
        });

        // Find the most recent matched professional
        const latestAppointment = await Appointment.findOne({
          clientId: patient._id,
          status: { $in: ["scheduled", "completed"] },
        })
          .populate("professionalId", "firstName lastName")
          .sort({ createdAt: -1 })
          .lean();

        const professional = latestAppointment?.professionalId as
          | { firstName: string; lastName: string }
          | undefined;
        const matchedWith = professional
          ? `${professional.firstName} ${professional.lastName}`
          : undefined;

        // Logic for adminStatusColor and label
        let adminStatusColor = "gray";
        let adminStatusLabel = "Nouveau prospect";

        // Check for failed payments or late Interac
        const hasFailedPayment = await Appointment.exists({
          clientId: patient._id,
          "payment.status": "failed",
        });

        const hasLateInterac = await Appointment.exists({
          clientId: patient._id,
          "payment.status": { $ne: "paid" },
          "payment.transferDueAt": { $lt: new Date() },
        });

        if (hasFailedPayment || hasLateInterac) {
          adminStatusColor = "red";
          adminStatusLabel = "Échec de paiement";
        } else if (patient.paymentGuaranteeStatus === "green") {
          adminStatusColor = "green";
          adminStatusLabel = "Ok";
        } else {
          const scheduledAppointment = await Appointment.findOne({
            clientId: patient._id,
            status: "scheduled",
          }).lean();

          if (scheduledAppointment) {
            adminStatusColor = "yellow";
            adminStatusLabel = "RDV fixé sans carte";
          } else {
            // Default to Gray / Nouveau prospect
            adminStatusColor = "gray";
            adminStatusLabel = "Nouveau prospect";
          }
        }

        return {
          id: patient._id.toString(),
          name: `${patient.firstName} ${patient.lastName}`,
          email: patient.email,
          phone: mask
            ? maskPhoneForDisplay(String(patient.phone || ""))
            : patient.phone || "",
          status: patient.status,
          role: patient.role, // Include role to identify guests
          matchedWith,
          joinedDate: patient.createdAt.toISOString().split("T")[0],
          totalSessions,
          issueType: "General", // This would come from appointment data or profile
          adminStatusColor,
          adminStatusLabel,
        };

      }),
    );

    // Get summary stats (include both clients and guests)
    const totalPatients = await User.countDocuments({
      role: { $in: ["client", "guest"] },
    });
    const activePatients = await User.countDocuments({
      role: { $in: ["client", "guest"] },
      status: "active",
    });
    const pendingPatients = await User.countDocuments({
      role: { $in: ["client", "guest"] },
      status: "pending",
    });
    const totalSessions = await Appointment.countDocuments({
      status: "completed",
    });

    return NextResponse.json({
      patients: patientsWithStats,
      summary: {
        totalPatients,
        activePatients,
        pendingPatients,
        totalSessions,
      },
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error: unknown) {
    console.error("Admin patients API error:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch patients data",
        details: error instanceof Error ? error.message : error,
      },
      { status: 500 },
    );
  }
}
