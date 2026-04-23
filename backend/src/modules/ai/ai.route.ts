import { Router } from "express";
import rateLimit from "express-rate-limit";
import { chatTours, generateContent } from "./ai.controller";
import { verifyToken } from "../../middlewares/auth.middleware";
import { isAdmin } from "../../middlewares/role.middleware";
import { validate } from "../../middlewares/validate.middleware";
import { aiChatbotBodySchema } from "../../validates/module.validation";

const router = Router();
const chatbotLimiter = rateLimit({
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
router.post("/generate", verifyToken, isAdmin, generateContent);
router.post("/chatbot", chatbotLimiter, validate({ body: aiChatbotBodySchema }), chatTours);

export default router;
