import mongoose, { Document, Schema } from "mongoose";

export interface IReview extends Document {
  itemId: string;
  itemType: "tour" | "gear";
  accountId: string;
  orderId?: string; // Tùy chọn, để xác thực đã mua
  rating: number;
  content: string;
  status: "active" | "hidden";
  deleted: boolean;
  deletedAt?: Date;
}

const schema = new Schema<IReview>(
  {
    itemId: { type: String, required: true },
    itemType: { type: String, enum: ["tour", "gear"], required: true },
    accountId: { type: String, ref: "AccountAdmin", required: true },
    orderId: { type: String, ref: "Order" },
    rating: { type: Number, required: true, min: 1, max: 5 },
    content: { type: String, required: true },
    status: { type: String, enum: ["active", "hidden"], default: "active" },
    deleted: { type: Boolean, default: false },
    deletedAt: { type: Date },
  },
  { timestamps: true }
);

const Review = mongoose.model<IReview>("Review", schema, "reviews");

export default Review;
