import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

/**
 * Middleware to protect API routes with authentication
 */
export async function withAuth(
  handler: (req: Request, context?: unknown) => Promise<NextResponse>,
  allowedRoles?: string[],
) {
  return async (req: Request, context?: unknown) => {
    try {
      const session = await getServerSession(authOptions);

      if (!session || !session.user) {
        return NextResponse.json(
          { error: "Unauthorized - Please sign in" },
          { status: 401 },
        );
      }

      // Check role permissions if specified
      if (allowedRoles && !allowedRoles.includes(session.user.role)) {
        return NextResponse.json(
          { error: "Forbidden - Insufficient permissions" },
          { status: 403 },
        );
      }

      // Add user to request for convenience
      (req as unknown as { user: typeof session.user }).user = session.user;

      return handler(req, context);
    } catch (error) {
      console.error("Auth middleware error:", error);
      return NextResponse.json(
        { error: "Authentication failed" },
        { status: 500 },
      );
    }
  };
}

/**
 * Middleware to allow only admins
 */
export function adminOnly(
  handler: (req: Request, context?: unknown) => Promise<NextResponse>,
) {
  return withAuth(handler, ["admin"]);
}

/**
 * Middleware to allow only professionals and admins
 */
export function professionalOnly(
  handler: (req: Request, context?: unknown) => Promise<NextResponse>,
) {
  return withAuth(handler, ["professional", "admin"]);
}

/**
 * Middleware to allow only clients and admins
 */
export function clientOnly(
  handler: (req: Request, context?: unknown) => Promise<NextResponse>,
) {
  return withAuth(handler, ["client", "admin"]);
}

/**
 * Middleware to check specific admin permissions
 */
export async function withAdminPermission(
  handler: (req: Request, context?: unknown) => Promise<NextResponse>,
  requiredPermission: keyof import("@/models/Admin").IAdminPermissions,
) {
  return async (req: Request, context?: unknown) => {
    try {
      const session = await getServerSession(authOptions);

      if (!session?.user?.id || !session.user.isAdmin) {
        return NextResponse.json(
          { error: "Unauthorized - Admin access required" },
          { status: 401 },
        );
      }

      // Import Admin model here to avoid circular dependencies
      const Admin = (await import("@/models/Admin")).default;

      const admin = await Admin.findOne({
        userId: session.user.id,
        isActive: true,
      });

      if (!admin) {
        return NextResponse.json(
          { error: "Admin account not found" },
          { status: 404 },
        );
      }

      if (!admin.permissions[requiredPermission]) {
        return NextResponse.json(
          { error: "Insufficient permissions" },
          { status: 403 },
        );
      }

      // Add admin info to request for convenience
      (req as unknown as { admin: typeof admin }).admin = admin;

      return handler(req, context);
    } catch (error) {
      console.error("Admin permission middleware error:", error);
      return NextResponse.json(
        { error: "Authentication failed" },
        { status: 500 },
      );
    }
  };
}

/**
 * Middleware for admin management permissions
 */
export function adminManagementOnly(
  handler: (req: Request, context?: unknown) => Promise<NextResponse>,
) {
  return withAdminPermission(handler, "manageAdmins");
}

/**
 * Middleware for creating admins
 */
export function adminCreationOnly(
  handler: (req: Request, context?: unknown) => Promise<NextResponse>,
) {
  return withAdminPermission(handler, "createAdmins");
}
