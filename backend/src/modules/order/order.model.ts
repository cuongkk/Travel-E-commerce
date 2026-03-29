import mongoose, { Document, Schema } from "mongoose";

export interface IOrder extends Document {
  code?: string;
  fullName?: string;
  phone?: string;
  note?: string;
  items?: any[];
  subTotal?: number;
  discount?: number;
  total?: number;
  paymentMethod?: string;
  paymentStatus?: string;
  status?: string;
  updatedBy?: string;
  deleted: boolean;
  deletedBy?: string;
  deletedAt?: Date;
}

const schema = new Schema<IOrder>(
  {
    code: { type: String },
    fullName: { type: String },
    phone: { type: String },
    note: { type: String },
    items: { type: [Schema.Types.Mixed], default: [] },
    subTotal: { type: Number },
    discount: { type: Number },
    total: { type: Number },
    paymentMethod: { type: String },
    paymentStatus: { type: String },
    status: { type: String },
    updatedBy: { type: String },
    deleted: { type: Boolean, default: false },
    deletedBy: { type: String },
    deletedAt: { type: Date },
  },
  {
    timestamps: true,
  },
);

const Order = mongoose.model<IOrder>("Order", schema, "orders");

export default Order;
