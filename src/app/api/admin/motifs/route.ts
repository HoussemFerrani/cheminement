import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
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

// GET /api/admin/motifs — liste complète (actifs + inactifs)
export async function GET() {
  const auth = await requireContentAdmin();
  if (auth.error) return auth.error;

  try {
    const docs = await Motif.find({})
      .sort({ labelFr: 1 })
      .select("labelFr labelEn aliases active createdAt updatedAt")
      .lean();

    const motifs = docs.map((d) => ({
      id: String(d._id),
      labelFr: d.labelFr,
      labelEn: d.labelEn || "",
      aliases: d.aliases || [],
      active: d.active !== false,
      createdAt: d.createdAt,
      updatedAt: d.updatedAt,
    }));

    return NextResponse.json({ motifs });
  } catch (error) {
    console.error("Admin list motifs error:", error);
    return NextResponse.json(
      { error: "Failed to load motifs" },
      { status: 500 },
    );
  }
}

// POST /api/admin/motifs — créer (FR + EN obligatoires)
export async function POST(req: NextRequest) {
  const auth = await requireContentAdmin();
  if (auth.error) return auth.error;

  try {
    const body = await req.json();
    const labelFr = typeof body?.labelFr === "string" ? body.labelFr.trim() : "";
    const labelEn = typeof body?.labelEn === "string" ? body.labelEn.trim() : "";
    const aliases = normalizeAliases(body?.aliases);
    const active = body?.active !== false;

    if (!labelFr) {
      return NextResponse.json(
        { error: "labelFr is required" },
        { status: 400 },
      );
    }
    if (!labelEn) {
      return NextResponse.json(
        { error: "labelEn is required for new motifs" },
        { status: 400 },
      );
    }

    const duplicate = await Motif.findOne({ labelFr })
      .select("_id")
      .lean();

    if (duplicate) {
      return NextResponse.json(
        { error: "Un motif avec ce libellé français existe déjà" },
        { status: 409 },
      );
    }

    const created = await Motif.create({
      labelFr,
      labelEn,
      aliases,
      active,
      createdBy: auth.session!.user.id,
      updatedBy: auth.session!.user.id,
    });

    return NextResponse.json(
      {
        motif: {
          id: String(created._id),
          labelFr: created.labelFr,
          labelEn: created.labelEn || "",
          aliases: created.aliases || [],
          active: created.active,
          createdAt: created.createdAt,
          updatedAt: created.updatedAt,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Admin create motif error:", error);
    return NextResponse.json(
      { error: "Failed to create motif" },
      { status: 500 },
    );
  }
}
