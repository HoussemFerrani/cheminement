import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import connectToDatabase from "@/lib/mongodb";
import Appointment from "@/models/Appointment";
import Profile from "@/models/Profile";
import User from "@/models/User";
import { authOptions } from "@/lib/auth";

interface ProfessionalMatch {
  professionalId: string;
  score: number;
  reasons: string[];
}

/**
 * Calculate a relevancy score for a professional based on appointment requirements
 */
function calculateRelevancyScore(
  profile: {
    problematics?: string[];
    ageCategories?: string[];
    modalities?: string[];
    sessionTypes?: string[];
    availability?: {
      days: { day: string; isWorkDay: boolean }[];
    };
  },
  appointment: {
    issueType?: string;
    type: string;
    therapyType: string;
    preferredAvailability?: string[];
  },
): { score: number; reasons: string[] } {
  let score = 0;
  const reasons: string[] = [];

  // Match by issue type / problematics (highest weight)
  if (appointment.issueType && profile.problematics) {
    const issueMatch = profile.problematics.some(
      (p) =>
        p.toLowerCase().includes(appointment.issueType!.toLowerCase()) ||
        appointment.issueType!.toLowerCase().includes(p.toLowerCase()),
    );
    if (issueMatch) {
      score += 40;
      reasons.push("Specializes in this issue type");
    }
  }

  // Match by modality (video, in-person, phone, both)
  if (profile.modalities) {
    if (appointment.type === "both") {
      const offersVideoOrInPerson =
        profile.modalities.includes("online") ||
        profile.modalities.includes("inPerson") ||
        profile.modalities.includes("both");
      if (offersVideoOrInPerson) {
        score += 20;
        reasons.push("Offers required session modality (video or in-person)");
      }
    } else {
      const modalityMap: Record<string, string> = {
        video: "online",
        "in-person": "inPerson",
        phone: "phone",
      };
      const requiredModality = modalityMap[appointment.type];
      if (
        requiredModality &&
        (profile.modalities.includes(requiredModality) ||
          profile.modalities.includes("both"))
      ) {
        score += 20;
        reasons.push("Offers required session modality");
      }
    }
  }

  // Match by session type (solo, couple, group)
  if (profile.sessionTypes) {
    const sessionTypeMap: Record<string, string> = {
      solo: "individual",
      couple: "couple",
      group: "group",
    };
    const requiredType = sessionTypeMap[appointment.therapyType];
    if (
      profile.sessionTypes.some((t) => t.toLowerCase().includes(requiredType))
    ) {
      score += 15;
      reasons.push("Offers required session type");
    }
  }

  // Match by availability
  if (appointment.preferredAvailability && profile.availability?.days) {
    const availableDays = profile.availability.days
      .filter((d) => d.isWorkDay)
      .map((d) => d.day);

    // Check if professional has any availability matching client preferences
    const availabilityMatches = appointment.preferredAvailability.some(
      (pref) => {
        const prefLower = pref.toLowerCase();
        if (prefLower.includes("weekday")) {
          return availableDays.some((d) =>
            ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].includes(
              d,
            ),
          );
        }
        if (prefLower.includes("weekend")) {
          return availableDays.some((d) => ["Saturday", "Sunday"].includes(d));
        }
        return true;
      },
    );

    if (availabilityMatches) {
      score += 15;
      reasons.push("Availability matches preferences");
    }
  }

  // Profile completeness bonus
  if (profile.problematics && profile.problematics.length > 0) {
    score += 5;
  }
  if (profile.modalities && profile.modalities.length > 0) {
    score += 5;
  }

  return { score, reasons };
}

/**
 * POST /api/appointments/route-submission
 * Routes an appointment to relevant professionals based on matching criteria
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // Only admin can manually trigger routing (for now)
    // In production, this would be called automatically after appointment creation
    if (!session?.user?.id || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    const { appointmentId } = await req.json();

    if (!appointmentId) {
      return NextResponse.json(
        { error: "Appointment ID is required" },
        { status: 400 },
      );
    }

    // Get the appointment
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return NextResponse.json(
        { error: "Appointment not found" },
        { status: 404 },
      );
    }

    // Only route pending appointments that haven't been routed yet
    if (appointment.routingStatus !== "pending" || appointment.professionalId) {
      return NextResponse.json(
        { error: "Appointment already routed or assigned" },
        { status: 400 },
      );
    }

    // Get all active professionals with profiles
    const professionals = await User.find({
      role: "professional",
      status: "active",
    }).select("_id firstName lastName email");

    const professionalIds = professionals.map((p) => p._id);

    // Get profiles for all professionals
    const profiles = await Profile.find({
      userId: { $in: professionalIds },
      profileCompleted: true,
    });

    // Calculate relevancy scores
    const matches: ProfessionalMatch[] = [];

    for (const profile of profiles) {
      const { score, reasons } = calculateRelevancyScore(profile, {
        issueType: appointment.issueType,
        type: appointment.type,
        therapyType: appointment.therapyType,
        preferredAvailability: appointment.preferredAvailability,
      });

      // Only include professionals with a minimum relevancy score
      if (score >= 20) {
        matches.push({
          professionalId: profile.userId.toString(),
          score,
          reasons,
        });
      }
    }

    // Sort by score (highest first) and take top 5
    matches.sort((a, b) => b.score - a.score);
    const topMatches = matches.slice(0, 5);

    if (topMatches.length === 0) {
      // No matching professionals found, move to general list
      await Appointment.findByIdAndUpdate(appointmentId, {
        routingStatus: "general",
      });

      return NextResponse.json({
        message: "No matching professionals found, moved to general list",
        routingStatus: "general",
        matches: [],
      });
    }

    // Update appointment with proposed professionals
    const proposedIds = topMatches.map((m) => m.professionalId);
    await Appointment.findByIdAndUpdate(appointmentId, {
      routingStatus: "proposed",
      proposedTo: proposedIds,
    });

    // TODO: Send notifications to proposed professionals

    return NextResponse.json({
      message: "Appointment routed successfully",
      routingStatus: "proposed",
      matches: topMatches,
    });
  } catch (error) {
    console.error("Route submission error:", error);
    return NextResponse.json(
      { error: "Failed to route appointment" },
      { status: 500 },
    );
  }
}
