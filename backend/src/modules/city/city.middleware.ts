import type { NextFunction, Request, Response } from "express";
import { findAllCities } from "./service";

/**
 * Client layout middleware: exposes every city to Pug via `res.locals.cityList`.
 */
export async function cityListMiddleware(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const cityList = await findAllCities();
    res.locals.cityList = cityList;
    next();
  } catch (error) {
    next(error);
  }
}
