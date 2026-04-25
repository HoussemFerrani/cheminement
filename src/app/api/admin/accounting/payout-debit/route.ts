import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectToDatabase from "@/lib/mongodb";
import ProfessionalLedgerEntry from "@/models/ProfessionalLedgerEntry";
import User from "@/models/User";
import mongoose from "mongoose";
import { getBiweeklyCycleKey } from "@/lib/ledger-cycle";

/**
 * Enregistre un débit (versement plateforme → professionnel) dans le grand livre.
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const professionalId = body.professionalId as string | undefined;
    const payoutAmountCad = body.payoutAmountCad as number | undefined;
    const payoutReference = body.payoutReference as string | undefined;
    const payoutNotes = body.payoutNotes as string | undefined;
    const cycleKey =
      (body.cycleKey as string | undefined)?.trim() ||
      getBiweeklyCycleKey(new Date());

    if (!professionalId?.trim()) {
      return NextResponse.json(
        { error: "professionalId is required" },
        { status: 400 },
      );
    }
    if (
      typeof payoutAmountCad !== "number" ||
      payoutAmountCad <= 0 ||
      !Number.isFinite(payoutAmountCad)
    ) {
      return NextResponse.json(
        { error: "payoutAmountCad must be a positive number" },
        { status: 400 },
      );
    }

    await connectToDatabase();

    const pro = await User.findById(professionalId);
    if (!pro || pro.role !== "professional") {
      return NextResponse.json(
        { error: "Professional not found" },
        { status: 404 },
      );
    }

    const doc = await ProfessionalLedgerEntry.create({
      professionalId: new mongoose.Types.ObjectId(professionalId),
      entryKind: "debit",
      cycleKey,
      grossAmountCad: 0,
      platformFeeCad: 0,
      netToProfessionalCad: 0,
      paymentChannel: "none",
      payoutAmountCad,
      payoutReference: payoutReference?.trim(),
      payoutNotes: payoutNotes?.trim(),
    });

    return NextResponse.json(doc);
  } catch (e: unknown) {
    console.error("admin payout-debit:", e);
    return NextResponse.json(
      { error: "Failed to record payout debit" },
      { status: 500 },
    );
  }
}
