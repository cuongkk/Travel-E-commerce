import path from "path";
import type { Model } from "mongoose";
import type { ITour } from "./interface";

/**
 * Search reads the `tours` collection via the existing Mongoose model registered in
 * `models/tour.model.js` (slug plugin, same collection name). Loaded by path so we do not
 * duplicate schema registration in TypeScript until the tour module is migrated.
 */
const tourModelPath = path.join(__dirname, "..", "..", "..", "..", "models", "tour.model.js");

// eslint-disable-next-line @typescript-eslint/no-require-imports -- legacy CommonJS model at project root
const Tour: Model<ITour> = require(tourModelPath) as Model<ITour>;

export { Tour };
