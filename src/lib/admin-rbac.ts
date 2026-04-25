import type { IAdminPermissions } from "@/models/Admin";
import Admin from "@/models/Admin";
import { maskPhoneForDisplay } from "@/lib/contact-mask";

/**
 * Moindre privilège : masquer le téléphone si l’admin gère la facturation mais pas les dossiers patients.
 */
export function mustMaskClientContactPII(
  permissions: IAdminPermissions | null | undefined,
): boolean {
  if (!permissions) return false;
  return (
    permissions.manageBilling === true && permissions.managePatients !== true
  );
}

export async function getActiveAdminPermissions(
  sessionUserId: string,
): Promise<IAdminPermissions | null> {
  const admin = await Admin.findOne({
    userId: sessionUserId,
    isActive: true,
  })
    .select("permissions")
    .lean();
  return admin?.permissions ?? null;
}

export function applyClientContactMaskToUserPayload<
  T extends { phone?: string },
>(payload: T, mask: boolean): T {
  if (!mask || !payload.phone) {
    return payload;
  }
  return {
    ...payload,
    phone: maskPhoneForDisplay(payload.phone),
  };
}

export function applyMedicalProfileContactMask<T extends Record<string, unknown>>(
  payload: T,
  mask: boolean,
): T {
  if (!mask) return payload;
  const next = { ...payload } as Record<string, unknown>;
  if (typeof next.emergencyContactPhone === "string" && next.emergencyContactPhone) {
    next.emergencyContactPhone = maskPhoneForDisplay(
      next.emergencyContactPhone,
    );
  }
  if (typeof next.location === "string" && next.location) {
    next.location = "—";
  }
  return next as T;
}
