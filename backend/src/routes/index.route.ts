import { Router } from "express";
import authRoute from "../modules/auth/auth.route";
import dashboardRouter from "../modules/dashboard/dashboard.route";
import categoryRouter from "../modules/category/category.route";
import contactRouter from "../modules/contact/contact.route";
import searchRouter from "../modules/search/search.route";
import cartRouter from "../modules/cart/cart.route";
import orderRouter from "../modules/order/order.route";
import uploadRoutes from "../modules/upload/upload.route";
import userAdminRouter from "../modules/user/user.route";
import settingRouter from "../modules/setting/setting.route";
import { verifyToken } from "../middlewares/auth.middleware";
import { isAdmin, isClient } from "../middlewares/role.middleware";

const router = Router();

router.use("/auth", authRoute);

// Nhóm route dành cho ADMIN (cần token + role admin)
router.use("/dashboard", verifyToken, isAdmin, dashboardRouter);
router.use("/category", verifyToken, isAdmin, categoryRouter);
router.use("/setting", verifyToken, isAdmin, settingRouter);
router.use("/order", verifyToken, isAdmin, orderRouter);
router.use("/upload", verifyToken, isAdmin, uploadRoutes);
router.use("/user", verifyToken, isAdmin, userAdminRouter);

// Nhóm route dành cho CLIENT (có thể yêu cầu đăng nhập tuỳ chức năng)
router.use("/search", searchRouter);
router.use("/cart", verifyToken, isClient, cartRouter);
router.use("/order", verifyToken, isClient, orderRouter);
router.use("/contact", contactRouter);

export default router;
