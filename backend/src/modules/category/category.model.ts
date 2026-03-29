import mongoose, { Document, Schema } from "mongoose";

export interface ICategory extends Document {
  name: string;
  parent?: string;
  position?: number;
  status?: string;
  avatar?: string;
  description?: string;
  createdBy?: string;
  updatedBy?: string;
  slug?: string;
  deleted: boolean;
  deletedBy?: string;
  deletedAt?: Date;
}

const schema = new Schema<ICategory>(
  {
    name: { type: String },
    parent: { type: String },
    position: { type: Number },
    status: { type: String },
    avatar: { type: String },
    description: { type: String },
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

const Category = mongoose.model<ICategory>("Category", schema, "categories");

export default Category;
