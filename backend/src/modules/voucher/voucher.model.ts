import mongoose, { Document, Schema } from "mongoose";

export interface IVoucher extends Document {
  code: string;
  name: string;
  discountType: "percent" | "fixed";
  discountValue: number;
  minOrderValue?: number;
  maxUsage?: number;
  usedCount?: number;
  expiresAt: Date;
  status: "active" | "inactive";
  deleted: boolean;
  deletedBy?: string;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const schema = new Schema<IVoucher>(
  {
    code: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    discountType: { type: String, enum: ["percent", "fixed"], required: true },
    discountValue: { type: Number, required: true },
    minOrderValue: { type: Number, default: 0 },
    maxUsage: { type: Number, default: null },
    usedCount: { type: Number, default: 0 },
    expiresAt: { type: Date, required: true },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
    deleted: { type: Boolean, default: false },
    deletedBy: { type: String },
    deletedAt: { type: Date },
  },
  {
    timestamps: true,
  },
);

const Voucher = mongoose.model<IVoucher>("Voucher", schema, "vouchers");

export default Voucher;
