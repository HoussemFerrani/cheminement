import crypto from "crypto";
import bcrypt from "bcryptjs";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";
import MedicalProfile from "@/models/MedicalProfile";

/**
 * When a professional schedules a first appointment for a guest, provision a full
 * client account (one request → one account) with minimal clinical record so the
 * person can access billing/history without completing the long signup form.
 * Password is set randomly; the user can use "Forgot password" to sign in.
 */
export async function provisionGuestAsClient(
  userId: string,
  opts: { issueType?: string },
): Promise<{ promoted: boolean }> {
  await connectToDatabase();
  const user = await User.findById(userId);
  if (!user || user.role !== "guest") {
    return { promoted: false };
  }

  const tempPassword = crypto.randomBytes(32).toString("hex");
  user.role = "client";
  user.password = await bcrypt.hash(tempPassword, 12);
  user.status = "active";
  await user.save();

  const existing = await MedicalProfile.findOne({ userId: user._id });
  if (!existing) {
    await MedicalProfile.create({
      userId: user._id,
      primaryIssue: opts.issueType || "",
      profileCompleted: false,
    });
  }

  return { promoted: true };
}
