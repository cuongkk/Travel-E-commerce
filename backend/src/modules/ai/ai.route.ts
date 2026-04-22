import { Router } from "express";
import { generateContent } from "./ai.controller";
import { verifyToken } from "../../middlewares/auth.middleware";
import { isAdmin } from "../../middlewares/role.middleware";

const router = Router();

// Endpoint được bảo vệ, chỉ Admin mới được dùng để tránh thất thoát hạn ngạch API từ public.
router.post("/generate", verifyToken, isAdmin, generateContent);

export default router;
