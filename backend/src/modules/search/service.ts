import type { HydratedDocument } from "mongoose";
import moment from "moment";
import slugify from "slugify";
import { Tour } from "./model";
import type { ITour, SearchListQuery } from "./interface";

export type TourSearchRow = HydratedDocument<ITour> & {
  departureDateFormat?: string;
};

/** Mongo filter shape for tour search (matches legacy controller behavior). */
export type TourSearchFilter = {
  status: string;
  deleted: boolean;
  locations?: string;
  slug?: RegExp;
  departureDate?: Date;
  stockAdult?: { $gte: number };
  stockChildren?: { $gte: number };
  stockBaby?: { $gte: number };
  priceNewAdult?: { $gte: number; $lte: number };
};

/**
 * Builds the Mongo filter for tour search — logic preserved from legacy `search.controller.js`.
 */
export function buildTourSearchFilter(query: SearchListQuery): TourSearchFilter {
  const find: TourSearchFilter = {
    status: "active",
    deleted: false,
  };

  if (query.locationFrom) {
    find.locations = query.locationFrom;
  }

  if (query.locationTo) {
    const keyword = slugify(query.locationTo, { lower: true });
    const keywordRegex = new RegExp(keyword);
    find.slug = keywordRegex;
  }

  if (query.departureDate) {
    find.departureDate = new Date(query.departureDate);
  }

  if (query.stockAdult) {
    find.stockAdult = { $gte: parseInt(query.stockAdult, 10) };
  }

  if (query.stockChildren) {
    find.stockChildren = { $gte: parseInt(query.stockChildren, 10) };
  }

  if (query.stockBaby) {
    find.stockBaby = { $gte: parseInt(query.stockBaby, 10) };
  }

  if (query.price) {
    const [priceMin, priceMax] = query.price.split("-");
    find.priceNewAdult = {
      $gte: parseInt(priceMin, 10),
      $lte: parseInt(priceMax, 10),
    };
  }

  return find;
}

/**
 * Runs the search query and attaches `departureDateFormat` for Pug (same as legacy loop).
 */
export async function searchToursForView(query: SearchListQuery): Promise<TourSearchRow[]> {
  const find = buildTourSearchFilter(query);
  const tourList = await Tour.find(find).sort({ createdAt: "desc" }).exec();
  const rows = tourList as TourSearchRow[];

  for (const item of rows) {
    if (item.departureDate) {
      item.departureDateFormat = moment(item.departureDate).format("DD/MM/YYYY");
    }
  }

  return rows;
}
