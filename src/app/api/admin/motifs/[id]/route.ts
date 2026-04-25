import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import mongoose from "mongoose";
import { authOptions } from "@/lib/auth";
import connectToDatabase from "@/lib/mongodb";
import { getActiveAdminPermissions } from "@/lib/admin-rbac";
import Motif from "@/models/Motif";

async function requireContentAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !session.user.isAdmin) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  await connectToDatabase();
  const permissions = await getActiveAdminPermissions(session.user.id);
  if (!permissions?.manageContent) {
    return {
      error: NextResponse.json(
        { error: "Forbidden - missing permission: manageContent" },
        { status: 403 },
      ),
    };
  }
  return { session };
}

function normalizeAliases(input: unknown): string[] {
  if (Array.isArray(input)) {
    return input
      .map((x) => (typeof x === "string" ? x.trim() : ""))
      .filter(Boolean);
  }
  if (typeof input === "string") {
    return input
      .split(/[\n,]/)
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return [];
}

// PATCH /api/admin/motifs/[id]
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireContentAdmin();
  if (auth.error) return auth.error;

  try {
    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid motif id" }, { status: 400 });
    }

    const body = await req.json();
    const update: Record<string, unknown> = {
      updatedBy: auth.session!.user.id,
    };

    if (typeof body?.labelFr === "string") {
      const v = body.labelFr.trim();
      if (!v) {
        return NextResponse.json(
          { error: "labelFr cannot be empty" },
          { status: 400 },
        );
      }
      update.labelFr = v;
    }
    if (typeof body?.labelEn === "string") {
      const v = body.labelEn.trim();
      if (!v) {
        return NextResponse.json(
          { error: "labelEn cannot be empty" },
          { status: 400 },
        );
      }
      update.labelEn = v;
    }
    if (body?.aliases !== undefined) {
      update.aliases = normalizeAliases(body.aliases);
    }
    if (typeof body?.active === "boolean") {
      update.active = body.active;
    }

    if (update.labelFr) {
      const duplicate = await Motif.findOne({
        _id: { $ne: new mongoose.Types.ObjectId(id) },
        labelFr: update.labelFr,
      })
        .select("_id")
        .lean();
      if (duplicate) {
        return NextResponse.json(
          { error: "Un autre motif utilise déjà ce libellé français" },
          { status: 409 },
        );
      }
    }

    const updated = await Motif.findByIdAndUpdate(id, update, { new: true })
      .lean();
    if (!updated) {
      return NextResponse.json({ error: "Motif not found" }, { status: 404 });
    }

    return NextResponse.json({
      motif: {
        id: String(updated._id),
        labelFr: updated.labelFr,
        labelEn: updated.labelEn || "",
        aliases: updated.aliases || [],
        active: updated.active !== false,
        createdAt: updated.createdAt,
        updatedAt: updated.updatedAt,
      },
    });
  } catch (error) {
    console.error("Admin update motif error:", error);
    return NextResponse.json(
      { error: "Failed to update motif" },
      { status: 500 },
    );
  }
}

// DELETE /api/admin/motifs/[id]
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireContentAdmin();
  if (auth.error) return auth.error;

  try {
    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid motif id" }, { status: 400 });
    }

    const deleted = await Motif.findByIdAndDelete(id).lean();
    if (!deleted) {
      return NextResponse.json({ error: "Motif not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin delete motif error:", error);
    return NextResponse.json(
      { error: "Failed to delete motif" },
      { status: 500 },
    );
  }
}
