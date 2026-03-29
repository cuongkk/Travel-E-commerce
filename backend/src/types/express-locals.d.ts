import type { HydratedDocument } from "mongoose";
import type { ICity } from "../modules/city/interface";

declare global {
  namespace Express {
    interface Locals {
      /** Populated by `cityListMiddleware` for all client routes. */
      cityList: HydratedDocument<ICity>[];
    }
  }
}

export {};
