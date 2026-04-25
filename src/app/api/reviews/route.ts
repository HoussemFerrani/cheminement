import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectToDatabase from "@/lib/mongodb";
import Review from "@/models/Review";
import Appointment from "@/models/Appointment";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
      appointmentId,
      rating,
      comment,
      categories,
      isAnonymous = false,
    } = await req.json();

    if (!appointmentId || !rating) {
      return NextResponse.json(
        { error: "Appointment ID and rating are required" },
        { status: 400 },
      );
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "Rating must be between 1 and 5" },
        { status: 400 },
      );
    }

    await connectToDatabase();

    // Verify the appointment exists and belongs to the user
    const appointment = await Appointment.findById(appointmentId)
      .populate("clientId", "_id")
      .populate("professionalId", "_id");

    if (!appointment) {
      return NextResponse.json(
        { error: "Appointment not found" },
        { status: 404 },
      );
    }

    // Check if user is the client for this appointment
    const clientId = appointment.clientId._id.toString();
    if (clientId !== session.user.id) {
      return NextResponse.json(
        { error: "You can only review your own appointments" },
        { status: 403 },
      );
    }

    // Check if appointment is completed
    if (appointment.status !== "completed") {
      return NextResponse.json(
        { error: "Can only review completed appointments" },
        { status: 400 },
      );
    }

    // Check if appointment has a professional assigned
    if (!appointment.professionalId) {
      return NextResponse.json(
        { error: "Cannot review appointment without assigned professional" },
        { status: 400 },
      );
    }

    // Check if review already exists
    const existingReview = await Review.findOne({ appointmentId });
    if (existingReview) {
      return NextResponse.json(
        { error: "Review already exists for this appointment" },
        { status: 400 },
      );
    }

    // Create the review
    const review = new Review({
      appointmentId,
      clientId: session.user.id,
      professionalId: appointment.professionalId._id,
      rating,
      comment,
      categories,
      isAnonymous,
    });

    await review.save();

    return NextResponse.json(
      { message: "Review submitted successfully", review },
      { status: 201 },
    );
  } catch (error: any) {
    console.error("Submit review error:", error);
    return NextResponse.json(
      {
        error: "Failed to submit review",
        details: error instanceof Error ? error.message : error,
      },
      { status: 500 },
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const appointmentId = searchParams.get("appointmentId");

    if (!appointmentId) {
      return NextResponse.json(
        { error: "Appointment ID is required" },
        { status: 400 },
      );
    }

    await connectToDatabase();

    // Check if user can view reviews for this appointment
    const appointment = await Appointment.findById(appointmentId)
      .populate("clientId", "_id")
      .populate("professionalId", "_id");

    if (!appointment) {
      return NextResponse.json(
        { error: "Appointment not found" },
        { status: 404 },
      );
    }

    const clientId = appointment.clientId._id.toString();
    const professionalId = appointment.professionalId?._id?.toString();

    // Only client can view reviews (professional reviews are not implemented yet)
    if (session.user.id !== clientId) {
      return NextResponse.json(
        { error: "Unauthorized to view this review" },
        { status: 403 },
      );
    }

    const review = await Review.findOne({ appointmentId });

    if (!review) {
      return NextResponse.json({ review: null });
    }

    return NextResponse.json({ review });
  } catch (error: any) {
    console.error("Get review error:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch review",
        details: error instanceof Error ? error.message : error,
      },
      { status: 500 },
    );
  }
}