import connectToDatabase from "./mongodb";
import mongoose from "mongoose";

(async () => {
  try {
    await connectToDatabase();
    const db = mongoose.connection.db;
    if (!db) throw new Error("No DB connection");
    const coll = db.collection("motifs");
    try {
      const indexes = await coll.indexes();
      console.log("Existing indexes:", indexes.map((i) => i.name).join(", "));
      await coll.drop();
      console.log("motifs collection dropped.");
    } catch (e: unknown) {
      if (e instanceof Error && /ns not found/i.test(e.message)) {
        console.log("No motifs collection to drop.");
      } else {
        throw e;
      }
    }
    process.exit(0);
  } catch (e) {
    console.error("Reset error:", e);
    process.exit(1);
  }
})();
