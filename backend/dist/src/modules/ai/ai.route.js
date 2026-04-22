"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ai_controller_1 = require("./ai.controller");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const role_middleware_1 = require("../../middlewares/role.middleware");
const router = (0, express_1.Router)();
// Endpoint được bảo vệ, chỉ Admin mới được dùng để tránh thất thoát hạn ngạch API từ public.
router.post("/generate", auth_middleware_1.verifyToken, role_middleware_1.isAdmin, ai_controller_1.generateContent);
exports.default = router;
