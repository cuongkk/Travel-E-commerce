"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.editTourBodySchema = exports.createTourBodySchema = exports.aiChatbotBodySchema = exports.revenueChartBodySchema = exports.cartTourIdParamSchema = exports.cartUpdateQuantityBodySchema = exports.cartAddItemBodySchema = exports.cartRenderBodySchema = exports.deleteCodeBodySchema = exports.changeMultiBodySchema = void 0;
const joi_1 = __importDefault(require("joi"));
const jsonArrayStringSchema = joi_1.default.string().custom((value, helpers) => {
    try {
        const parsed = JSON.parse(value);
        if (!Array.isArray(parsed)) {
            return helpers.error("any.invalid");
        }
        return value;
    }
    catch (_error) {
        return helpers.error("any.invalid");
    }
}, "json array string");
const jsonArrayFieldSchema = joi_1.default.alternatives().try(joi_1.default.array(), jsonArrayStringSchema);
exports.changeMultiBodySchema = joi_1.default.object({
    listId: joi_1.default.array().items(joi_1.default.string().hex().length(24)).min(1).required(),
    option: joi_1.default.string().trim().min(1).required(),
}).required();
exports.deleteCodeBodySchema = joi_1.default.object({
    deleteCode: joi_1.default.string().trim().min(1).required(),
}).required();
exports.cartRenderBodySchema = joi_1.default.object({
    cart: joi_1.default.array()
        .items(joi_1.default.object({
        tourId: joi_1.default.string().hex().length(24).required(),
        locationFrom: joi_1.default.string().hex().length(24).required(),
        departureDate: joi_1.default.alternatives().try(joi_1.default.date(), joi_1.default.string()).required(),
    }).unknown(true))
        .required(),
}).required();
exports.cartAddItemBodySchema = joi_1.default.object({
    tourId: joi_1.default.string().hex().length(24).required(),
    quantity: joi_1.default.number().integer().min(1).default(1),
}).required();
exports.cartUpdateQuantityBodySchema = joi_1.default.object({
    quantity: joi_1.default.number().integer().min(1).required(),
}).required();
exports.cartTourIdParamSchema = joi_1.default.object({
    tourId: joi_1.default.string().hex().length(24).required(),
}).required();
exports.revenueChartBodySchema = joi_1.default.object({
    currentMonth: joi_1.default.number().integer().min(1).max(12).required(),
    currentYear: joi_1.default.number().integer().min(1970).required(),
    previousMonth: joi_1.default.number().integer().min(1).max(12).required(),
    previousYear: joi_1.default.number().integer().min(1970).required(),
    arrayDay: joi_1.default.array().items(joi_1.default.number().integer().min(1).max(31)).min(1).required(),
}).required();
exports.aiChatbotBodySchema = joi_1.default.object({
    message: joi_1.default.string().trim().min(2).max(1000).required(),
    limit: joi_1.default.number().integer().min(1).max(5).default(3),
}).required();
exports.createTourBodySchema = joi_1.default.object({
    name: joi_1.default.string().trim().min(1).max(255).required(),
    category: joi_1.default.string().trim().min(1).required(),
    status: joi_1.default.string().trim().valid("active", "inactive").default("active"),
    position: joi_1.default.number().min(0),
    information: joi_1.default.string().allow(""),
    price: joi_1.default.number().min(0),
    priceNew: joi_1.default.number().min(0),
    stock: joi_1.default.number().integer().min(0),
    priceAdult: joi_1.default.number().min(0),
    priceNewAdult: joi_1.default.number().min(0),
    stockAdult: joi_1.default.number().integer().min(0),
    departureDate: joi_1.default.date(),
    endDate: joi_1.default.date(),
    locations: jsonArrayFieldSchema,
    schedules: jsonArrayFieldSchema,
}).custom((value, helpers) => {
    if (value.departureDate && value.endDate && new Date(value.endDate).getTime() < new Date(value.departureDate).getTime()) {
        return helpers.error("any.invalid");
    }
    return value;
}, "tour date range validation");
exports.editTourBodySchema = joi_1.default.object({
    name: joi_1.default.string().trim().min(1).max(255),
    category: joi_1.default.string().trim().min(1),
    status: joi_1.default.string().trim().valid("active", "inactive"),
    position: joi_1.default.number().min(0),
    information: joi_1.default.string().allow(""),
    price: joi_1.default.number().min(0),
    priceNew: joi_1.default.number().min(0),
    stock: joi_1.default.number().integer().min(0),
    priceAdult: joi_1.default.number().min(0),
    priceNewAdult: joi_1.default.number().min(0),
    stockAdult: joi_1.default.number().integer().min(0),
    departureDate: joi_1.default.date(),
    endDate: joi_1.default.date(),
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
