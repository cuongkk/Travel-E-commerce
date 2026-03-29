import Joi from "joi";

/**
 * No validation on the current read-only list middleware.
 * Use for future city CRUD or query params.
 */
export const cityListQuerySchema = Joi.object({}).unknown(true);
