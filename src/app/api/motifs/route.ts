import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Motif from "@/models/Motif";

export interface PublicMotif {
  id: string;
  labelFr: string;
  labelEn: string;
  aliases: string[];
}

export async function GET() {
  try {
    await connectToDatabase();

    const docs = await Motif.find({ active: true })
      .select("labelFr labelEn aliases")
      .lean();

    const motifs: PublicMotif[] = docs.map((d) => ({
      id: String(d._id),
      labelFr: d.labelFr,
      labelEn: d.labelEn || "",
      aliases: d.aliases || [],
    }));

    return NextResponse.json(
      { motifs },
      {
        headers: {
          "Cache-Control":
            "public, s-maxage=60, stale-while-revalidate=300",
        },
      },
    );
  } catch (error) {
    console.error("List public motifs error:", error);
    return NextResponse.json(
      { error: "Failed to load motifs" },
      { status: 500 },
    );
  }
}
