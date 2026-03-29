import mongoose, { Document, Schema } from "mongoose";

export interface ITour extends Document {
  name: string;
  category?: string;
  position?: number;
  status?: string;
  avatar?: string;
  images?: string[];
  priceAdult?: number;
  priceChildren?: number;
  priceBaby?: number;
  priceNewAdult?: number;
  priceNewChildren?: number;
  priceNewBaby?: number;
  stockAdult?: number;
  stockChildren?: number;
  stockBaby?: number;
  locations?: any[];
  time?: string;
  departureDate?: Date;
  endDate?: Date;
  information?: string;
  schedules?: any[];
  createdBy?: string;
  updatedBy?: string;
  slug?: string;
  deleted: boolean;
  deletedBy?: string;
  deletedAt?: Date;
}

const schema = new Schema<ITour>(
  {
    name: { type: String },
    category: { type: String },
    position: { type: Number },
    status: { type: String },
    avatar: { type: String },
    images: { type: [String], default: [] },
    priceAdult: { type: Number },
    priceChildren: { type: Number },
    priceBaby: { type: Number },
    priceNewAdult: { type: Number },
    priceNewChildren: { type: Number },
    priceNewBaby: { type: Number },
    stockAdult: { type: Number },
    stockChildren: { type: Number },
    stockBaby: { type: Number },
    locations: { type: [Schema.Types.Mixed], default: [] },
    time: { type: String },
    departureDate: { type: Date },
    endDate: { type: Date },
    information: { type: String },
    schedules: { type: [Schema.Types.Mixed], default: [] },
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

const Tour = mongoose.model<ITour>("Tour", schema, "tours");

export default Tour;
