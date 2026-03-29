import type { HydratedDocument } from "mongoose";
import City from "./city.model";
import type { ICity } from "./interface";

/**
 * Loads all cities (same behavior as legacy `City.find({})`).
 */
export async function findAllCities(): Promise<HydratedDocument<ICity>[]> {
  // Cast to the wider ICity-based document type to satisfy typings.
  return City.find({}).exec() as unknown as HydratedDocument<ICity>[];
}
