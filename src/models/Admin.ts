import mongoose, { Schema, Document, Model } from "mongoose";

export type AdminRole =
  | "super_admin"
  | "platform_admin"
  | "content_admin"
  | "support_admin"
  | "billing_admin";

export interface IAdminPermissions {
  // User Management
  manageUsers: boolean;
  manageProfessionals: boolean;
  managePatients: boolean;
  approveProfessionals: boolean;

  // Content Management
  manageContent: boolean;

  // System Management
  viewAnalytics: boolean;
  manageReports: boolean;
  manageBilling: boolean;

  // Admin Management (only for super admins)
  manageAdmins: boolean;
  createAdmins: boolean;
  deleteAdmins: boolean;

  // Platform Settings
  manageSettings: boolean;
  managePlatform: boolean;
}

export interface IAdmin extends Document {
  userId: mongoose.Types.ObjectId;
  role: AdminRole;
  permissions: IAdminPermissions;
  createdBy: mongoose.Types.ObjectId; // Admin who created this admin
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const AdminPermissionsSchema = new Schema(
  {
    // User Management
    manageUsers: { type: Boolean, default: false },
    manageProfessionals: { type: Boolean, default: false },
    managePatients: { type: Boolean, default: false },
    approveProfessionals: { type: Boolean, default: false },

    // Content Management
    manageContent: { type: Boolean, default: false },

    // System Management
    viewAnalytics: { type: Boolean, default: false },
    manageReports: { type: Boolean, default: false },
    manageBilling: { type: Boolean, default: false },

    // Admin Management (only for super admins)
    manageAdmins: { type: Boolean, default: false },
    createAdmins: { type: Boolean, default: false },
    deleteAdmins: { type: Boolean, default: false },

    // Platform Settings
    manageSettings: { type: Boolean, default: false },
    managePlatform: { type: Boolean, default: false },
  },
  { _id: false },
);

const AdminSchema = new Schema<IAdmin>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    role: {
      type: String,
      enum: [
        "super_admin",
        "platform_admin",
        "content_admin",
        "support_admin",
        "billing_admin",
      ],
      required: true,
    },
    permissions: {
      type: AdminPermissionsSchema,
      required: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: Date,
  },
  {
    timestamps: true,
  },
);

// Pre-defined permission sets for each role
export const ADMIN_ROLE_PERMISSIONS: Record<AdminRole, IAdminPermissions> = {
  super_admin: {
    manageUsers: true,
    manageProfessionals: true,
    managePatients: true,
    approveProfessionals: true,
    manageContent: true,
    viewAnalytics: true,
    manageReports: true,
    manageBilling: true,
    manageAdmins: true,
    createAdmins: true,
    deleteAdmins: true,
    manageSettings: true,
    managePlatform: true,
  },
  platform_admin: {
    manageUsers: true,
    manageProfessionals: true,
    managePatients: true,
    approveProfessionals: true,
    manageContent: true,
    viewAnalytics: true,
    manageReports: true,
    manageBilling: true,
    manageAdmins: false,
    createAdmins: false,
    deleteAdmins: false,
    manageSettings: false,
    managePlatform: true,
  },
  content_admin: {
    manageUsers: false,
    manageProfessionals: false,
    managePatients: false,
    approveProfessionals: false,
    manageContent: true,
    viewAnalytics: true,
    manageReports: true,
    manageBilling: false,
    manageAdmins: false,
    createAdmins: false,
    deleteAdmins: false,
    manageSettings: false,
    managePlatform: false,
  },
  support_admin: {
    manageUsers: true,
    manageProfessionals: true,
    managePatients: true,
    approveProfessionals: true,
    manageContent: false,
    viewAnalytics: true,
    manageReports: false,
    manageBilling: false,
    manageAdmins: false,
    createAdmins: false,
    deleteAdmins: false,
    manageSettings: false,
    managePlatform: false,
  },
  /** Facturation / reçus : pas d’accès dossier patient complet (téléphone masqué côté API). */
  billing_admin: {
    manageUsers: false,
    manageProfessionals: false,
    managePatients: false,
    approveProfessionals: false,
    manageContent: false,
    viewAnalytics: true,
    manageReports: true,
    manageBilling: true,
    manageAdmins: false,
    createAdmins: false,
    deleteAdmins: false,
    manageSettings: false,
    managePlatform: false,
  },
};

// Indexes for better query performance
AdminSchema.index({ role: 1 });
AdminSchema.index({ isActive: 1 });

const Admin: Model<IAdmin> =
  mongoose.models.Admin || mongoose.model<IAdmin>("Admin", AdminSchema);

export default Admin;
