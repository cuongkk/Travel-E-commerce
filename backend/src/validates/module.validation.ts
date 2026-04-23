import Joi from "joi";

const jsonArrayStringSchema = Joi.string().custom((value, helpers) => {
  try {
    const parsed = JSON.parse(value);
    if (!Array.isArray(parsed)) {
      return helpers.error("any.invalid");
    }
    return value;
  } catch (_error) {
    return helpers.error("any.invalid");
  }
}, "json array string");

const jsonArrayFieldSchema = Joi.alternatives().try(Joi.array(), jsonArrayStringSchema);

export const changeMultiBodySchema = Joi.object({
  listId: Joi.array().items(Joi.string().hex().length(24)).min(1).required(),
  option: Joi.string().trim().min(1).required(),
}).required();

export const deleteCodeBodySchema = Joi.object({
  deleteCode: Joi.string().trim().min(1).required(),
}).required();

export const cartRenderBodySchema = Joi.object({
  cart: Joi.array()
    .items(
      Joi.object({
        tourId: Joi.string().hex().length(24).required(),
        locationFrom: Joi.string().hex().length(24).required(),
        departureDate: Joi.alternatives().try(Joi.date(), Joi.string()).required(),
      }).unknown(true),
    )
    .required(),
}).required();

export const cartAddItemBodySchema = Joi.object({
  tourId: Joi.string().hex().length(24).required(),
  quantity: Joi.number().integer().min(1).default(1),
}).required();

export const cartUpdateQuantityBodySchema = Joi.object({
  quantity: Joi.number().integer().min(1).required(),
}).required();

export const cartTourIdParamSchema = Joi.object({
  tourId: Joi.string().hex().length(24).required(),
}).required();

export const revenueChartBodySchema = Joi.object({
  currentMonth: Joi.number().integer().min(1).max(12).required(),
  currentYear: Joi.number().integer().min(1970).required(),
  previousMonth: Joi.number().integer().min(1).max(12).required(),
  previousYear: Joi.number().integer().min(1970).required(),
  arrayDay: Joi.array().items(Joi.number().integer().min(1).max(31)).min(1).required(),
}).required();

export const aiChatbotBodySchema = Joi.object({
  message: Joi.string().trim().min(2).max(1000).required(),
  limit: Joi.number().integer().min(1).max(5).default(3),
}).required();

export const createTourBodySchema = Joi.object({
  name: Joi.string().trim().min(1).max(255).required(),
  category: Joi.string().trim().min(1).required(),
  status: Joi.string().trim().valid("active", "inactive").default("active"),
  position: Joi.number().min(0),
  information: Joi.string().allow(""),
  price: Joi.number().min(0),
  priceNew: Joi.number().min(0),
  stock: Joi.number().integer().min(0),
  priceAdult: Joi.number().min(0),
  priceNewAdult: Joi.number().min(0),
  stockAdult: Joi.number().integer().min(0),
  departureDate: Joi.date(),
  endDate: Joi.date(),
  locations: jsonArrayFieldSchema,
  schedules: jsonArrayFieldSchema,
}).custom((value, helpers) => {
  if (value.departureDate && value.endDate && new Date(value.endDate).getTime() < new Date(value.departureDate).getTime()) {
    return helpers.error("any.invalid");
  }
  return value;
}, "tour date range validation");

export const editTourBodySchema = Joi.object({
  name: Joi.string().trim().min(1).max(255),
  category: Joi.string().trim().min(1),
  status: Joi.string().trim().valid("active", "inactive"),
  position: Joi.number().min(0),
  information: Joi.string().allow(""),
  price: Joi.number().min(0),
  priceNew: Joi.number().min(0),
  stock: Joi.number().integer().min(0),
  priceAdult: Joi.number().min(0),
  priceNewAdult: Joi.number().min(0),
  stockAdult: Joi.number().integer().min(0),
  departureDate: Joi.date(),
  endDate: Joi.date(),
  locations: jsonArrayFieldSchema,
  schedules: jsonArrayFieldSchema,
})
  .min(1)
  .custom((value, helpers) => {
    if (value.departureDate && value.endDate && new Date(value.endDate).getTime() < new Date(value.departureDate).getTime()) {
      return helpers.error("any.invalid");
    }
    return value;
  }, "tour date range validation");
