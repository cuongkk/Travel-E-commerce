import type { Types } from "mongoose";

/**
 * Query string parameters for GET `/search` (all optional).
 */
export interface SearchListQuery {
  locationFrom?: string;
  locationTo?: string;
  departureDate?: string;
  stockAdult?: string;
  stockChildren?: string;
  stockBaby?: string;
  /** Format `min-max` (e.g. price band filter). */
  price?: string;
}

/**
 * Subset of Tour fields used by search + list rendering.
 * Full schema remains in legacy `models/tour.model.js` until tour module migration.
 */
export interface ITour {
  _id: Types.ObjectId;
  name?: string;
  slug?: string;
  category?: string;
  position?: number;
  status?: string;
  deleted?: boolean;
  avatar?: string;
  images?: unknown;
  priceAdult?: number;
  priceChildren?: number;
  priceBaby?: number;
  priceNewAdult?: number;
  priceNewChildren?: number;
  priceNewBaby?: number;
  stockAdult?: number;
  stockChildren?: number;
  stockBaby?: number;
  locations?: unknown;
  time?: string;
  departureDate?: Date;
  endDate?: Date;
  information?: string;
  schedules?: unknown;
  createdBy?: string;
  updatedBy?: string;
}
