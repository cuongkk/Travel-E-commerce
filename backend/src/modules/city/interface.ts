import type { Types } from "mongoose";

/**
 * City document shape stored in `cities` collection (read-heavy reference data).
 */
export interface ICity {
  _id: Types.ObjectId;
  name?: string;
}
