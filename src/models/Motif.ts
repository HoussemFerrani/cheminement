import mongoose, { Schema, Document, Model } from "mongoose";

export interface IMotif extends Document {
  labelFr: string;
  labelEn?: string;
  aliases: string[];
  active: boolean;
  createdBy?: mongoose.Types.ObjectId;
  updatedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const MotifSchema = new Schema<IMotif>(
  {
    labelFr: {
      type: String,
      required: [true, "Le libellé français est obligatoire"],
      trim: true,
    },
    labelEn: {
      type: String,
      trim: true,
      default: "",
    },
    aliases: {
      type: [String],
      default: [],
    },
    active: {
      type: Boolean,
      default: true,
      index: true,
    },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true },
);

MotifSchema.index({ labelFr: 1 }, { unique: true });
MotifSchema.index({ labelEn: 1 });

const Motif: Model<IMotif> =
  mongoose.models.Motif || mongoose.model<IMotif>("Motif", MotifSchema);

export default Motif;
