import mongoose, { Schema, Document, Model } from "mongoose";

export interface IResource extends Document {
  title: string;
  description: string;
  type: "ebook" | "video" | "course" | "worksheet" | "guide" | "tool";
  category: string;
  price: number;
  currency: string;
  fileUrl?: string; // For downloadable resources
  contentUrl?: string; // For hosted content
  previewUrl?: string; // Preview/thumbnail
  tags: string[];
  isActive: boolean;
  createdBy: mongoose.Types.ObjectId; // Admin who created it
  createdAt: Date;
  updatedAt: Date;
}

export interface IResourcePurchase extends Document {
  resourceId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId; // Client who purchased
  price: number; // Price at time of purchase
  currency: string;
  paymentStatus: "pending" | "completed" | "failed" | "refunded";
  stripePaymentIntentId?: string;
  accessGranted: boolean;
  downloadedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ResourceSchema = new Schema<IResource>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["ebook", "video", "course", "worksheet", "guide", "tool"],
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: "usd",
    },
    fileUrl: String,
    contentUrl: String,
    previewUrl: String,
    tags: [{
      type: String,
      trim: true,
    }],
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

const ResourcePurchaseSchema = new Schema<IResourcePurchase>(
  {
    resourceId: {
      type: Schema.Types.ObjectId,
      ref: "Resource",
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: "usd",
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "completed", "failed", "refunded"],
      default: "pending",
    },
    stripePaymentIntentId: String,
    accessGranted: {
      type: Boolean,
      default: false,
    },
    downloadedAt: Date,
  },
  {
    timestamps: true,
  },
);

// Indexes
ResourceSchema.index({ type: 1, category: 1, isActive: 1 });
ResourceSchema.index({ tags: 1 });
ResourcePurchaseSchema.index({ userId: 1, createdAt: -1 });
ResourcePurchaseSchema.index({ resourceId: 1, paymentStatus: 1 });

const Resource: Model<IResource> = mongoose.models.Resource ||
  mongoose.model<IResource>("Resource", ResourceSchema);

const ResourcePurchase: Model<IResourcePurchase> = mongoose.models.ResourcePurchase ||
  mongoose.model<IResourcePurchase>("ResourcePurchase", ResourcePurchaseSchema);

export { Resource, ResourcePurchase };
export default Resource;