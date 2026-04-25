import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import connectToDatabase from "@/lib/mongodb";
import Appointment from "@/models/Appointment";
import Profile from "@/models/Profile";
import User from "@/models/User";
import PlatformSettings from "@/models/PlatformSettings";
import { authOptions } from "@/lib/auth";

// Helper function to generate time slots
function generateTimeSlots(
  startTime: string,
  endTime: string,
  sessionDuration: number,
  breakDuration: number,
): string[] {
  const slots: string[] = [];
  const [startHour, startMinute] = startTime.split(":").map(Number);
  const [endHour, endMinute] = endTime.split(":").map(Number);

  let currentMinutes = startHour * 60 + startMinute;
  const endMinutes = endHour * 60 + endMinute;

  while (currentMinutes + sessionDuration <= endMinutes) {
    const hours = Math.floor(currentMinutes / 60);
    const minutes = currentMinutes % 60;
    const timeString = `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
    slots.push(timeString);
    currentMinutes += sessionDuration + breakDuration;
  }

  return slots;
}

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    let professionalId = searchParams.get("professionalId");
    const dateStr = searchParams.get("date");

    // If no professionalId provided, check if caller is an authenticated professional
    // and use their own ID (for scheduling from requests page)
    if (!professionalId) {
      const session = await getServerSession(authOptions);
      if (session?.user?.id && session.user.role === "professional") {
        professionalId = session.user.id;
      }
    }

    if (!professionalId || !dateStr) {
      return NextResponse.json(
        { error: "Missing required parameters: professionalId and date" },
        { status: 400 },
      );
    }

    // Verify professional exists
    const professional = await User.findOne({
      _id: professionalId,
      role: "professional",
      status: { $in: ["active", "pending"] },
    });

    if (!professional) {
      return NextResponse.json(
        { error: "Professional not found" },
        { status: 404 },
      );
    }

    // Get professional's profile for availability
    const profile = await Profile.findOne({ userId: professionalId });

    if (!profile || !profile.availability) {
      return NextResponse.json(
        { error: "Professional availability not configured" },
        { status: 404 },
      );
    }

    // Parse requested date
    const requestedDate = new Date(dateStr);
    const dayOfWeek = requestedDate.toLocaleDateString("en-US", {
      weekday: "long",
    });

    // Find availability for the requested day
    const dayAvailability = profile.availability.days.find(
      (d) => d.day === dayOfWeek,
    );

    if (!dayAvailability || !dayAvailability.isWorkDay) {
      return NextResponse.json({
        date: dateStr,
        dayOfWeek,
        available: false,
        slots: [],
        message: `Professional is not available on ${dayOfWeek}s`,
      });
    }

    // Generate all possible time slots
    const sessionDuration = profile.availability.sessionDurationMinutes || 60;
    const breakDuration = profile.availability.breakDurationMinutes || 15;

    const allSlots = generateTimeSlots(
      dayAvailability.startTime,
      dayAvailability.endTime,
      sessionDuration,
      breakDuration,
    );

    // Get existing appointments for this professional on this date
    const existingAppointments = await Appointment.find({
      professionalId,
      date: requestedDate,
      status: { $in: ["scheduled"] },
    }).select("time duration");

    // Filter out booked slots
    const bookedTimes = new Set(existingAppointments.map((apt) => apt.time));

    const availableSlots = allSlots
      .filter((slot) => !bookedTimes.has(slot))
      .map((time) => ({
        time,
        duration: sessionDuration,
        available: true,
      }));

    // Check if date is in the past
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const isPast = requestedDate < today;

    // Check if date is today and filter out past times
    const now = new Date();
    const isToday = requestedDate.toDateString() === now.toDateString();

    const filteredSlots = availableSlots.filter((slot) => {
      if (isPast) return false;
      if (isToday) {
        const [hours, minutes] = slot.time.split(":").map(Number);
        const slotTime = new Date(requestedDate);
        slotTime.setHours(hours, minutes, 0, 0);
        return slotTime > now;
      }
      return true;
    });

    // Get pricing information (professional or platform defaults)
    let pricingInfo: {
      individualSession?: number;
      coupleSession?: number;
      groupSession?: number;
    } = profile.pricing || {};

    // If professional doesn't have pricing set, use platform defaults
    if (
      !pricingInfo.individualSession &&
      !pricingInfo.coupleSession &&
      !pricingInfo.groupSession
    ) {
      let platformSettings = await PlatformSettings.findOne();

      if (!platformSettings) {
        platformSettings = new PlatformSettings({
          defaultPricing: {
            solo: 120,
            couple: 150,
            group: 80,
          },
          platformFeePercentage: 10,
          currency: "CAD",
        });
        await platformSettings.save();
      }

      pricingInfo = {
        individualSession: platformSettings.defaultPricing.solo,
        coupleSession: platformSettings.defaultPricing.couple,
        groupSession: platformSettings.defaultPricing.group,
      };
    }

    return NextResponse.json({
      date: dateStr,
      dayOfWeek,
      available: filteredSlots.length > 0,
      slots: filteredSlots,
      professionalInfo: {
        id: professional._id,
        name: `${professional.firstName} ${professional.lastName}`,
        sessionDuration,
        pricing: pricingInfo,
        sessionTypes: profile.sessionTypes || [],
      },
      workingHours: {
        start: dayAvailability.startTime,
        end: dayAvailability.endTime,
      },
    });
  } catch (error: unknown) {
    console.error("Get available slots error:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch available slots",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
