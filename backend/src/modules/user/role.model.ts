import mongoose, { Document, Schema } from "mongoose";

export interface IRole extends Document {
  name: string;
  description?: string;
  permissions: string[];
  createdBy?: string;
  updatedBy?: string;
  slug?: string;
  deleted: boolean;
  deletedBy?: string;
  deletedAt?: Date;
}

const schema = new Schema<IRole>(
  {
    name: { type: String, required: true },
    description: { type: String },
    permissions: { type: [String], default: [] },
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

const Role = mongoose.model<IRole>("Role", schema, "roles");

export default Role;
