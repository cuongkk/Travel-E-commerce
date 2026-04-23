"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const ai_controller_1 = require("./ai.controller");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const role_middleware_1 = require("../../middlewares/role.middleware");
const validate_middleware_1 = require("../../middlewares/validate.middleware");
const module_validation_1 = require("../../validates/module.validation");
const router = (0, express_1.Router)();
const chatbotLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 1000,
    limit: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: "Bạn đang gửi quá nhiều yêu cầu chatbot. Vui lòng thử lại sau ít phút.",
    },
});
// Endpoint được bảo vệ, chỉ Admin mới được dùng để tránh thất thoát hạn ngạch API từ public.
router.post("/generate", auth_middleware_1.verifyToken, role_middleware_1.isAdmin, ai_controller_1.generateContent);
router.post("/chatbot", chatbotLimiter, (0, validate_middleware_1.validate)({ body: module_validation_1.aiChatbotBodySchema }), ai_controller_1.chatTours);
exports.default = router;
