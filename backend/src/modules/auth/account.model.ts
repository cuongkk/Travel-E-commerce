import mongoose, { Document, Schema } from "mongoose";

export interface IAccountAdmin extends Document {
  fullName?: string;
  email: string;
  phone?: string;
  role?: string;
  positionCompany?: string;
  status: string;
  password: string;
  avatar?: string;
  refreshTokenHash?: string;
  refreshTokenJti?: string;
  createdBy?: string;
  updatedBy?: string;
  slug?: string;
  deleted: boolean;
  deletedBy?: string;
  deletedAt?: Date;
  cart?: {
    tourId: string;
    quantity: number;
    locationFrom?: string;
    departureDate?: Date;
  }[];
  wishlist?: string[];
  walletBalance?: number;
}

const cartItemSchema = new Schema(
  {
    tourId: { type: String, required: true },
    quantity: { type: Number, default: 1 },
    locationFrom: { type: String },
    departureDate: { type: Date },
  },
  { _id: false },
);

const schema = new Schema<IAccountAdmin>(
  {
    fullName: { type: String },
    email: { type: String, required: true, unique: true },
    phone: { type: String },
    role: { type: String },
    positionCompany: { type: String },
    status: { type: String, default: "initial" },
    password: { type: String, required: true },
    avatar: { type: String },
    refreshTokenHash: { type: String },
    refreshTokenJti: { type: String },
    createdBy: { type: String },
    updatedBy: { type: String },
    slug: { type: String, unique: true },
    cart: { type: [cartItemSchema], default: [] },
    wishlist: { type: [String], default: [] },
    walletBalance: { type: Number, default: 0, min: 0 },
    deleted: { type: Boolean, default: false },
    deletedBy: { type: String },
    deletedAt: { type: Date },
  },
  {
    timestamps: true,
  },
);

const AccountAdmin = mongoose.model<IAccountAdmin>("AccountAdmin", schema, "accounts");

export default AccountAdmin;
