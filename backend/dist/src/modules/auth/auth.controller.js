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
exports.refreshPost = exports.walletPayPost = exports.walletBalance = exports.uploadAvatarPost = exports.changePasswordPatch = exports.updateMePatch = exports.getMe = exports.toggleWishlist = exports.getWishlist = exports.logout = exports.resetPasswordPost = exports.resetPassword = exports.otpPasswordPost = exports.otpPassword = exports.forgotPasswordPost = exports.forgotPassword = exports.registerPost = exports.register = exports.loginPost = exports.login = void 0;
const authService = __importStar(require("./auth.service"));
const async_handler_1 = require("../../utils/async-handler");
const response_1 = require("../../utils/response");
const getCookieOptions = (maxAge) => ({
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge,
});
const login = (req, res) => {
    (0, response_1.sendSuccess)(res, "Trang đăng nhập (API)");
};
exports.login = login;
exports.loginPost = (0, async_handler_1.asyncHandler)(async (req, res) => {
    const data = await authService.login(req);
    const rememberPassword = Boolean(req.body.rememberPassword);
    res.cookie("accessToken", data.accessToken, getCookieOptions(15 * 60 * 1000));
    res.cookie("refreshToken", data.refreshToken, getCookieOptions(rememberPassword ? 30 * 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000));
    (0, response_1.sendSuccess)(res, "Đăng nhập thành công", data);
});
const register = (req, res) => {
    (0, response_1.sendSuccess)(res, "Trang đăng ký (API)");
};
exports.register = register;
exports.registerPost = (0, async_handler_1.asyncHandler)(async (req, res) => {
    const data = await authService.register(req);
    (0, response_1.sendSuccess)(res, "Đăng ký thành công", data, 201);
});
const forgotPassword = (req, res) => {
    (0, response_1.sendSuccess)(res, "Trang quên mật khẩu (API)");
};
exports.forgotPassword = forgotPassword;
exports.forgotPasswordPost = (0, async_handler_1.asyncHandler)(async (req, res) => {
    const data = await authService.forgotPassword(req);
    (0, response_1.sendSuccess)(res, "Đã gửi mã OTP đến email của bạn", data);
});
const otpPassword = (req, res) => {
    (0, response_1.sendSuccess)(res, "Trang OTP mật khẩu (API)");
};
exports.otpPassword = otpPassword;
exports.otpPasswordPost = (0, async_handler_1.asyncHandler)(async (req, res) => {
    const data = await authService.verifyOtp(req);
    // Temporary auth for reset password flow.
    res.cookie("accessToken", data.token, getCookieOptions(10 * 60 * 1000));
    (0, response_1.sendSuccess)(res, "Xác thực OTP thành công", data);
});
const resetPassword = (req, res) => {
    (0, response_1.sendSuccess)(res, "Trang đặt lại mật khẩu (API)");
};
exports.resetPassword = resetPassword;
exports.resetPasswordPost = (0, async_handler_1.asyncHandler)(async (req, res) => {
    const data = await authService.resetPassword(req);
    (0, response_1.sendSuccess)(res, "Đặt lại mật khẩu thành công", data);
});
const logout = (req, res) => {
    res.clearCookie("accessToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
    });
    res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
    });
    (0, response_1.sendSuccess)(res, "Đăng xuất thành công");
};
exports.logout = logout;
exports.getWishlist = (0, async_handler_1.asyncHandler)(async (req, res) => {
    const data = await authService.getWishlist(req);
    (0, response_1.sendSuccess)(res, "Lấy danh sách yêu thích thành công", data);
});
exports.toggleWishlist = (0, async_handler_1.asyncHandler)(async (req, res) => {
    const data = await authService.toggleWishlist(req);
    (0, response_1.sendSuccess)(res, data.action === "added" ? "Đã thêm vào danh sách yêu thích" : "Đã gỡ khỏi danh sách yêu thích", data);
});
exports.getMe = (0, async_handler_1.asyncHandler)(async (req, res) => {
    const data = await authService.getMe(req);
    (0, response_1.sendSuccess)(res, "Lấy thông tin người dùng thành công", data);
});
exports.updateMePatch = (0, async_handler_1.asyncHandler)(async (req, res) => {
    const data = await authService.updateMe(req);
    (0, response_1.sendSuccess)(res, "Cập nhật thông tin người dùng thành công", data);
});
exports.changePasswordPatch = (0, async_handler_1.asyncHandler)(async (req, res) => {
    const data = await authService.changePassword(req);
    (0, response_1.sendSuccess)(res, "Đổi mật khẩu thành công", data);
});
exports.uploadAvatarPost = (0, async_handler_1.asyncHandler)(async (req, res) => {
    const data = await authService.uploadMyAvatar(req);
    (0, response_1.sendSuccess)(res, "Tải ảnh đại diện thành công", data);
});
exports.walletBalance = (0, async_handler_1.asyncHandler)(async (req, res) => {
    const data = await authService.getWalletBalance(req);
    (0, response_1.sendSuccess)(res, "Lấy số dư tài khoản thành công", data);
});
exports.walletPayPost = (0, async_handler_1.asyncHandler)(async (req, res) => {
    const data = await authService.walletPay(req);
    (0, response_1.sendSuccess)(res, "Thanh toán thành công", data);
});
exports.refreshPost = (0, async_handler_1.asyncHandler)(async (req, res) => {
    const data = await authService.refresh(req);
    res.cookie("accessToken", data.accessToken, getCookieOptions(15 * 60 * 1000));
    res.cookie("refreshToken", data.refreshToken, getCookieOptions(30 * 24 * 60 * 60 * 1000));
    (0, response_1.sendSuccess)(res, "Làm mới token thành công", data);
});
