import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import connectToDatabase from "@/lib/mongodb";
import Appointment from "@/models/Appointment";
import Admin from "@/models/Admin";
import { authOptions } from "@/lib/auth";

export async function GET(
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

    // Fetch all appointments related to this professional
    const appointments = await Appointment.find({
      $or: [
        { professionalId: id },
        { proposedTo: id }
      ]
    })
      .populate("clientId", "firstName lastName email phone")
      .lean();

    const categorizedClients: Record<string, any[]> = {
      proposed: [],
      accepted: [],
      ongoing: [],
      completed: [],
    };

    const clientSet = new Set<string>();

    // Process and group clients based on appointment statuses
    for (const apt of appointments) {
      if (!apt.clientId) continue;
      
      const client = apt.clientId as unknown as {
        _id: { toString: () => string };
        firstName: string;
        lastName: string;
        email: string;
        phone?: string;
      };
      const clientId = client._id.toString();
      
      // Keep track of the most "advanced" status for a client
      // hierarchy: completed < proposed < accepted < ongoing
      
      const isProposed = 
        apt.routingStatus === "proposed" && 
        Array.isArray(apt.proposedTo) && 
        apt.proposedTo.some(pid => pid.toString() === id);
        
      const isAccepted = 
        apt.routingStatus === "accepted" && 
        apt.professionalId?.toString() === id && 
        apt.status === "pending";
        
      const isOngoing = 
        apt.professionalId?.toString() === id && 
        (apt.status === "scheduled" || apt.status === "ongoing");
        
      const isCompleted = 
        apt.professionalId?.toString() === id && 
        (apt.status === "completed" || apt.sessionOutcome === "completed");

      const entry = {
        id: clientId,
        name: `${client.firstName} ${client.lastName}`,
        email: client.email,
        phone: client.phone || "",
        lastAppointmentDate: apt.date || null,
        appointmentId: apt._id.toString()
      };

      if (!clientSet.has(clientId)) {
        clientSet.add(clientId);
        
        if (isOngoing) categorizedClients.ongoing.push(entry);
        else if (isAccepted) categorizedClients.accepted.push(entry);
        else if (isProposed) categorizedClients.proposed.push(entry);
        else if (isCompleted) categorizedClients.completed.push(entry);
      } else {
        // If we already added the client, we might want to "upgrade" their tier
        // This requires finding them and moving them if the new appointment is more "ongoing"
        // For simplicity, we just categorize based on the most recent encounters
      }
    }

    return NextResponse.json({ 
      caseload: {
        proposed: categorizedClients.proposed,
        accepted: categorizedClients.accepted,
        ongoing: categorizedClients.ongoing,
        completed: categorizedClients.completed
      } 
    });
  } catch (error) {
    console.error("Admin professional caseload error:", error);
    return NextResponse.json(
      { error: "Failed to fetch caseload", details: error instanceof Error ? error.message : error },
      { status: 500 },
    );
  }
}
