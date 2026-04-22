import mongoose, { Document, Schema } from "mongoose";

export interface IGear extends Document {
  name: string;
  category: string;
  subtitle?: string;
  description?: string;
  price: number;
  image: string;
  badge?: string;
  status: "active" | "inactive";
  rating?: number;
  reviewCount?: number;
  deleted: boolean;
  deletedBy?: string;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const schema = new Schema<IGear>(
  {
    name: { type: String, required: true },
    category: { type: String, required: true },
    subtitle: { type: String },
    description: { type: String },
    price: { type: Number, required: true },
    image: { type: String, required: true },
    badge: { type: String },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
    rating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
    deleted: { type: Boolean, default: false },
    deletedBy: { type: String },
    deletedAt: { type: Date },
  },
  {
    timestamps: true,
  },
);

const Gear = mongoose.model<IGear>("Gear", schema, "gears");

export default Gear;
