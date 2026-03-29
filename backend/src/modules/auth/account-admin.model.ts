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
  createdBy?: string;
  updatedBy?: string;
  slug?: string;
  deleted: boolean;
  deletedBy?: string;
  deletedAt?: Date;
}

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
    createdBy: { type: String },
    updatedBy: { type: String },
    slug: { type: String, unique: true },
    deleted: { type: Boolean, default: false },
    deletedBy: { type: String },
    deletedAt: { type: Date },
  },
  {
    timestamps: true,
  },
);

const AccountAdmin = mongoose.model<IAccountAdmin>("AccountAdmin", schema, "accounts_admin");

export default AccountAdmin;
