import mongoose, { Document, Schema } from "mongoose";

export interface IJournal extends Document {
  title: string;
  summary: string;
  tag: string;
  author: string;
  dateLabel: string;
  image: string;
  avatar: string;
  trendingScore: number;
  status: "active" | "inactive";
  deleted: boolean;
  deletedBy?: string;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const schema = new Schema<IJournal>(
  {
    title: { type: String, required: true },
    summary: { type: String, required: true },
    tag: { type: String, required: true },
    author: { type: String, required: true },
    dateLabel: { type: String, required: true },
    image: { type: String, required: true },
    avatar: { type: String, required: true },
    trendingScore: { type: Number, default: 0 },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
    deleted: { type: Boolean, default: false },
    deletedBy: { type: String },
    deletedAt: { type: Date },
  },
  {
    timestamps: true,
  },
);

const Journal = mongoose.model<IJournal>("Journal", schema, "journals");

export default Journal;
