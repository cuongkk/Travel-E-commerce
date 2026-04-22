import { Router } from "express";
import * as paymentController from "./payment.controller";
import { verifyToken } from "../../middlewares/auth.middleware";
import { isClient } from "../../middlewares/role.middleware";

const router = Router();

// Route tạo thanh toán (Yêu cầu đăng nhập client)
router.post("/create", verifyToken, isClient, paymentController.createZaloPayOrder);

// Route callback từ ZaloPay (Public - ZaloPay gọi sang)
router.post("/callback", paymentController.zaloPayCallback);

// Route MoMo
router.post("/create-momo", verifyToken, isClient, paymentController.createMomoOrder);
router.post("/callback-momo", paymentController.momoCallback);

// Route kiểm tra trạng thái (Yêu cầu đăng nhập)
router.get("/status/:appTransId", verifyToken, paymentController.checkZaloPayStatus);

export default router;
