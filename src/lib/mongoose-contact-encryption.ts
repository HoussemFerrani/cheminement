import type { Schema } from "mongoose";
import { encryptAtRestString, decryptAtRestString } from "@/lib/field-encryption";

/** Must match `PREFIX` in field-encryption.ts */
const ENC_PREFIX = "v1.";

function needsEncrypt(v: string | undefined): v is string {
  return typeof v === "string" && v.length > 0 && !v.startsWith(ENC_PREFIX);
}

/**
 * AES-256-GCM for top-level string paths (phone, location, etc.).
 * Decrypts after reads (including lean); encrypts on save / findOneAndUpdate.
 */
export function attachContactStringEncryption(
  schema: Schema,
  paths: readonly string[],
): void {
  schema.pre("save", function (next) {
    for (const path of paths) {
      if (!this.isModified(path)) continue;
      const v = this.get(path) as string | undefined;
      if (needsEncrypt(v)) {
        this.set(path, encryptAtRestString(v));
      }
    }
    next();
  });

  schema.pre("findOneAndUpdate", function (next) {
    const raw = this.getUpdate() as Record<string, unknown> | undefined;
    if (!raw) return next();
    const touch = (obj: Record<string, unknown>) => {
      for (const path of paths) {
        const v = obj[path];
        if (needsEncrypt(v as string)) {
          obj[path] = encryptAtRestString(v as string);
        }
      }
    };
    if (raw.$set && typeof raw.$set === "object") {
      touch(raw.$set as Record<string, unknown>);
    }
    touch(raw);
    next();
  });

  const decryptDoc = (doc: Record<string, unknown> | null | undefined) => {
    if (!doc) return;
    for (const path of paths) {
      const v = doc[path];
      if (typeof v === "string" && v) {
        doc[path] = decryptAtRestString(v) ?? v;
      }
    }
  };

  schema.post(["find", "findOne"], function (result) {
    if (!result) return;
    if (Array.isArray(result)) {
      result.forEach((d) => decryptDoc(d as Record<string, unknown>));
    } else {
      decryptDoc(result as Record<string, unknown>);
    }
  });

  schema.post("findOneAndUpdate", function (result) {
    if (result && typeof result === "object" && !Array.isArray(result)) {
      decryptDoc(result as Record<string, unknown>);
    }
  });
}

function decryptNestedPhones(
  doc: Record<string, unknown> | null | undefined,
): void {
  if (!doc) return;
  const lo = doc.lovedOneInfo as Record<string, unknown> | undefined;
  if (lo?.phone && typeof lo.phone === "string") {
    lo.phone = decryptAtRestString(lo.phone) ?? lo.phone;
  }
  const ref = doc.referralInfo as Record<string, unknown> | undefined;
  if (ref) {
    for (const k of ["referrerPhone", "patientPhone"] as const) {
      if (ref[k] && typeof ref[k] === "string") {
        ref[k] = decryptAtRestString(ref[k] as string) ?? ref[k];
      }
    }
  }
}

function encryptNestedInUpdate(obj: Record<string, unknown>): void {
  const lk = "lovedOneInfo.phone";
  if (obj[lk] && needsEncrypt(obj[lk] as string)) {
    obj[lk] = encryptAtRestString(obj[lk] as string);
  }
  for (const dot of ["referralInfo.referrerPhone", "referralInfo.patientPhone"] as const) {
    if (obj[dot] && needsEncrypt(obj[dot] as string)) {
      obj[dot] = encryptAtRestString(obj[dot] as string);
    }
  }
}

/** Appointment: location + nested lovedOne / referral phone fields. */
export function attachAppointmentContactEncryption(schema: Schema): void {
  schema.pre("save", function (next) {
    if (this.isModified("location")) {
      const loc = this.get("location") as string | undefined;
      if (needsEncrypt(loc)) this.set("location", encryptAtRestString(loc));
    }
    if (this.isModified("lovedOneInfo") || this.isModified("lovedOneInfo.phone")) {
      const lo = this.get("lovedOneInfo") as { phone?: string } | undefined;
      if (lo?.phone && needsEncrypt(lo.phone)) {
        this.set("lovedOneInfo.phone", encryptAtRestString(lo.phone));
      }
    }
    if (this.isModified("referralInfo")) {
      const ref = this.get("referralInfo") as {
        referrerPhone?: string;
        patientPhone?: string;
      } | undefined;
      if (ref?.referrerPhone && needsEncrypt(ref.referrerPhone)) {
        this.set("referralInfo.referrerPhone", encryptAtRestString(ref.referrerPhone));
      }
      if (ref?.patientPhone && needsEncrypt(ref.patientPhone)) {
        this.set("referralInfo.patientPhone", encryptAtRestString(ref.patientPhone));
      }
    }
    next();
  });

  schema.pre("findOneAndUpdate", function (next) {
    const raw = this.getUpdate() as Record<string, unknown> | undefined;
    if (!raw) return next();
    const touch = (obj: Record<string, unknown>) => {
      if (obj.location && needsEncrypt(obj.location as string)) {
        obj.location = encryptAtRestString(obj.location as string);
      }
      encryptNestedInUpdate(obj);
    };
    if (raw.$set && typeof raw.$set === "object") {
      touch(raw.$set as Record<string, unknown>);
    }
    touch(raw);
    next();
  });

  schema.post(["find", "findOne"], function (result) {
    if (!result) return;
    const run = (doc: Record<string, unknown>) => {
      if (doc.location && typeof doc.location === "string") {
        doc.location = decryptAtRestString(doc.location) ?? doc.location;
      }
      decryptNestedPhones(doc);
    };
    if (Array.isArray(result)) {
      result.forEach((d) => run(d as Record<string, unknown>));
    } else {
      run(result as Record<string, unknown>);
    }
  });

  schema.post("findOneAndUpdate", function (result) {
    if (result && typeof result === "object" && !Array.isArray(result)) {
      const doc = result as Record<string, unknown>;
      if (doc.location && typeof doc.location === "string") {
        doc.location = decryptAtRestString(doc.location) ?? doc.location;
      }
      decryptNestedPhones(doc);
    }
  });
}
