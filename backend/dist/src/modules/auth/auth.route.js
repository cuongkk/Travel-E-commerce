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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const authController = __importStar(require("./auth.controller"));
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const validate_middleware_1 = require("../../middlewares/validate.middleware");
const cloudinary_helper_1 = require("../../utils/cloudinary.helper");
const auth_validation_1 = require("./auth.validation");
const router = (0, express_1.Router)();
const upload = (0, multer_1.default)({ storage: cloudinary_helper_1.storage });
router.get("/login", authController.login);
router.post("/login", (0, validate_middleware_1.validate)({ body: auth_validation_1.loginBodySchema }), authController.loginPost);
router.get("/register", authController.register);
router.post("/register", (0, validate_middleware_1.validate)({ body: auth_validation_1.registerBodySchema }), authController.registerPost);
router.get("/forgot-password", authController.forgotPassword);
router.post("/forgot-password", (0, validate_middleware_1.validate)({ body: auth_validation_1.forgotPasswordBodySchema }), authController.forgotPasswordPost);
router.get("/otp-password", authController.otpPassword);
router.post("/otp-password", (0, validate_middleware_1.validate)({ body: auth_validation_1.otpBodySchema }), authController.otpPasswordPost);
router.get("/reset-password", authController.resetPassword);
router.post("/reset-password", auth_middleware_1.verifyToken, (0, validate_middleware_1.validate)({ body: auth_validation_1.resetPasswordBodySchema }), authController.resetPasswordPost);
router.get("/me", auth_middleware_1.verifyToken, authController.getMe);
router.patch("/me", auth_middleware_1.verifyToken, (0, validate_middleware_1.validate)({ body: auth_validation_1.updateProfileBodySchema }), authController.updateMePatch);
router.post("/avatar/upload", auth_middleware_1.verifyToken, upload.single("avatar"), authController.uploadAvatarPost);
router.patch("/change-password", auth_middleware_1.verifyToken, (0, validate_middleware_1.validate)({ body: auth_validation_1.changePasswordBodySchema }), authController.changePasswordPatch);
router.get("/wallet/balance", auth_middleware_1.verifyToken, authController.walletBalance);
router.post("/wallet/pay", auth_middleware_1.verifyToken, (0, validate_middleware_1.validate)({ body: auth_validation_1.walletPayBodySchema }), authController.walletPayPost);
router.get("/wishlist", auth_middleware_1.verifyToken, authController.getWishlist);
router.post("/wishlist/toggle", auth_middleware_1.verifyToken, authController.toggleWishlist);
router.get("/logout", authController.logout);
router.post("/refresh", (0, validate_middleware_1.validate)({ body: auth_validation_1.refreshBodySchema }), authController.refreshPost);
exports.default = router;
