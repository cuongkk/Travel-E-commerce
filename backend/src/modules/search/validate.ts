import type { Request } from "express";
import type { SearchListQuery } from "./interface";

function firstString(value: unknown): string | undefined {
  if (typeof value === "string") {
    return value;
  }
  if (Array.isArray(value) && value.length > 0 && typeof value[0] === "string") {
    return value[0];
  }
  return undefined;
}

/**
 * Normalizes `req.query` into `SearchListQuery` (same keys the legacy controller read).
 */
export function parseSearchListQuery(query: Request["query"]): SearchListQuery {
  return {
    locationFrom: firstString(query.locationFrom),
    locationTo: firstString(query.locationTo),
    departureDate: firstString(query.departureDate),
    stockAdult: firstString(query.stockAdult),
    stockChildren: firstString(query.stockChildren),
    stockBaby: firstString(query.stockBaby),
    price: firstString(query.price),
  };
}
