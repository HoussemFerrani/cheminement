import mongoose, { Schema, Document, Model } from "mongoose";

export interface IReview extends Document {
  appointmentId: mongoose.Types.ObjectId;
  clientId: mongoose.Types.ObjectId;
  professionalId: mongoose.Types.ObjectId;
  rating: number; // 1-5 stars
  comment?: string;
  categories?: {
    communication: number;
    professionalism: number;
    effectiveness: number;
    punctuality: number;
  };
  isAnonymous: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema = new Schema<IReview>(
  {
    appointmentId: {
      type: Schema.Types.ObjectId,
      ref: "Appointment",
      required: true,
    },
    clientId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    professionalId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      trim: true,
    },
    categories: {
      communication: {
        type: Number,
        min: 1,
        max: 5,
      },
      professionalism: {
        type: Number,
        min: 1,
        max: 5,
      },
      effectiveness: {
        type: Number,
        min: 1,
        max: 5,
      },
      punctuality: {
        type: Number,
        min: 1,
        max: 5,
      },
    },
    isAnonymous: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

// Compound index to ensure one review per appointment
ReviewSchema.index({ appointmentId: 1 }, { unique: true });

// Index for efficient queries
ReviewSchema.index({ professionalId: 1, createdAt: -1 });
ReviewSchema.index({ clientId: 1, createdAt: -1 });

const Review: Model<IReview> = mongoose.models.Review || mongoose.model<IReview>("Review", ReviewSchema);

export default Review;