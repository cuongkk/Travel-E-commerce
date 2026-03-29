import { Router } from "express";
import * as authController from "./auth.controller";
import { verifyToken } from "../../middlewares/auth.middleware";

const router = Router();

router.get("/login", authController.login);
router.post("/login", authController.loginPost);

router.get("/register", authController.register);
router.post("/register", authController.registerPost);

router.get("/forgot-password", authController.forgotPassword);
router.post("/forgot-password", authController.forgotPasswordPost);

router.get("/otp-password", authController.otpPassword);
router.post("/otp-password", authController.otpPasswordPost);

router.get("/reset-password", authController.resetPassword);
router.post("/reset-password", verifyToken, authController.resetPasswordPost);

router.get("/logout", authController.logout);

export default router;
