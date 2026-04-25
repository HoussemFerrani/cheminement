import Motif from "@/models/Motif";

/**
 * Returns the list of labels (FR + EN) accepted as valid motifs for user submissions.
 * Includes only active motifs. Call after `connectToDatabase()`.
 */
export async function getValidMotifLabels(): Promise<Set<string>> {
  const docs = await Motif.find({ active: true })
    .select("labelFr labelEn")
    .lean();
  const set = new Set<string>();
  for (const d of docs) {
    if (d.labelFr) set.add(d.labelFr);
    if (d.labelEn) set.add(d.labelEn);
  }
  return set;
}
