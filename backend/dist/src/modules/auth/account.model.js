"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const cartItemSchema = new mongoose_1.Schema({
    tourId: { type: String, required: true },
    quantity: { type: Number, default: 1 },
    locationFrom: { type: String },
    departureDate: { type: Date },
}, { _id: false });
const schema = new mongoose_1.Schema({
    fullName: { type: String },
    email: { type: String, required: true, unique: true },
    phone: { type: String },
    role: { type: String },
    positionCompany: { type: String },
    status: { type: String, default: "initial" },
    password: { type: String, required: true },
    avatar: { type: String },
    refreshTokenHash: { type: String },
    refreshTokenJti: { type: String },
    createdBy: { type: String },
    updatedBy: { type: String },
    slug: { type: String, unique: true },
    cart: { type: [cartItemSchema], default: [] },
    wishlist: { type: [String], default: [] },
    walletBalance: { type: Number, default: 0, min: 0 },
    deleted: { type: Boolean, default: false },
    deletedBy: { type: String },
    deletedAt: { type: Date },
}, {
    timestamps: true,
});
const AccountAdmin = mongoose_1.default.model("AccountAdmin", schema, "accounts");
exports.default = AccountAdmin;
