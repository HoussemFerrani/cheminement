import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import connectToDatabase from "@/lib/mongodb";
import Appointment from "@/models/Appointment";
import { authOptions } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "all";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    // Build query for appointments (which represent billable sessions)
    const query: any = {
      status: { $in: ["completed", "scheduled", "cancelled", "no-show"] },
    };

    if (status !== "all") {
      if (status === "paid") {
        query.status = "completed"; // Assuming completed sessions are paid
      } else if (status === "pending") {
        query.status = { $in: ["scheduled"] }; // Upcoming sessions
      } else if (status === "upcoming") {
        query.status = "scheduled";
        query.date = { $gte: new Date() };
      } else if (status === "processing") {
        query.status = "completed"; // Recently completed, processing payment
        query.updatedAt = { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }; // Last 24 hours
      } else if (status === "overdue") {
        query.status = "completed";
        query.date = { $lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }; // Over 30 days old
      }
    }

    // Add search functionality
    if (search.trim()) {
      // We need to search in populated fields, so we'll handle this after population
    }

    // Get appointments with pagination
    const skip = (page - 1) * limit;
    const appointments = await Appointment.find(query)
      .populate("clientId", "firstName lastName email")
      .populate("professionalId", "firstName lastName")
      .sort({ date: -1, time: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Filter by search if provided
    let filteredAppointments = appointments;
    if (search.trim()) {
      filteredAppointments = appointments.filter((appointment) => {
        const client = appointment.clientId as any;
        const professional = appointment.professionalId as any;
        const searchTerm = search.toLowerCase();
        const generatedSessionId = `SES-${appointment._id.toString().slice(-6).toUpperCase()}`;

        return (
          client?.firstName?.toLowerCase().includes(searchTerm) ||
          client?.lastName?.toLowerCase().includes(searchTerm) ||
          client?.email?.toLowerCase().includes(searchTerm) ||
          professional?.firstName?.toLowerCase().includes(searchTerm) ||
          professional?.lastName?.toLowerCase().includes(searchTerm) ||
          generatedSessionId.toLowerCase().includes(searchTerm)
        );
      });
    }

    // Get total count (approximate for search)
    const total = search.trim()
      ? filteredAppointments.length * 2
      : await Appointment.countDocuments(query);

    // Transform to payment format
    const payments = filteredAppointments.map((appointment) => {
      const client = appointment.clientId as any;
      const professional = appointment.professionalId as any;

      // Determine payment status based on appointment status and date
      let paymentStatus:
        | "paid"
        | "pending"
        | "upcoming"
        | "processing"
        | "overdue" = "pending";

      if (appointment.status === "completed") {
        const appointmentDate = appointment.date
          ? new Date(appointment.date)
          : new Date();
        const daysSinceAppointment =
          (Date.now() - appointmentDate.getTime()) / (1000 * 60 * 60 * 24);

        if (daysSinceAppointment > 30) {
          paymentStatus = "overdue";
        } else if (daysSinceAppointment < 1) {
          paymentStatus = "processing";
        } else {
          paymentStatus = "paid";
        }
      } else if (appointment.status === "scheduled") {
        const appointmentDate = appointment.date
          ? new Date(appointment.date)
          : new Date();
        if (appointmentDate > new Date()) {
          paymentStatus = "upcoming";
        } else {
          paymentStatus = "pending";
        }
      }

      return {
        id: appointment._id.toString(),
        sessionId: `SES-${appointment._id.toString().slice(-6).toUpperCase()}`,
        client: client
          ? `${client.firstName} ${client.lastName}`
          : "Unknown Client",
        professional: professional
          ? `${professional.firstName} ${professional.lastName}`
          : "Unknown Professional",
        date: appointment.date
          ? appointment.date.toISOString().split("T")[0]
          : "N/A",
        sessionDate: `${appointment.date ? appointment.date.toISOString().split("T")[0] : "N/A"} ${appointment.time || "N/A"}`,
        amount: appointment.payment?.price || 120, // Use actual payment price or fallback
        platformFee: appointment.payment?.platformFee || 12, // Use actual platform fee or fallback
        professionalPayout: appointment.payment?.professionalPayout || 108, // Use actual payout or fallback
        status: paymentStatus,
        paymentMethod: paymentStatus === "paid" ? "Various" : undefined,
        invoiceUrl: paymentStatus === "paid" ? "#" : undefined,
        paidDate:
          paymentStatus === "paid"
            ? appointment.date
              ? appointment.date.toISOString().split("T")[0]
              : undefined
            : undefined,
      };
    });

    // Calculate summary stats using real payment data
    const allAppointments = await Appointment.find({
      status: { $in: ["completed", "scheduled", "cancelled", "no-show"] },
    }).lean();

    const completedAppointments = allAppointments.filter((p) => p.status === "completed");
    const pendingAppointments = allAppointments.filter(
      (p) => p.status === "scheduled" || p.status === "completed",
    );

    const stats = {
      totalRevenue: completedAppointments.reduce((sum, apt) => sum + (apt.payment?.platformFee || 12), 0),
      pendingRevenue: pendingAppointments.reduce((sum, apt) => sum + (apt.payment?.platformFee || 12), 0),
      professionalPayouts: completedAppointments.reduce((sum, apt) => sum + (apt.payment?.professionalPayout || 108), 0),
      totalTransactions: completedAppointments.length,
      overdueCount: completedAppointments.filter((p) => {
        const daysSince =
          (Date.now() - new Date(p.date || Date.now()).getTime()) /
          (1000 * 60 * 60 * 24);
        return daysSince > 30;
      }).length,
    };

    return NextResponse.json({
      payments,
      summary: stats,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error("Admin billing API error:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch billing data",
        details: error instanceof Error ? error.message : error,
      },
      { status: 500 },
    );
  }
}
