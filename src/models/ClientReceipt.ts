import mongoose, { Schema, Document, Model } from "mongoose";

export interface IClientReceipt extends Document {
  clientId: mongoose.Types.ObjectId;
  appointmentId: mongoose.Types.ObjectId;
  issuedAt: Date;
  amountCad: number;
  /** paid = Stripe captured; pending_transfer = Interac instructions sent */
  status: "paid" | "pending_transfer";
}

const ClientReceiptSchema = new Schema<IClientReceipt>(
  {
    clientId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    appointmentId: {
      type: Schema.Types.ObjectId,
      ref: "Appointment",
      required: true,
      unique: true,
    },
    issuedAt: { type: Date, required: true, default: Date.now },
    amountCad: { type: Number, required: true },
    status: {
      type: String,
      enum: ["paid", "pending_transfer"],
      required: true,
    },
  },
  { timestamps: true },
);

ClientReceiptSchema.index({ clientId: 1, issuedAt: -1 });

const ClientReceipt: Model<IClientReceipt> =
  mongoose.models.ClientReceipt ||
  mongoose.model<IClientReceipt>("ClientReceipt", ClientReceiptSchema);

export default ClientReceipt;
