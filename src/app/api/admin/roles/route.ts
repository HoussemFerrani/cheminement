import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { ADMIN_ROLE_PERMISSIONS, type AdminRole } from "@/models/Admin";
import { authOptions } from "@/lib/auth";

// GET - Get available admin roles and their default permissions
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || !session.user.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const roles = Object.keys(ADMIN_ROLE_PERMISSIONS).map((roleKey) => ({
      role: roleKey as AdminRole,
      name: getRoleDisplayName(roleKey as AdminRole),
      description: getRoleDescription(roleKey as AdminRole),
      permissions: ADMIN_ROLE_PERMISSIONS[roleKey as AdminRole],
    }));

    return NextResponse.json({ roles });
  } catch (error: any) {
    console.error("Get roles error:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch roles",
        details: error instanceof Error ? error.message : error,
      },
      { status: 500 },
    );
  }
}

function getRoleDisplayName(role: AdminRole): string {
  const names = {
    super_admin: "Super Administrator",
    platform_admin: "Platform Administrator",
    content_admin: "Content Administrator",
    support_admin: "Support Administrator",
    billing_admin: "Billing Administrator",
  };
  return names[role];
}

function getRoleDescription(role: AdminRole): string {
  const descriptions = {
    super_admin:
      "Full access to all platform features including admin management. Can create and manage other administrators.",
    platform_admin:
      "Complete platform management access. Can manage users, content, analytics, and billing but cannot manage other admins.",
    content_admin:
      "Limited to content management. Can manage platform content, and view analytics.",
    support_admin:
      "User support focused. Can manage user accounts, approve professionals, and handle support requests.",
    billing_admin:
      "Billing and receipts only. Cannot view full client phone numbers; access to client records is logged.",
  };
  return descriptions[role];
}
