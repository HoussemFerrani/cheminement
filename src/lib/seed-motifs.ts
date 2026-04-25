import connectToDatabase from "./mongodb";
import Motif from "@/models/Motif";
import { MOTIFS, MOTIFS_EN } from "@/data/motif";
import { MOTIF_SEARCH_EXTRAS } from "@/config/motifSearch";

async function seedMotifs() {
  try {
    await connectToDatabase();
    console.log("Connected to database");

    let created = 0;
    let updated = 0;
    let skipped = 0;

    for (const labelFr of MOTIFS) {
      const aliasesRaw = MOTIF_SEARCH_EXTRAS[labelFr];
      const aliases = aliasesRaw
        ? aliasesRaw
            .split(/\s+/)
            .map((a) => a.trim())
            .filter(Boolean)
        : [];
      const labelEn = (MOTIFS_EN[labelFr] ?? "").trim();

      const existing = await Motif.findOne({ labelFr });

      if (!existing) {
        await Motif.create({ labelFr, labelEn, aliases, active: true });
        created += 1;
        continue;
      }

      const patch: Record<string, unknown> = {};
      if (!existing.labelEn && labelEn) patch.labelEn = labelEn;
      if (aliases.length > 0 && (existing.aliases?.length ?? 0) === 0) {
        patch.aliases = aliases;
      }
      if (Object.keys(patch).length > 0) {
        await Motif.updateOne({ _id: existing._id }, { $set: patch });
        updated += 1;
      } else {
        skipped += 1;
      }
    }

    console.log(
      `Seed terminé — créés : ${created}, mis à jour : ${updated}, ignorés : ${skipped}, total en BD : ${await Motif.countDocuments()}`,
    );
    process.exit(0);
  } catch (err) {
    console.error("Seed motifs error:", err);
    process.exit(1);
  }
}

seedMotifs();
